import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[{
        type:mongoose.Types.ObjectId,
        ref:"Video"}
    ]
    ,
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
})

playlistSchema.plugin(mongooseAggregatePaginate)
export const Playlist = mongoose.model("Playlist",playlistSchema);