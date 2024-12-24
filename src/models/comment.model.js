import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Blogs",
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true
    },
    username:{
      type:String,
      default:""
    },
    avatar:{
      type:String,
      default:""
    },
    comment: {
      type: String,
      required: true,
      maxlength:500
    }
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);