import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

// this is classiclly an example of how to use function.then().catch() if there is any error executing the function



// import express from "express";
// const app = express();

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_DB_URL}/${DATABASE_NAME}`)
//         app.on("error",(error)=>{
//             console.log("error:",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening at port ${process.env.PORT}`);
//         })
//     }
//     catch(error){
//         console.error("ERROR : ",error);
//         throw error
//     }
// }
// )
