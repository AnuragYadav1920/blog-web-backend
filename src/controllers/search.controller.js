import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Blog } from "../models/blog.model.js";

const getSearchedData = asyncHandler(async(req,res)=>{
    const {query, page = 1} = req.query

    const itemsPerPage = 50;

    const skip = (page - 1) * itemsPerPage;

    if(!query){
        throw new apiError(400,"No query found ?")
    }
    const foundUsers = await User.find({
        $text:{ $search: query }

    }).skip(skip)
    .limit(itemsPerPage)

    const remainingLimit = Math.max(0, itemsPerPage - foundUsers.length);
    
    const foundBlogs = await Blog.find({
        $text:{$search: query}
    }).skip(skip)
    .limit(remainingLimit)
 
    return res
            .status(200)
            .json(
                new apiResponse(200, {channels:foundUsers, posts:foundBlogs}, 'data fetched successfully')
            )
})

const getSearchedUsers = asyncHandler(async(req, res)=>{
    const {query='',page = 1} = req.query

    if(!query){
        throw new apiError(4000, "No query found ")
    }

    const itemsPerPage = 20;
    const skip = (page-1)*itemsPerPage

    const fetchedUsers = await User.find({
        $text:{$search: query}
    }).skip(skip)
    .limit(itemsPerPage)
    .select("-password -refreshToken -post -instagram -facebook -website -about -coverImage -email -linkedin")

    const totalChannels = await User.countDocuments({$text:{$search: query}})

    const totalPages = Math.ceil(totalChannels/itemsPerPage)

    if(fetchedUsers.length === 0){
        return res
            .status(200)
            .json(
                new apiResponse(200, {channels:[], totalChannels:0, totalPages:0}, "No channel found !")
            )
    }

    return res
            .status(200)
            .json(
                new apiResponse(200, {channels:fetchedUsers, totalChannels:totalChannels, totalPages:totalPages}, "Users fetched Successfully !")
            )
})

const getSearchedBlogs = asyncHandler(async(req, res)=>{
    const {query='',page = 1} = req.query

    if(!query){
        throw new apiError(4000, "No query found ")
    }

    const itemsPerPage = 20;
    const skip = (page-1)*itemsPerPage

    const fetchedBlogs = await Blog.find({
        $text:{$search: query}
    }).skip(skip)
    .limit(itemsPerPage)

    const totalPosts = await Blog.countDocuments({$text:{$search: query}})

    const totalPages = Math.ceil(totalPosts/itemsPerPage)

    if(fetchedBlogs.length === 0){
        return res
            .status(200)
            .json(
                new apiResponse(200, {posts:[], totalPosts:0, totalPages:0}, "No post found !")
            )
    }

    return res
            .status(200)
            .json(
                new apiResponse(200, {post:fetchedBlogs, totalPosts: totalPosts, totalPages: totalPages},"Blogs fetched Successfully !")
            )
})

export {getSearchedData, getSearchedUsers, getSearchedBlogs}