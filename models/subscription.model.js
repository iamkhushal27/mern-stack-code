const mongoose = require('mongoose')


const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        alreadySubscribed:{
            type:Boolean,
            required: true,
            default:false 
        }

    },
    {

        timestamps: true
    })


const Subscribtion = mongoose.model('Subscribtion', subscriptionSchema)

module.exports = Subscribtion