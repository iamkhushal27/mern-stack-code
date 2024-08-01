const fileUploder = require('../utils/cloudanary')
const asyncHandler = require('../utils/asyncHandler')
const Video = require('../models/video.model')
const { default: mongoose } = require('mongoose')

module.exports = {
    publishVideo: asyncHandler(async (req, res, next) => {
        const { user } = req
        console.log(user)
        console.log(req.cookies)
        const videoLocalPath = req.files?.videoFile[0].path
        const thumbnailLocalPath = req.files?.thumbnail[0].path
        const { title, description, isPublished } = req.body
        if (!videoLocalPath || !thumbnailLocalPath) {
            throw {
                status: 400,
                message: 'something went wrong during file uploading'
            }
        }
        if (!title || !description) {
            throw {
                status: 400,
                message: 'required Fields cannot be empty'
            }
        }
        const videoFile = await fileUploder(videoLocalPath)
        const duration = videoFile.duration
        console.log(duration)
        console.log(videoFile)
        const thumbnail = await fileUploder(thumbnailLocalPath)
        if (!videoFile || !thumbnail) {
            throw {
                status: 400,
                message: 'something went wrong during file uploading on cloudinary'
            }
        }
        console.log(description, duration, title)



        const video = await Video.create({
            videoFile: videoFile?.url,
            thumbnail: thumbnail?.url,
            title,
            description,
            duration,
            owner: user?._id,
            isPublished




        })
        res.status(200).send(video)


    }),
    updateVideo: asyncHandler(async (req, res, next) => {
        const { videoid } = req.params
        console.log(req.file)
        const thumbnailLocalPath = req.file?.path
        const { description, title } = req.body
        const { user } = req
        if (!thumbnailLocalPath) {
            throw {
                status: 400,
                message: 'thubniail is required'
            }
        }
        if (!description || !title) {
            throw {
                status: 400,
                message: 'required fields cannot be empty'
            }
        }
        if (!user) {
            throw {
                status: 400,
                message: 'unothrized access'
            }
        }
        const thumbnail = await fileUploder(thumbnailLocalPath)
        if (!thumbnail) {
            throw {
                status: 400,
                message: 'something went wrong during file uploading in cloudinary'
            }
        }

        console.log('nice man')

        const updatevideo = await Video.findByIdAndUpdate(videoid, {
            $set: {
                thumbnail: thumbnail?.url,
                title, description


            }
        },
            {
                new: true
            }
        )
        if (!updatevideo) {
            throw {
                status: 400,
                message: 'something went wrong duting updating a video details'
            }
        }
        console.log(updatevideo)
        res.status(200).send('video details is updated')

    }),
    deleteVideo: asyncHandler(async (req, res, next) => {
        const { videoid } = req.params

        if (!videoid) {
            throw {
                status: 400,
                message: 'videoid is not given'
            }
        }
        const checkVideo=await Video.findById(videoid)
        if (!checkVideo) {
            throw {
                status: 400,
                message: 'this video does not exist in database'
            }
        }
        await Video.deleteOne({_id:videoid})
        res.status(200).send({ message: 'video is deleted' })

    }),
    getSingleVideo: asyncHandler(async (req, res) => {
        const { videoid } = req.params
        let video = await Video.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(videoid)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [{
                            $project: {
                                userName: 1,
                                fullName: 1
                            }
                        }]
                    }
                },
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }

            ]
        )
        res.status(200).send(video)
    }),
    getAllVideos: asyncHandler(async (req, res, next) => {
        let page = Number(req.query?.page) || 0
        let limit = Number(req.query?.limit) || 2
        // console.log(page,limit)
        // console.log(req.query)
        let videos = await Video.aggregate(
            [
                {
                    $lookup: {
                        from: 'users',
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [{
                            $project: {
                                userName: 1,
                                fullName: 1
                            }
                        }]
                    }
                },
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }

            ]
        )//.skip(page * limit).limit(limit)
        // const videos=await Video.find()
        res.status(200).send(videos)

    }),
    videoStatus: asyncHandler(async (req, res) => {
        const { videoid } = req.params
        const { isPublished } = req.body
        const statusOfVidoe = await Video.findById(videoid)
        console.log(statusOfVidoe)
        if (!statusOfVidoe) {
            throw {
                status: 400,
                Message: 'something went wrong during geting the video'
            }
        }
        if (statusOfVidoe.isPublished != "true") {
            console.log('inside')
            await Video.findByIdAndUpdate(videoid, {
                isPublished: isPublished

            }, {
                new: true
            })
        }
        if (statusOfVidoe.isPublished != "false") {
            await Video.findByIdAndUpdate(videoid, {
                isPublished

            }, {
                new: true
            })
        }
        res.status(200).send('status is updated')
    })




}

