import { Comment } from "../models/comment.model.js"; 
import {User} from "../models/user.model.js"
import {asyncHandler} from '../utils/asyncHandler.js'
import {apiResponse} from '../utils/apiResponse.js'
import {apiError} from '../utils/apiError.js'

// Create a comment
export const createComment = asyncHandler(async (req, res) => {
  try {
    const {comment} = req.body;
    if(!comment){
        throw new apiError(400,'no comment passed !')
    }
   const fetchUser = await User.findOne({_id:req.user._id})
   await Comment.create({
      postId:req.params.id,
      userId:req.user._id,
      comment: comment,
      username:fetchUser?.username,
      avatar:fetchUser?.avatar
    });
    return res.status(201).json(
        new apiResponse(201, {}, 'commented on the post successfully')
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, 'Server error')
    );
  }
});

// Get all comments for a postId
export const getCommentsByPostId = asyncHandler(async (req, res) => {
  try {
    const comments = await Comment.find({postId:req.params.id})
    return res.status(200).json(
      new apiResponse(200, comments, 'all comments fetched successfully')
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, 'Server error')
    );
  }
});