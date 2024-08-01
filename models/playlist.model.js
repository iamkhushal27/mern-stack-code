const mongoose = require('mongoose')


const playlistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            index: true
        },
        description: {
            type: String,

        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }

    },
    {

        timestamps: true
    })


const Playlist = mongoose.model('Playlist', playlistSchema)
module.exports = Playlist