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
      required: true
    },
    comment: {
      type: String,
      required: true,
      maxlength:500
    },
    likes: {
      count: {
        type: Number,
        default: 0
      },
      userIds: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        }
      ]
    },
    dislikes: {
      count: {
        type: Number,
        default: 0
      },
      userIds: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        }
      ]
    },
    replies: [
      {
        replyId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        comment: {
          type: String,
          required: true
        },
        likes: {
          count: {
            type: Number,
            default: 0
          },
          userIds: [
            {
              type: Schema.Types.ObjectId,
              ref: "User",
            }
          ]
        },
        dislikes: {
          count: {
            type: Number,
            default: 0
          },
          userIds: [
            {
              type: Schema.Types.ObjectId,
              ref: "User",
            }
          ]
        },
      }
    ]
  },
  { timestamps: true }
);

commentSchema.path('replies').schema.set('timestamps', true);

export const Comment = mongoose.model("Comment", commentSchema);