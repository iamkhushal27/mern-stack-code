const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const { use } = require('../routes/user.Routes')

module.exports = {
    authenrication : async (req, res, next) => {
        try {
            const incomingAccessToken = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
            if (!incomingAccessToken) {
                throw {
                    status: 400,
                    message: 'unothorized access '
                }
            }
    
            const decodedtoken =jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET)
    
            const user =await User.findById(decodedtoken?._id).select("-password ")
            if (!user) {
                throw {
                    status: 400,
                    message: ' invalid access token '
                }
            }
            
            // console.log('1')
            console.log(user)
    
    
            // console.log(user, 'after in logout')
            req.user = user
            next()
        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went worng')
        }
    }
}