import mongoose, {Schema} from "mongoose"

const likeSchema = new Schema({
    blog:{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

export const Like =  mongoose.model("Like", likeSchema)