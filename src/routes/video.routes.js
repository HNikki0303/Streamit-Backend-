import {upload} from "../middleware/multer.middleware.js"; 
import {verifyJWT} from "../middleware/check.middleware.js";
import { publishAVideo } from "../controllers/video.controller.js";
import {Router} from "express";
import { getVideoById } from "../controllers/video.controller.js";
import {updateVideo } from "../controllers/video.controller.js";
import {uploadVideo} from "../controllers/video.controller.js";
import {getPaginatedVideoIds} from "../controllers/video.controller.js"

const router = Router();

router.route("/upload").post(
    upload.single("video"),
    uploadVideo
);

router.route("/publishAVideo").post(
    upload.fields(
        [{
            name:"thumbnail",
            maxCount:1
        },
        {
            name:"video",
            maxCount:1
        }
    ]),
    verifyJWT,
    //ye pura part req mein jaayega matlab ek middleware hai 
    publishAVideo
);

router.route("/videoLink/:videoId").get(
    getVideoById
);

router.route('/paginated').get(
    getPaginatedVideoIds
);

router.route("update/:userId").post(
    upload.single("thumbnail"),
    updateVideo
);


export default router;