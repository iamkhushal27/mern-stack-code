const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudnary-Url
            required: true
        },
        coverImage: {
            type: String,

        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ]
        ,
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true
    })

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        
        this.password = await bcrypt.hash(this.password, 12)
        return next()
    }
    next()

})
userSchema.methods.isPasswordCorrect = async function (password) {
    // console.log(this.password,'old password')
    // console.log(password,'newpassword')
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )

}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )

}
const User = mongoose.model('User', userSchema)
module.exports = User