const mongoose = require('mongoose');
const { dbName } = require('../constants/index')

require('dotenv').config()

async function connection() {
    try {
        await mongoose.connect(`${process.env.MONGO_CONNECTION}/${dbName}`);
        
        // console.log(process.env.MONGO_CONNECTION)

        console.log('database is conncted with code')
        
    } catch (error) {

        console.log('MONGO_DB connection error', error)
        throw { message: 'faild to database connection' }
    }
}
module.exports=connection