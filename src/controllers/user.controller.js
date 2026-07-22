import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudnary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //  get user details from frontend\
    // validation- not empty
    // check if user already exist: username, email
    // check for image, check for avtar
    // upload them to cloudanary, avtar
    // create user object-create user entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response
    

    const {fullName, email, usename, password} = req.body
      console.log("email ", email);
      
     if(
        [].some((field)=>
        field?.trim()=== "")
     )
     {
        throw new ApiError(400,"full name is required")
     }
    const existedUser = User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409, "user with email or username already exist")
    }
    const avtarLocalPath = req.files?.avtar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avtarLocalPath) {
        throw new ApiError(400, "avtar filed required")
    }
    const avtar = await uploadOnCloudnary(avtarLocalPath)
    const coverImage = await uploadOnCloudnary(coverImageLocalPath)

    if (!avtar) {
        throw new ApiError(400, "avtar filed required")
    }

    const user = await User.create({
        fullName,
        avtar:avtar.url,
        coverImage:coverImage?.url || "",
        email,
         password,
         username:username.toLowerCase()
    })
       const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
       )
       if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
       }

       return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered succesfully")
       )
})

export {
    registerUser,
}