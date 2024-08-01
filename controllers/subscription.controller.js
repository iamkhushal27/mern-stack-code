const Subscribtion = require('../models/subscription.model')
const asyncHandler = require('../utils/asyncHandler')
const mongoose=require('mongoose')

module.exports = {
    toggelSubscription: asyncHandler(async (req, res) => {
        console.log('here we are')
        const { user } = req
        const { alreadySubscribed } = req.body
        const { channelid } = req.params


        if (!user) {
            throw {
                status: 400,
                message: 'user is required'
            }
        }


        if (!channelid) {
            throw {
                status: 400,
                message: 'channeid is required'
            }
        }
        if (alreadySubscribed == true) {


            const afterSubscribe = await Subscribtion.create({
                subscriber: user._id,
                channel: channelid,
                alreadySubscribed: alreadySubscribed


            })

            if (!afterSubscribe) {
                throw {
                    status: 400,
                    message: 'something went worng again try to subscribe'
                }
            }

            res.status(200).send(afterSubscribe)
        }


        if (alreadySubscribed != true) {



            afterUnsubscribe = await Subscribtion.deleteOne({
                channel: channelid
            })

            console.log('here we are here')



            res.status(200).send('channel is unsubscribe')

        }





        // console.log('outsidfe')


    }),
    getChannelSubscriber: asyncHandler(async (req, res) => {
        const { channelid } = req.params
        if (!channelid) {
            throw {
                status: 400,
                message: 'channeid is required'
            }
        }
// console.log('inisde')
        const subscriber=await Subscribtion.aggregate(
            [
                {
                  $match:{
                    channel:new mongoose.Types.ObjectId(channelid)
                  }

                },
                {
                  $lookup:{
                    from:'users',
                    localField:"channel",
                    foreignField:"_id",
                    as:"channel",
                    pipeline:[{
                        $project:{
                            userName:1,
                            avatar:1
                        }
                    }]
                  }
                },
                {
                    $project:{
                        channel:1
                    }
                }
            ]
        )
        res.status(200).send(subscriber)

    })
}

