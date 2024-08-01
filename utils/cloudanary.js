const { v2: cloudinary } = require('cloudinary')
const { response } = require('express')
const fs = require('fs')
require('dotenv').config()

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret:process.env.CLOUDINARY_SECRET
});


 const fileUploder=async(localFilePath)=>{
    try {
        // console.log('inside')
        // console.log(localFilePath)
        if (!localFilePath) {
            // console.log('inside 2')
            return null
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been upload sucsessfully
        // console.log('done 2')
        // console.log('file is uploaded on cloudanary', response.url)
        fs.unlinkSync(localFilePath)

        // console.log('response',response)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove the locally file upload from the public folder on fail opertion
        return error
    }
}
module.exports=fileUploder