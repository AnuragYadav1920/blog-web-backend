import { Comment } from "../models/commentModel"; // Assuming the schema is in models/commentModel
import {asyncHandler} from '../utils/asyncHandler.js'
import {apiResponse} from '../utils/apiResponse.js'
import {apiError} from '../utils/apiError.js'

// Create a comment
const createComment = asyncHandler(async (req, res) => {
  try {
    const {postId, userId, comment } = req.body;
    if(!comment){
        throw new apiError(400,'no comment passed !')
    }
    const newComment = new Comment({
      postId,
      userId,
      comment,
      likes: { count: 0, userIds: [] },
      dislikes: { count: 0, userIds: [] },
      replies: []
    });

    await newComment.save();
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

// Get all comments for a post
export const getCommentsByPostId = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).populate('userId', 'name email').populate('replies.replyId', 'name email').populate('replies.userId', 'name email');
    
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

// Get a single comment by its ID
export const getCommentById =asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId).populate('userId', 'name email').populate('replies.replyId', 'name email').populate('replies.userId', 'name email');
    
    if (!comment) {
      return res.status(404).json(
        new apiError(404, 'comment not found')
      );
    }

    return res.status(200).json(
      new apiResponse(200, comment, 'comment fetched successfully')
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, 'Server error')
    );
  }
});

// Update a comment
export const updateComment =asyncHandler( async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { comment },
      { new: true }
    ).populate('userId', 'name email');

    if (!updatedComment) {
      return res.status(404).json(
        new apiError(404, 'no updated comment found')
      );
    }

    return res.status(200).json(
      new apiResponse(200, updatedComment, 'comment updated successfullly')
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, "Server error")
    );
  }
});

// Delete a comment
export const deleteComment =asyncHandler( async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json(
        new apiError(404, 'failed to delete comment')
      );
    }

    return res.status(200).json(
      new apiResponse(200, {}, "Comment deleted successfully")
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, "Server error")
    );
  }
});

// Add a reply to a comment
export const addReply =asyncHandler( async (req, res) => {
  try {
    const { commentId } = req.params;
    const { replyId, userId, comment } = req.body;

    const commentToUpdate = await Comment.findById(commentId);

    if (!commentToUpdate) {
      return res.status(404).json(
        new apiError(404, "Comment not found")
      );
    }

    const newReply = {
      replyId,
      userId,
      comment,
      likes: { count: 0, userIds: [] },
      dislikes: { count: 0, userIds: [] }
    };

    commentToUpdate.replies.push(newReply);
    await commentToUpdate.save();

    return res.status(201).json(
      new apiResponse(201, commentToUpdate, "successfully replied to the comment")
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, "Server error")
    );
  }
});

// Like or Dislike a comment
export const likeDislikeComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, action } = req.body; // action could be 'like' or 'dislike'

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json(
        new apiError(404, "Comment not found")
      );
    }

    const isLikeAction = action === 'like';
    const targetField = isLikeAction ? 'likes' : 'dislikes';
    const oppositeField = isLikeAction ? 'dislikes' : 'likes';

    const alreadyActioned = comment[targetField].userIds.includes(userId);
    const oppositeAction = comment[oppositeField].userIds.includes(userId);

    if (oppositeAction) {
      return res.status(400).json(
        new apiError(400, "Cannot like and dislike simultaneously")
      );
    }

    if (alreadyActioned) {
      return res.status(400).json(
        new apiError(400, `You have already ${action}d this comment`)
      );
    }

    comment[targetField].count += 1;
    comment[targetField].userIds.push(userId);

    await comment.save();

    return res.status(200).json(
      new apiResponse(200, comment, "liked the comment successfully")
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, "Server error")
    );
  }
});

// Like or Dislike a reply
export const likeDislikeReply = asyncHandler(async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const { userId, action } = req.body; // action could be 'like' or 'dislike'

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json(
        new apiError(404, 'comment not found')
      );
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json(
        new apiError(404, "reply not found")
      );
    }

    const isLikeAction = action === 'like';
    const targetField = isLikeAction ? 'likes' : 'dislikes';
    const oppositeField = isLikeAction ? 'dislikes' : 'likes';

    const alreadyActioned = reply[targetField].userIds.includes(userId);
    const oppositeAction = reply[oppositeField].userIds.includes(userId);

    if (oppositeAction) {
      return res.status(400).json(
        new apiError(400, "Cannot like and dislike simultaneously")
      );
    }

    if (alreadyActioned) {
      return res.status(400).json(
        new apiError(400, `You have already ${action}d this reply`)
      );
    }

    reply[targetField].count += 1;
    reply[targetField].userIds.push(userId);

    await comment.save();

    return res.status(200).json(
      new apiResponse(200, comment,"liked the reply successfully")
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(
      new apiError(500, "Server error")
    );
  }
});