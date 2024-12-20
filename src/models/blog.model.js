import mongoose, {Schema} from "mongoose"

const blogSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true,
    },
    postImage:{
        type: String,
        required: true
    },
    category:{
        type:String,
        required: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
 

},{timestamps: true})
blogSchema.index({title:'text', description:'text', category: 'text'})

export const Blog =  mongoose.model("Blog", blogSchema)