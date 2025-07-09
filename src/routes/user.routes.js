console.log("abhi ham route pe hain");
import {Router} from "express";

import {registerUser ,
         loginUser ,
         logOutUser ,
         refreshAccessToken ,
         changeCurrentPassword , 
         updateAccountDetails,
         getCurrentUser,
         updateUserAvatar , 
         updateCoverImage ,
         getUserChannelProfile ,
         getWatchHistory,
}

from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"; 
import {verifyJWT} from "../middleware/check.middleware.js";

const router = Router();
//router help you manage your routes in a more organized way

//register karne ke liye route
router.route("/register").post(
    upload.fields(
        [{
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
);


//login karne ke liye route
router.route("/login").post( 
    loginUser
);

router.route("/logout").get(
    verifyJWT,
    logOutUser
);

router.route("/refreshAccessToken").post(
    refreshAccessToken
)

router.route("/currentUser").get(
    verifyJWT,
    getCurrentUser
)

router.route("/updateDetails").patch(
    verifyJWT,
    updateAccountDetails
)

router.route("/changePassword").post(
    verifyJWT,
    changeCurrentPassword
)

router.route("/updateAvatar").patch(
    upload.single("Avatar"),  
    verifyJWT,
    updateUserAvatar 
)

router.route("/updateCoverImage").patch(
    upload.single("CoverImage"),  
    verifyJWT,
    updateCoverImage 
)

router.route("/Channel/:userId").get(
    verifyJWT,
    getUserChannelProfile
)

router.route("/watchHistory").get(
    verifyJWT,
    getWatchHistory
)





export default router;
