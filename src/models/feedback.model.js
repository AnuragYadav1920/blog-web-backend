import mongoose, {Schema} from 'mongoose'

const feedbackSchema = new Schema({
    email:{
        type:String,
        required: true
    },
    work:{
        type:String,
        required: true
    },
    description:{
        type:String,
        required: true
    },
    fullName:{
        type:String,
        required: true
    },
    avatar:{
        type:String,
        default:""
    }
},{timestamps: true})

export const Feedback = mongoose.model("Feedback", feedbackSchema)