import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

const handleLikeAction = async (req, res) => {
  try {
    const existingLike = await Like.findOne({
      blog: req.params.id,
      likedBy: req.user._id,
    });
    if (!existingLike) {
      await Like.create({
        blog: req.params.id,
        likedBy: req.user._id,
      });

      return res
        .status(200)
        .json(new apiResponse(200,{}, "post liked successfully"));
    }else{
      return res
        .status(200)
        .json(new apiResponse(200,{}, "you have already liked the post"));
    }
  } catch (error) {
    throw new apiError(500, "Server error");
  }
};

// delete this route
const totalLikes = asyncHandler(async (req, res) => {
  try {
    const totalLikes = await Like.countDocuments({
      blog: req.params.id,
    });
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { totalLikes: totalLikes },
          "post likes fetched successfully"
        )
      );
  } catch (error) {
    throw new apiError(500, "Server error");
  }
});

export { handleLikeAction, totalLikes };
