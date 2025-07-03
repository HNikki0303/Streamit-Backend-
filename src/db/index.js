import mongoose from "mongoose";
import {DATABASE_NAME} from "../constant.js";

const connectDB = async () => 
{ try{
    const connectInstance = await mongoose.connect(`${process.env.MONGO_DB_URL}/${DATABASE_NAME}`,{
        connectTimeoutMS: 10000, // 10 seconds
    })
    console.log(`\n MongoDB connected !! DB HOST : ${connectInstance.connection.host} , my dear ${DATABASE_NAME}`);
}
catch(error){
    console.log("MONOGODB CONNNECTION FAILED !!",error);
    process.exit(1); // Exit the process with failure
}
}

export default connectDB;
