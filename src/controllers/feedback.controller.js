import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {Feedback} from "../models/feedback.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";

export const createFeedback = asyncHandler(async(req, res)=>{
   try {
     const {email, work, description} = req.body
     const feedback = await Feedback.create(
         {  
             userId:req.user._id,
             email,
             work,
             description
         }
     )
 
     if(!feedback){
         throw new apiError(400, "failed to create feedback")
     }
     return res.status(200).json(
         new apiResponse(200,feedback, "Feedback created successfully")
     )
   } catch (error) {
    throw new apiError(500, "Server error")
   }
});

export const getFeedback = asyncHandler(async(req, res)=>{
    try {
        const feedback = await Feedback.find().limit(20)
        if(!feedback){
            throw new apiError(404, "Feedback not found")
        }
        return res.status(200).json(
            new apiResponse(200, feedback, "feedbacks fetched successfully")
        )
    } catch (error) {
        throw new apiError(500, "Server error")
        
    }

});