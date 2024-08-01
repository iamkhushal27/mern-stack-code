const express = require('express')
const connection = require('./db/connection')
const cors = require('cors')
const cookieparser=require('cookie-parser')
const userRouter=require('./routes/user.Routes')
const videoRouter=require('./routes/video.Routes')
const playlistRouter=require('./routes/playlist.Routes')
const subsvriberRouter=require('./routes/subcriber.Routes')
require('dotenv').config()


const app = express()

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static("public"))
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(cookieparser())
 
// Routes

app.use('/api/users',userRouter)
app.use('/api/videos',videoRouter)
app.use('/api/playlist',playlistRouter)
app.use('/api/subscribers',subsvriberRouter)

connection().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`server is running on the port ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log(error)
})
// async function Connection() {
//     await connection()

// }

// Connection()