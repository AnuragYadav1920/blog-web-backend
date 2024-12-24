import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import {apiResponse} from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"
import {Subscription} from "../models/subscription.model.js"


const generateTokens = async (userId) =>{
    try {
        const user = await User.findById(userId)

        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {refreshToken, accessToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access and refresh token")
    }
}
const registerUser = asyncHandler(async(req, res)=>{

    const {username, email, password, fullName,instagram, facebook, linkedin, website, about} = req.body

    if(!username || !email || !password || !fullName || !about){
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new apiError(400, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required")
    }
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "avatar uploading failed")
    }

/* another way of hashing the password to store it in the database

    const hashedPassword = await bcrypt.hash(password, 10)

*/
    

    const createdUser = await User.create({
        username: username.toLowerCase(),
        fullName: fullName,
        email: email.toLowerCase(),
        password: password,
        instagram: instagram,
        facebook:facebook,
        linkedin:linkedin,
        website:website, 
        about:about,
        avatar: avatar.url,
        coverImage: coverImage?.url || "null"
    })

    if(!createdUser){
        throw new apiError(400, "User creation error")
    }
    const user = await User.findById(createdUser?._id).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user,"user created successfully!")
    )
})

const loginUser = asyncHandler(async(req, res) =>{
try {
        const {email, password} = req.body
        if(!email){
           throw new apiError(400, "Email is required")
        }
    
        const existedUser = await User.findOne({email:email})
       
    
        if(!existedUser){
            throw new apiError(400, "User does not exists")
        }
    
        const verifiedPassword = await existedUser.isPasswordCorrect(password)
    
        if(!verifiedPassword){
            throw new apiError(400, "Invalid Credentials")
        }
     
    /* another way of validating  the password with the database password
    
        const isPasswordVerified = await bcrypt.compare(password, existedUser.password)
    
        if(!isPasswordVerified){
            throw new apiError(400, "Invalid Credentials")
        }
    */
    
        const {refreshToken, accessToken} = await generateTokens(existedUser._id)
    
    
        const user = await User.findById(existedUser._id).select("-password -refreshToken")
    
        const options ={
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new apiResponse(200, user, "Logged in successfully!")
        )
} catch (error) {
        res.status(401).json({
        error: true,
        message: "Unauthorized user",
        
      });
}
})

const logoutUser = asyncHandler(async(req, res) =>{
    const user = req.user

    if(!user){
        throw new apiError(401, "Unauthorized request")
    }

     const deletedRefreshTokenUser = await User.findOneAndUpdate(
        {
            _id: user._id
        },
        {
            $unset: {refreshToken: 1}
        },
        {
            new: true
        }
    ).select("-password")

    if(deletedRefreshTokenUser?.refreshToken ){
        throw new apiError(400, "refreshToken is not cleared from database")
    }

    return res
            .status(200)
            .clearCookie("refreshToken")
            .clearCookie("accessToken")
            .json(
                new apiResponse(200, {}, "Logged out successfully")
            )

})

const updateUserDetails = asyncHandler(async(req, res)=>{
    
    const {username,email,fullName, about} = req.body

    if(!(username || email || fullName || about)){
        throw new apiError(400, "Insert the details")
    }
    
    const updatedUserDetails = await User.findByIdAndUpdate(
        req.user._id,
        {
           $set :{
             email,
             fullName,
             username,
             about
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")


    if(!updatedUserDetails){
        throw new apiError(400, "failed to update user details")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedUserDetails, "user updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req, res) =>{
    const localFilePath = req.file.path 
    
    if(!localFilePath){
        throw new apiError(400, "unable to fetch avatar from localMachine")
    }

    const avatar = await uploadOnCloudinary(localFilePath)

    if(!avatar.url){
        throw new apiError(400, "failed to upload avatar on cloudinary")
    }

    const updatedUserDetails = await User.findByIdAndUpdate(
        req.user._id,
        {
            avatar: avatar.url
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if(!updatedUserDetails) {
        throw new apiError(400, "failed to upload the avatar")
    }

    return res
            .status(200)
            .json(
                new apiResponse(200, updatedUserDetails, "avatar updated successfully")
            )
})

const updateUserCoverImage = asyncHandler(async(req, res) =>{
    const localFilePath = req.file.path 
    
    if(!localFilePath){
        throw new apiError(400, "unable to fetch coverImage from localMachine")
    }

    const coverImage = await uploadOnCloudinary(localFilePath)

    if(!coverImage.url){
        throw new apiError(400, "failed to upload coverImage on cloudinary")
    }

    const updatedUserDetails = await User.findByIdAndUpdate(
        req.user._id,
        {
            coverImage: coverImage.url
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if(!updatedUserDetails) {
        throw new apiError(400, "failed to upload the coverIamge")
    }

    return res
            .status(200)
            .json(
                new apiResponse(200, updatedUserDetails, "coverImage updated successfully")
            )
})

const updateUserPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(!newPassword){
        throw new apiError(400, "new password field required")
    }
    if(!oldPassword){
        throw new apiError(400, "old password field required")
    }
    if(!confirmPassword){
        throw new apiError(400, "confirm password field required")
    }

    if(newPassword !== confirmPassword){
        throw new apiError(400, "confirm password does not match")
    }

    const user = await User.findById(req.user._id)

   const verifyPassword = await user.isPasswordCorrect(oldPassword)

   if(!verifyPassword){
    throw new apiError(400, "Invalid Password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false})

    return res
            .status(200)
            .json(
                new apiResponse(200, {}, "password updated successfully")
            )
})


// ḍelete this route
const getUserDetails = asyncHandler(async(req, res)=>{
   
    const userDetails = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"blogs",
                localField:"_id",
                foreignField:"owner",
                as:"allPost",
            },
                     
        },
        {
            $addFields:{
                posts:"$allPost"
            }
        },   
        {
            $project:{
                username:1,
                email:1,
                avatar:1,
                coverImage:1,
                fullName:1,
                posts:1,
               
            }
        }

    ])

    if(!userDetails){
        throw new apiError(400, "User not found")
    }
    return res
            .status(200)
            .json(
                new apiResponse(200, userDetails, "user fetched successfully")
            )
})


const getUserById = asyncHandler(async(req,res)=>{
    const foundUser = await User.findOne({
        _id:req.params.id
    }).select("-password -refreshToken -post ")

    if(!foundUser){
        throw new apiError(400, "failed to fetch the user details")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, foundUser, "user fetched successfully")
    )
})

const getUserByUsername = asyncHandler(async(req,res)=>{
    const user = req.params.username
    const foundUser = await User.findOne({
        username:user
    }).select("-password -refreshToken -post ")

    if(!foundUser){
        throw new apiError(400, "failed to fetch the user details")
    }
    return res
    .status(200)
    .json(
        new apiResponse(200, foundUser, "user fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    updateUserPassword,
    getUserDetails,
    getUserById,
    getUserByUsername
}