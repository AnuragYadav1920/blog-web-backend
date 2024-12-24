import {Contact} from "../models/contact.model.js"
import {asyncHandler} from '../utils/asyncHandler.js'
import {apiResponse} from '../utils/apiResponse.js'
import {apiError} from '../utils/apiError.js'

export const createContactDetails = asyncHandler(async(req, res) =>{
    try {
        const {name, email, description} = req.body;

        if(!(name || email || description)){
            throw new apiError(404, "some details are missing")
        }

        await Contact.create({
            name:name,
            email:email,
            description:description
        })

        return res.
        status(200)
        .json(
            new apiResponse(200, {}, "Message sent successfully")
        )
    } catch (error) {
        throw new apiError(500,"Server Error")
    }
})