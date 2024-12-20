import dotenv from "dotenv"
import express from "express"
import { connectDB } from "./db/db.js"
import app from "./app.js"

const port = process.env.PORT || 3000

connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log(`app is listening at port: ${port}`)
    })
})
.catch((error)=>{
    console.log("app is unable to listen at given port", error)
})



