import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../model/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefereshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        //is document ko ham mongoose se dhoondenge basically User model se dhoondenge
        //user uska instance hai
        //aur kyuki database hai isliye await lagao because database alag continent mein hota hai
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken=refreshToken
        //ab ham isko monogdb mein save karaenge using save method by mongoose 
        //aur usmein bhi ham koi validation nahi kar rahe hain bas , password vagera validate nahi karenge kyunki daalenge hi nahi na 
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registerUser = asyncHandler(async (req,res)=>{

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName , email , username , password } = req.body
    //just object destructuring of the req.bocy 
    console.log("email:" ,email);
    console.log(req.body);

    if(fullName === ""){
        throw new ApiError(400,"fullName is required field");
    }
    if(email===""){
        throw new ApiError(400,"email is required field");
    }
    if(username===""){
        throw new ApiError(400,"username is required field");
    }
    if(password===""){
        throw new ApiError(400,"password is required field");
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with this email and username already exists");
    }

    console.log(req.files);
// req.files can be accseed because you have multer middleware which provides you with file access funcitonality not possible otherwise(only texts).
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required field")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    // agar cloudinary pe kuch bhi upload bina kiye usek path vagera ke access karenge to sirf ek empty string vapas karta hai
    console.log("avatar:", avatar);
    console.log("coverImage:", coverImage);

    if(!avatar){
        throw new ApiError(400,"Avatar file was not uploaded on Cloudinary")
    }
    const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email, 
            password,
            username: username.toLowerCase()
    })
    console.log("a user has been registered successfully");
    const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
    )
     if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    //check if the username is there is the database with the same email and avatar and fullName  and password which are the required fields
    //also generate an access and refresh token and save the refresh token in the database
    //req.body se data lenge
    //username aur email ko check karenge
    //login ho rha hai to crosscheck karenge password bhi lenge
    //access aur refresh tokens generate karenge
    //we will then send cookies
    //req.body se info lene ke liye ham object destructing karenge
    const{username,password}=req.body;
    console.log(req.body);
    //ham username aur email dono se login karenge to dono ka hona jaruri hai
    if (!username && !password) {
    throw new ApiError(400, " username and password are required to log in");
    }
    console.log("username aur password aa gye hain")

    const user = await User.findOne({username})
    // user ko dhoondenge with this username 
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Oops ! The password did not match")
    }

    console.log(user);
    //ab refreshToken aur accessToken nikalenge jiske liye hamne ek alag se function banaya hai
    //aur na id se ham call karenge is function ko tokens generate karne ke liye
    const {accessToken , refreshToken}=await generateAccessandRefereshTokens(user._id)
    //yaha pe important hai ye samjhna ki apan ne user kiya not User kyuki vo to model hai na ye hai hamara login karne vala reference
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options ={
        httpOnly: true,
        secure:true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})


const logOutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User has been logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request because it is coming form a non login user")
    }
    //#%?try and catch kyu hi use kar rahe hain ismein???
    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        //esa karke hamein user as a payload milega
        const user = User.findById(decodedToken?._id)
        if(incomingRefreshToken!==user.refreshToken){
            new ApiError(400,"Refresh Token has been used or is expired ")
        }
        const options ={
            httpOnly:true,
            secure:true
        }
        console.log("userId:",user._id);
        console.log("user:",user);
        const {accessToken , newRefreshToken}= await generateAccessandRefereshTokens(user._id)

        return res.
        status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "access token has been refreshed succesfully"
            )
        )
    }
    catch(err){
        throw new ApiError(401,err?.message||"Invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Plese check the old password , it is incorrect , provide correct password")
    }
//****user ya document mein kuch bhi agar updatae karna hai to ese karenge  */
    user.password = newPassword
//yaad rakhna ki sirf itna karke hi update nahi hoga but y
//need to save it as well 

    // )>
    // const nikku = user.select(
    //     "-refreshToken"
    // )
    
    const changedpasswordUser = await user.save({validateBeforeSave:false})
    changeCurrentPassword.select(
        "-refreshToken"
    )


    return res
    .status(200)
    .json(
        new ApiResponse(200,changeCurrentPassword,"Password has been changed successfully")
    )
})


const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        )
    )

})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email}= req.body;

    if(!fullName  || !email){
        throw new ApiError(400,"fullName and email are required fields")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {   //this is explicit way of setting or updating fields 
            $set:{
                fullName : fullName,
                email:email
            }
            //you can also use :-
            // fullName , email which is a modern JavaScript shorthand feature called Object Property Value Shorthand (introduced in ES6/ES2015).
        },
        {
            new:true
        }
    ).select("-password -refreshToken")


    return res.status(200)
    .json(
        new ApiResponse(200,user,"Usser account details updated successfully")
    )
});


const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
       throw new ApiError(405,"avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(401,"avatar file could not uploaded on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
            //dekho yaha pe save karne ki koi jarurat nahi hai 
            //you see findByIdAndUpdate use kar rahe hain
        },
        {new:true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar file has been updated successfully")
    )
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImagePath = req.files?.path

    if(!coverImagePath){
        throw new ApiError(405,"coverImage is required")
    }

    const coverImage = await uploadOnCloudinary(coverImagePath)
    if(!coverImage.url){
        throw new ApiError(401,"Error in uploading the image file in Cloudinary")
    }

    const user = User.findByIdAndUpdate(
        req.user?.id,
        {   //ser mein ek pura object hi de sakte ho aur : kar rahe hain kyuki uploading kar rahe hain na
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover image is updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
     
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from : "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localFeild:"_id",
                foreignField:"subscriber",
                as:"subscribeTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelIsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError (404,"channel does not exists")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel details fetched successfully")
    )
    //please console log channel , why do we take the 0th index here and obviously every feild you make is an array only

})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project :{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]

            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(
            200,
            user[0].getWatchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {registerUser , //:)
    loginUser ,//:)
    logOutUser ,//:)
    refreshAccessToken ,
    changeCurrentPassword ,
    updateAccountDetails,
    getCurrentUser ,//:)
    updateUserAvatar ,
    updateCoverImage ,
    getUserChannelProfile ,
    getWatchHistory
} 