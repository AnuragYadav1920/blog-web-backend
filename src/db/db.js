import dotenv from "dotenv/config"
import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"

const connectDB = async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Database Connected Successfully")
    } catch (error) {
        console.log("Database connection failed !", error)
    }
}

export {connectDB}