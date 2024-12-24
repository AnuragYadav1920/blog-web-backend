import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))
// if the data is in the form of json
app.use(express.json({limit: "16kb"}))

// if the data is coming from static folders
app.use(express.static("public"))

// if data is coming from x-www-form-urlencoded(it allows only data not files) which are given as key value pairs and that get joined to the url by & operator
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// if the data coming is from cookies and sessions
app.use(cookieParser())

import { userRouter } from "./routes/userRoute.js"
import { blogRouter } from "./routes/blogRoute.js"
import { searchRouter } from "./routes/searchRoute.js"
import { subscribeRouter } from "./routes/subscribeRoute.js"
import {feedbackRouter} from "./routes/feedbackRoute.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/blogs", blogRouter)
app.use("/api/v1/all", searchRouter)
app.use("/api/v1/channel", subscribeRouter)
app.use("/api/v1/user", feedbackRouter)





export default app
