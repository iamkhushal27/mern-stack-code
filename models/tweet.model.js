const mongoose = require('mongoose')
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");



const tweetSchema = new mongoose.Schema(
    {
        
        content: {
            type: String,

        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }

    },
    {

        timestamps: true
    })

tweetSchema.plugin(mongooseAggregatePaginate)

const Tweet = mongoose.model('Tweet', tweetSchema)
module.exports = Tweet