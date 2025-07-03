import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:false
}))

app.use(express.json({limit:"16kb"}))
//It makes the JSON data available on the req.body object in your route handlers. Without it, req.body would be undefined for JSON requests. 
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
//public mein jo bhi hoga vo publically available hoga, like images, css, js files etc.
// cookieParser is used to parse cookies from the request headers and make them available in req.cookies
app.use(cookieParser())

// routes import
import userRoutes from './routes/user.routes.js';

// routes declaration
app.use("/api/v1/user",userRoutes)

export {app}