import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Like } from "../models/like.model.js";

const createBlog = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!(title && description && category)) {
    throw new apiError(400, "title and description and category required");
  }

  const localFilePath = req.file.path;
  if (!localFilePath) {
    throw new apiError(400, "failed to upload image from local Machine");
  }

  const uploadedImage = await uploadOnCloudinary(localFilePath);

  if (!uploadedImage.url) {
    throw new apiError(400, "failed to upload image on cloudinary");
  }

  const blogCreation = await Blog.create({
    title,
    description,
    category,
    postImage: uploadedImage.url,
    owner: req.user._id,
  });

  if (!blogCreation) {
    throw new apiError(400, "Failed to post the blog");
  }

  await User.updateOne(
    {
      _id: req.user._id,
    },
    {
      $push: { post: blogCreation._id },
    }
  );

  return res
    .status(200)
    .json(new apiResponse(200, blogCreation, "post created successfully"));
});

const updateBlog = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if(!(title || category || description)){
    throw new apiError(400, "please update the details")
}

const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (category) updateFields.category = category;

  const updatedBlog = await Blog.findByIdAndUpdate(
     req.params.id,
    {
      $set :updateFields
    },
    {
      new: true,
    }
  );

  if (!updateBlog) {
    throw new apiError(400, "failed to upload the blog");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedBlog, "Blog updated successfully"));
});

const updateBlogImage = asyncHandler(async (req, res) => {
  const localImagePath = req.file.path;

  if (!localImagePath) {
    throw new apiError(400, "failed to load image from local machine");
  }

  const updatedImage = await uploadOnCloudinary(localImagePath);

  if (!updatedImage) {
    throw new apiError(400, "failed to upload on cloudinary");
  }
  const updatedBlog = await Blog.findByIdAndUpdate(
    {
      _id: req.params.id,
    },
    {
      postImage: updatedImage.url,
    },
    {
      new: true,
    }
  );

  if (!updatedBlog) {
    throw new apiError(400, "failed to update the post ");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedBlog, "post updated successfully"));
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const result = await Blog.deleteOne({ _id: blogId });
  await User.updateOne(
    {
      _id: req.user._id,
    },
    {
      $pull: {
        post: blogId,
      },
    }
  );

  if (!result) {
    throw new apiError(400, "failed to delete the post");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "post deleted successfully"));
});

const getAllBlog = asyncHandler(async (req, res) => {
  const { query='', page = 1 } = req.query;
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  const queryObj = query ? { $text: { $search: query } } : {};

  const allBlogsPosted = await Blog.find(queryObj).skip(skip).limit(itemsPerPage);
  const totalBlogs = await Blog.countDocuments(queryObj);
  const totalPages = Math.ceil(totalBlogs / itemsPerPage);

  if (allBlogsPosted.length === 0) {
    return res
    .status(200)
    .json(
        new apiResponse(
            200, {post:[], totalBlogs:0,totalPages:0}, "No post found"
        )
    )
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          posts: allBlogsPosted,
          totalBlogs: totalBlogs,
          totalPages: totalPages,
        },
        "All blogs are fetched successfully"
      )
    );
});

const getSingleBlog = asyncHandler(async (req, res) => {

  const postDetails = await Blog.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.params.id)
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"ownerDetails"
      }
    },
    {
      $unwind: "$ownerDetails"
    },
    {
      $project: {
        title: 1,
        description: 1,
        category: 1,
        owner: 1,
        postImage: 1,
        createdAt:1,
        "ownerDetails.username": 1,
        "ownerDetails.avatar": 1 
      }
    }
  ])
  const blogDetails = postDetails[0];
  const totalLikes = await Like.countDocuments({
    blog: req.params.id,
  });

  return res
    .status(200)
    .json(new apiResponse(200, {...blogDetails, totalLikes}, "blog fetched successfully"));
});

const getUserBlogs = asyncHandler(async (req, res) => {
  const {query='', page = 1 } = req.query;
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;
  const queryObj = query?{
    $and:[
        {$text:{$search: query}},
        {owner: req.user._id}
    ]}:{owner:req.user._id}

  const postedBlogs = await Blog.find(queryObj)
    .skip(skip)
    .limit(itemsPerPage);

  const totalPosts = await Blog.countDocuments({
    owner: req.user._id,
  });

  
  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  if (postedBlogs.length === 0) {
    return res
    .status(200)
    .json(
        new apiResponse(
            200, {post:[], totalBlogs:0, totalPages:0}, "No post found"
        )
    )
  }


  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { posts: postedBlogs, totalPosts: totalPosts, totalPages: totalPages },
        "All the blogs are fetched!"
      )
    );
});

const getChannelBlogs = asyncHandler(async(req, res)=>{
  const {query="", page=1} = req.query
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  const queryObj = query?{
    $and:[
        {$text:{$search: query}},
        {owner: req.params.id}
    ]}:{owner: req.params.id}

  const postedPosts = await Blog.find(queryObj)
    .skip(skip)
    .limit(itemsPerPage);

  const totalPosts = await Blog.countDocuments({
    owner: req.params.id,
  });

  
  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  if (postedPosts.length === 0) {
    return res
    .status(200)
    .json(
        new apiResponse(
            200, {post:[], totalPosts:0, totalPages:0}, "No post found"
        )
      )
  }

  return res
        .status(200)
        .json(
          new apiResponse(
            200, {post:postedPosts, totalPosts:totalPosts, totalPages:totalPages}, "All posts are fetched Successfully"
          )
        )
})
const getMyLikedPost = asyncHandler(async(req, res)=>{
  try {
    const allLikedPost = await Like.find({likedBy:req.user._id})
    return res
    .status(200)
    .json(
      new apiResponse(200,allLikedPost, "all liked post fetched Successfully")
    )
  } catch (error) {
    throw new apiError(500, "Server error")
  }
})

export {
  createBlog,
  updateBlog,
  updateBlogImage,
  deleteBlog,
  getAllBlog,
  getUserBlogs,
  getSingleBlog,
  getChannelBlogs,
  getMyLikedPost
};
