const Playlist = require('../models/playlist.model')
const asyncHandler = require('../utils/asyncHandler')
const { default: mongoose } = require('mongoose')


module.exports = {
    createPlaylist: asyncHandler(async (req, res) => {
        const { user } = req

        if (!user) {
            throw {
                status: 400,
                message: 'invalid access'
            }
        }

        const { name, description } = req.body


        if (!name || !description) {
            throw {
                status: 400,
                message: 'required fields cannot be empty'
            }
        }


        const newPlaylist = await Playlist.create({
            name,
            description,
            owner: user._id
        })
        // console.log(user)
        // console.log(user._id)
        console.log(newPlaylist)
        res.status(200).send({
            message: 'playlist is made',
            newPlaylist,


        })
    }),
    deletePlaylist: asyncHandler(async (req, res, next) => {
        const { playlistid } = req.params
        console.log('inside delete Playlist')
        const checkPlaylist = await Playlist.findById(playlistid)
        if (!checkPlaylist) {
            throw {
                status: 400,
                message: 'this playlist does not exist in database'
            }
        }

        if (!playlistid) {
            throw {
                status: 400,
                message: 'playlistid is not given'
            }
        }
        await Playlist.deleteOne({ _id: playlistid })
        res.status(200).send({ message: 'playlist is deleted' })

    }),
    getUserPlaylists: asyncHandler(async (req, res, next) => {
        const { userid } = req.params
        console.log('inside getUserPlaylist')



        if (!userid) {
            throw {
                status: 400,
                message: 'userid is not given'
            }
        }

        const allPlaylits = await Playlist.aggregate(
            [
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userid)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: 'owner',
                        foreignField: "_id",
                        as: "owner"


                    }
                },
                {
                    $lookup: {
                        from: "videos",
                        localField: 'videos',
                        foreignField: "_id",
                        as: "videos",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "users",
                                    localField: 'owner',
                                    foreignField: "_id",
                                    as: "owner",
                                    pipeline: [
                                        {
                                            $project: {
                                                userName: 1,
                                                fullName: 1,
                                                avatar: 1
                                            }
                                        }
                                    ]
                                }
                            }
                        ]


                    }
                },
            ]
        )

        if (!allPlaylits) {
            throw {
                status: 400,
                message: 'something went wrong during geting playlist from database'
            }
        }
        console.log(allPlaylits)
        res.status(200).send(allPlaylits)

    }),
    addVideoToPlaylist: asyncHandler(async (req, res) => {
        const { user } = req
        console.log('inside addPlayist')

        if (!user) {
            throw {
                status: 200, message: "invaild access"
            }
        }
        const { playlistid, videoid } = req.params

        if (!playlistid || !videoid) {
            throw {
                status: 400,
                message: 'playlistid and videoid is required'
            }
        }
        const checkPlaylist = await Playlist.findById(playlistid)
        console.log(checkPlaylist)

        if (!checkPlaylist) {
            throw {
                status: 400,
                message: 'this playlist does not exist in the database'
            }
        }
        for (let i = 0; i < checkPlaylist.videos.length; i++) {
            console.log(checkPlaylist.videos.length)
            console.log(i)
            if (checkPlaylist.videos[i] == videoid) {

                throw {
                    status: 400,
                    message: 'this video is already in database'
                }
            }
        }

        console.log('here')

        const checkAfterPlaylist = await Playlist.findByIdAndUpdate(playlistid,
            {
                $push: {
                    videos: videoid
                }

            },
            {
                new: true
            }
        )
        console.log(checkAfterPlaylist)


        console.log('video is addied to playlist')
        res.status(200).send('video is add to playlist')
    }),
    getPlaylistById: asyncHandler(async (req, res) => {
        const { playlistid } = req.params
        // console.log('done')

        if (!playlistid) {
            throw {
                status: 400,
                message: 'playlistid is not given'
            }
        }
        // console.log('done')


        const playlist = await Playlist.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(playlistid)
                    }
                },
                {
                    $lookup: {
                        from: "videos",
                        localField: 'videos',
                        foreignField: "_id",
                        as: "videos",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "users",
                                    localField: 'owner',
                                    foreignField: "_id",
                                    as: "owner",
                                    pipeline: [
                                        {
                                            $project: {
                                                userName: 1,
                                                fullName: 1,
                                                avatar: 1
                                            }
                                        }
                                    ]
                                }
                            }
                        ]


                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: 'owner',
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    avatar: 1,
                                    userName: 1
                                }

                            }
                        ]
                    }
                }
            ])
        // console.log(playlist)
        if (!playlist) {
            throw {
                status: 400,
                message: 'playlist is not in database'
            }
        }
        res.status(200).send(playlist)
    }),
    removeVideoFromPlaylist: asyncHandler(async (req, res) => {
        const { user } = req
        console.log('inside removePlayist')

        if (!user) {
            throw {
                status: 400, message: 'invailed access'
            }
        }
        const { playlistid, videoid } = req.params
        console.log(videoid)

        if (!playlistid || !videoid) {
            throw {
                status: 400,
                message: 'playlistid and videoid is required'
            }
        }
        const checkPlaylist = await Playlist.findById(playlistid)

        // console.log(checkPlaylist)

        if (!checkPlaylist) {
            throw {
                status: 400,
                message: 'this playlist does not exist in the database'
            }
        }
        // console.log(checkPlaylist)
        // for (let i = 0; i < checkPlaylist.videos.length; i++) {
        //     console.log(checkPlaylist.videos.length)
        //     if (checkPlaylist.videos[i] != videoid) {

        //         throw {
        //             status: 400,
        //             message: 'this video is not present in database'
        //         }
        //     }
        // }



        const checkAfterPlaylist = await Playlist.findByIdAndUpdate(playlistid,
            {
                $pull: {
                    videos: videoid
                }

            },
            {
                new: true
            }
        )
        // console.log(checkPlaylist)
        // console.log(checkAfterPlaylist)
        if (checkAfterPlaylist.videos.length == checkPlaylist.videos.length) {
            throw {
                status: 400,

                message: 'video is not present in database'
            }
        }

        // if (!checkAfterPlaylist) {
        //     throw {
        //         status: 400,
        //         message: 'playlistid and videoid is required'
        //     }
        // }


        console.log('video is remove from playlist')
        res.status(200).send('video is remove from playlist')
    }),
    updatePlaylist: asyncHandler(async (req, res) => {
        const { playlistid } = req.params
        const { name, description } = req.body

        if (!playlistid) {
            throw {
                status: 400,
                message: 'playlist id is not given'
            }

        }
        if (!name || !description) {
            throw {
                status: 400,
                message: 'required fields cannot be empty'
            }

        }


        const playlist = await Playlist.findById(playlistid)

        if (!playlist) {
            throw {
                status: 400,
                message: 'this playlist does exist'
            }

        }

        const updatePlaylist = await Playlist.findByIdAndUpdate(playlist, {
            $set: {
                name, description
            }
        },
            {
                new: true
            }
        )

        console.log(updatePlaylist)
        if (!updatePlaylist) {
            throw {
                status: 400,
                message: 'playlist is not updated'
            }

        }
        res.status(200).send(updatePlaylist)


    })



}