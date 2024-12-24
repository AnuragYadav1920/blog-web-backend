import mongoose, {Schema} from 'mongoose'

const feedbackSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
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
    }
},{timestamps: true})

export const Feedback = mongoose.model("Feedback", feedbackSchema)