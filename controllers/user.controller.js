const User = require('../models/user.model')
const { use } = require('../routes/user.Routes')
const asyncHandler = require('../utils/asyncHandler')
const fileUploder = require('../utils/cloudanary')
const jwt = require('jsonwebtoken')
// require('dotenv').config()


// console.log(fileUploder())
async function generateAccsessTokenRefreshToken(UserId) {
    try {

        const user = await User.findById(UserId)
        const accessToken = await user.generateAccessToken()
        console.log(accessToken)
        const refreshToken = await user.generateRefreshToken()
        console.log(refreshToken)

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw {
            status: 400,
            message: 'something went wrong while generating tokens'
        }
    }

}

module.exports = {

    userRigistration: asyncHandler(async (req, res, next) => {

        // check the data is coming from fronten
        //check the avatar weather user is sending or not 
        //check the email wheathe it is already exist or not
        // avatar is uploaded on cloudanary check 
        //create user
        //remove the password from user
        //res send to fronten

        const { userName, email, fullName, password } = req.body

        if (!userName || !email || !fullName || !password) {
            throw {
                status: 400,
                message: 'required fields cannot be empty'
            }
        }
        console.log(req.files)
        let coverImagelocalPath

        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImagelocalPath = req.files.coverImage[0].path


        }
        console.log(req.files)
        const avatarlocalPath = req.files?.avatar[0]?.path
        // console.log(avatarlocalPath)

        // console.log(avatarlocalPath)

        // console.log(coverImagelocalPath)

        if (!avatarlocalPath) {
            throw {
                status: 400,
                message: 'avatar file is required'
            }
        }

        const existenceUser = await User.findOne({
            $or: [{ userName }, { email }]
        }

        )

        if (existenceUser) {

            throw {
                status: 400,
                message: 'user with email or userName already exist'
            }
        }

        const avatar = await fileUploder(avatarlocalPath)
        console.log(1, avatar)
        const coverImage = await fileUploder(coverImagelocalPath)
        console.log(coverImage)

        console.log(avatar.url)
        // console.log(coverImage)

        const user = await User.create({
            userName,
            email,
            fullName,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || " "

        })

        const createdUser = await User.findById(user._id).select('-password -refreshToken')
        console.log(createdUser)

        if (!createdUser) {
            throw {
                status: 400,
                message: "something went wrong while registring file"
            }
        }

        res.status(200).json({
            createdUser,
            message: 'User is success fully register'
        }

        )
    }),

    loginUser: asyncHandler(async (req, res, next) => {
        const { userName, email, password } = req.body
        console.log(email)
        if (!(userName || email)) {

            throw {
                status: 400,
                message: 'email or userName is required'
            }
        }

        const user = await User.findOne({
            $or: [{ email }, { userName }]
        })
        if (!user) {
            throw {
                status: 400,
                message: 'user is not getting'
            }
        }

        const UserPasswordCheck = await user.isPasswordCorrect(password)
        if (!UserPasswordCheck) {
            throw {
                status: 400,
                message: 'password is incorrect'
            }
        }
        const { accessToken, refreshToken } = await generateAccsessTokenRefreshToken(user._id)
        console.log(accessToken, refreshToken)

        const options = {
            httpOnly: true,
            secure: true

        }
        // console.log(accsessToken)
        res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options).
            send({ message: 'user is sucsess fully login' })
    }),

    logout: asyncHandler(async (req, res, next) => {
        const { _id } = req.user
        await User.findByIdAndUpdate(_id, {

            $set: {
                refreshToken: undefined
            }
        },
            {
                new: true
            }
        )
        const options = {
            httpOnly: true,
            secure: true

        }

        res.status(200).clearCookie('accessToken', options)
            .clearCookie('refreshToken', options).
            send('user is successfully logout')

    }),

    regenerateAccessToken: asyncHandler(async (req, res, next) => {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
        // console.log(incomingRefreshToken)
        // console.log('2')

        if (!incomingRefreshToken) {
            throw {
                status: 400,
                message: 'unothrized access'
            }
        }

        const decodedtoken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        // console.log(decodedtoken)

        if (!decodedtoken) {
            throw {
                status: 400,
                message: 'unothorized access'
            }
        }

        const user = await User.findById(decodedtoken._id)
        // console.log(user)

        if (!user) {
            throw {
                status: 400,
                message: 'in finding user something went wrong'
            }
        }

        if (incomingRefreshToken != user?.refreshToken) {
            throw {
                status: 400,
                message: 'unothorized access'
            }
        }

        const { accessToken, refreshToken } = await generateAccsessTokenRefreshToken(user._id)
        // console.log(accessToken, refreshToken)
        // console.log('after')

        if (!accessToken || !refreshToken) {
            throw {
                status: 400,
                message: 'something went worng during generating tokens'
            }
        }

        const options = {
            httpOnly: true,
            secure: true

        }

        res.status(200).cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options).send({
                accessToken, refreshToken
            })

    }),
    updatePassword: asyncHandler(async (req, res, next) => {
        // const { _id } = req.user

        const { oldPassword, newPassword } = req.body
        if (!oldPassword || !newPassword) {
            throw {
                status: 400,
                message: 'required fields cannot be empty'
            }
        }
        if (oldPassword == newPassword) {
            throw {
                status: 400,
                message: 'oldPassword and newPassword must be diffrenet'
            }
        }
        const { user } = req
        console.log(user)
        const newuser = await User.findById(user._id)
        console.log(newuser)
        console.log(oldPassword)
        const passwrodCheck = await newuser.isPasswordCorrect(oldPassword)
        console.log(passwrodCheck)
        if (!passwrodCheck) {
            throw {
                status: 400,
                message: 'password is incorrect'
            }
        }

        newuser.password = newPassword
        newuser.save({ validateBeforeSave: false })


        // if (!passwordUpdate) {
        //     throw {
        //         status: 400,
        //         message: 'something went wrong during updating password'
        //     }
        // }

        res.status(200).send('password is updated successfully')


    }),
    updateUserName: asyncHandler(async (req, res, next) => {
        // const { _id } = req.user
        const { user } = req
        console.log(user)
        if (!user) {
            throw {
                status: 400,
                message: 'user is not authenticate'
            }
        }
        const { newUserName } = req.body
        if (!newUserName) {
            throw {
                status: 400,
                message: 'required fields cannot be empty'
            }
        }
        if (user.userName == newUserName) {
            throw {
                status: 400,
                message: 'userName and newUserName must be diffrenet'
            }
        }
        const indatabaseUser = await User.findOne({ userName: newUserName })
        if (indatabaseUser) {
            throw {
                status: 400,
                message: 'this userName is already in use try newone'
            }
        }
        const updateUser = await User.findByIdAndUpdate(user._id, {
            $set: {
                userName: newUserName
            }
        },
            {
                new: true
            })
        if (!updateUser) {
            throw {
                status: 400,
                message: 'something went worng during updating UserName'
            }
        }

        res.status(200).send({
            message: "Username of user is updated",
            updateUser
        }

        )



    }),
    updateFullName: asyncHandler(async (req, res, next) => {
        // const { _id } = req.user
        const { user } = req
        console.log(user)
        if (!user) {
            throw {
                status: 400,
                message: 'user is not authenticate'
            }
        }
        const { newFullName } = req.body
        if (!newFullName) {
            throw {
                status: 400,
                message: 'required fields cannot be empty'
            }
        }
        if (user.fullName == newFullName) {
            throw {
                status: 400,
                message: 'fullName and newfullName must be diffrenet'
            }
        }
        // const indatabaseUser=await User.findOne({userName:newUserName})
        // if (indatabaseUser) {
        //     throw {
        //         status: 400,
        //         message: 'this userName is already in use try newone'
        //     }
        // }
        const updateUser = await User.findByIdAndUpdate(user._id, {
            $set: {
                fullName: newFullName
            }
        },
            {
                new: true
            })
        if (!updateUser) {
            throw {
                status: 400,
                message: 'something went worng during updating fullName'
            }
        }


        res.status(200).send({
            message: "fullname of user is updated",
            updateUser
        })
    }),
    updateavatar: asyncHandler(async (req, res, next) => {
        // const { _id } = req.user

        const { user } = req
        console.log(user)
        if (!user) {
            throw {
                status: 400,
                message: 'user is not authenticate'
            }
        }
        const avatarlocalpath = req.file?.path
        if (!avatarlocalpath) {
            throw {
                status: 400,
                message: 'avatar field cannot be empty'
            }
        }
        const avatar = await fileUploder(avatarlocalpath)

        // }
        const updateUser = await User.findByIdAndUpdate(user._id, {
            $set: {
                avatar: avatar?.url
            }
        },
            {
                new: true
            }).select('-password -refreshToken')
        if (!updateUser) {
            throw {
                status: 400,
                message: 'something went worng during updating avatar'
            }
        }


        res.status(200).send({
            message: "avatar of user is updated",
            updateUser
        })
    }),
    updateCoverImage: asyncHandler(async (req, res, next) => {
        // const { _id } = req.user

        const { user } = req
        // console.log(user)
        if (!user) {
            throw {
                status: 400,
                message: 'user is not authenticate'
            }
        }
        const coverImagelocalpath = req.file?.path
        if (!coverImagelocalpath) {
            throw {
                status: 400,
                message: 'coverImage field cannot be empty'
            }
        }
        const coverImage = await fileUploder(coverImagelocalpath)

        // }
        const updateUser = await User.findByIdAndUpdate(user._id, {
            $set: {
                coverImage: coverImage?.url
            }
        },
            {
                new: true
            }).select('-password -refreshToken')
        if (!updateUser) {
            throw {
                status: 400,
                message: 'something went worng during updating avatar'
            }
        }


        res.status(200).send({
            message: "coverImage of user is updated",
            updateUser
        })
    }),
    getUserChannel: asyncHandler(async (req, res, next) => {
        const { usernameofchannel, } = req.params
        const { user } = req
        console.log(user)
        if (!usernameofchannel) {
            throw {
                status: 400,
                message: 'userName is not given'
            }
        }
        const channel = await User.aggregate(
            [
                {
                    $match: {
                        userName: usernameofchannel
                    }


                },
                {
                    $lookup: {
                        from: "videos",
                        localField: 'allVideos',
                        foreignField: "_id",
                        as: 'allVideos',
                        pipeline: [
                            {
                                $lookup: {
                                    from: "users",
                                    localField: 'owner',
                                    foreignField: "_id",
                                    as: 'owner',
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
                    }
                },
                {
                    $addFields: {
                        allVideos: {
                            $first: "$allVideos"
                        }
                    }
                },

                {
                    $lookup: {
                        from: "subscribtions",
                        localField: '_id',
                        foreignField: "channel",
                        as: 'subscriberTo',
                    }
                },
                {
                    $lookup: {
                        from: "subscribtions",
                        localField: '_id',
                        foreignField: "subscriber",
                        as: 'subscribers',
                    }
                },
                {
                    $addFields: {
                        subscribersOfChannelCount: {
                            $size: "$subscribers"
                        },
                        subscribeByMe: {
                            $size: "$subscriberTo"
                        },



                    }
                },
                {

                    $project: {
                        userName: 1,
                        email: 1,
                        subscribersOfChannelCount: 1,
                        subscribeByMe: 1,
                        allVideos: 1,

                    },

                }
            ])
        if (!channel) {
            throw {
                status: 400,
                message: 'something went wrong'
            }
        }
        console.log(channel)
        res.status(200).send({
            channel, user
        })


    }),
    getWatchHistory: asyncHandler(async (req, res, next) => {
        const { user } = req.params
        console.log('done')
        if (!user) {
            throw {
                status: 400,
                message: 'params is not given'
            }
        }
        const userHistory = await User.aggregate(
            [
                {
                    $match: {
                        userName: user
                    }

                },
                {
                    $lookup: {
                        from: 'videos',
                        localField: 'watchHistory',
                        foreignField: '_id',
                        as: "watchHistory",
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'owner',
                                    foreignField: '_id',
                                    as: "owner",
                                    pipeline: [
                                        {
                                            $project: {
                                                userName: 1
                                            }
                                        }
                                    ]

                                }

                            }
                        ]


                    }

                },
                {
                    $project: {
                        watchHistory: 1
                    }
                }

            ]
        )
        console.log(userHistory)
        // console.log(userHistory)
        if (!userHistory) {
            throw {
                status: 400,
                message: 'something went wrong'
            }
        }
        res.status(200).send(userHistory)

    })


}