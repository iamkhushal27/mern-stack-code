const mongoose = require('mongoose')


const likeSchema = new mongoose.Schema(
    {

        video:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
        ,
        likeBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
        ,
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }

    },
    {

        timestamps: true
    })


const Playlist = mongoose.model('Subscribtion', playlistSchema)
module.exports = Playlist