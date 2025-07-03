import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    console.log("title of the video", title)
    console.log("description of the video", description)
    //you need to get req.files by using multer middleware
    // we need to get thumbnail and video form req.files
    const thumbnailPath = req.files.thumbnail[0].path;
    const videoPath = req.files.video[0].path;
    if(!thumbnailPath || !videoPath){
        throw new ApiError(400,"video and thumbnail both need to uploaded");
    }
    // now you have got the files and have cheked it as well
    // we need to get the url of the files form cloudinary

    const thumbnail =  await uploadOnCloudinary(thumbnailPath)
    const videoFile = await uploadOnCloudinary(videoPath)

    console.log("video file", videoFile)
    
    const video = await Video.create({
        title,
        description,
        thumbnail:thumbnail.url,
        videoFile: videoFile.url,
        isPublished: true,
        owner: req.user._id,
        duration: videoFile.duration
    })

    if(!video){
        return new ApiError(500,"Video failed to be created")
    }
    return res.status(200).json(
        new ApiResponse(200,video,"Video has been created and published successfully")
    )
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400,"video id is missing the url , please check ")
    }

    const video = await Video.findById(videoId)

    return res.status.
    json(
        new ApiResponse(
            200,
            video,
            "this is the video"

        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId){
        throw new ApiError(400,"you video link doesnt contain video id");
    }
    const {title,description,thumbnail} = req.body

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title : title,
                description : description, 
                thumbnail : thumbnail
            }
        }
    )

    return res.status(200).
    json(
        new ApiResponse(
            200,
            updatedVideo,
            "this is the video with updated details"
        )
    )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}