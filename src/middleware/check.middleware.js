import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")   
        // console.log(token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        //verifies and authenticates the token with the help of the secret key given that the token has been released from the server and  decodes the token's payload (the user data/claims) and returns it as an object.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //dekho jo decode kiya hai na token usse hamein payload mil raha hai jaha se ham id nikalenge 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {       
            throw new ApiError(401, "Invalid Access Token")
        }
        // we are manually adding a user field in the req.
        req.user = user;
        //why are we adding this user field?
        //because we want to use this user field in the next middleware or controller function
        //dekho jab user ko login kara rahe the to user ko refresh aur access token bhi dilwa rahe the cokkies mein
        //agar user loggin hai to uski request se cookies lenge aur token ko decode karke uskko verify karenge
        //baki verification ke baad logout etc. ye sab kaam bhi karaye ja sakte hain
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})