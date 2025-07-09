import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: 'http://localhost:5173/',
    credentials:true
}))


//It makes the JSON data available on the req.body object in your route handlers. Without it, req.body would be undefined for JSON requests. 
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static("public"))
//public mein jo bhi hoga vo publically available hoga, like images, css, js files etc.
// cookieParser is used to parse cookies from the request headers and make them available in req.cookies
app.use(cookieParser())

// routes import
import userRoutes from './routes/user.routes.js';

// routes declaration
app.use("/api/v1/user",userRoutes);//for user related routes

import videoRoutes from './routes/video.routes.js';

app.use ("/api/v1/video", videoRoutes);//for video related routes


export {app}