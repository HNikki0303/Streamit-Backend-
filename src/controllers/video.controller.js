import mongoose, {isValidObjectId} from "mongoose"

import {Video} from "../model/video.model.js"
import {User} from "../model/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"

const uploadVideo = async (req,res) => {
      const videoPath = req.file?.path;
      if(!videoPath){
        throw new ApiError(400, " video file is not uploaded by the user")
      }

      const videoFile = await uploadOnCloudinary(videoPath);
      if(!videoFile){
        throw new ApiError(500,"Sorry baby the video could not be uploaded on Cloudinary")
      }

      console.log("video file", videoFile)

      return res.status(200).json(
        new ApiResponse(
            200,
            videoFile,
            "video has been uploaded successfully to cloudinary"
        )
      )

}

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
    const thumbnailPath = req.files?.thumbnail[0].path;
    const videoPath = req.files?.video[0].path;
    if(!thumbnailPath || !videoPath){
        throw new ApiError(400,"video and thumbnail both need to uploaded");
    }
    // now you have got the files and have cheked it as well
    // we need to get the url of the files form cloudinary

    const thumbnail =  await uploadOnCloudinary(thumbnailPath)
    const videoFile = await uploadOnCloudinary(videoPath)

    //console.log("video file", videoFile)
    
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
        throw new ApiError(500,"Video failed to be created")
    }

    console.log("we have published and have got the vides : <- message from backend")
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

    const video = await Video.findById(videoId).populate('owner', 'username avatar');
    if(!video){
        throw new ApiError(404,"video not found with this id ");
    }

    return res.status(200).
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

 const getPaginatedVideoIds = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '6');
  const skip = (page - 1) * limit;

  console.log(`Fetching paginated videos: page=${page}, limit=${limit}, skip=${skip}`);

  const total = await Video.countDocuments();
  console.log(`Total videos in DB: ${total}`);

  const videos = await Video.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('_id');

  console.log("Fetched video IDs:", videos);

  if (!videos || videos.length === 0) {
    console.warn("No videos found for this page.");
    throw new ApiError(404, "No videos found");
  }

  const response = new ApiResponse(
    200,
    {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      videos,
    },
    "Paginated videos fetched successfully"
  );

  return res.status(200).json(response);
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    uploadVideo,
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    getPaginatedVideoIds,
    deleteVideo,
    togglePublishStatus
}