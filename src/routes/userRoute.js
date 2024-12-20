import { Router } from "express"
import { loginUser, logoutUser, registerUser, updateUserDetails, updateUserAvatar, updateUserCoverImage, updateUserPassword, getUserDetails, getUserById, getUserByUsername } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()


router.route("/register").post(upload.fields([
            { name: 'avatar', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 }]),
     registerUser)

router.route("/login").post(loginUser)
router.route("/get-user/:id").get(getUserById)
router.route("/get-user-channel/:username").get(getUserByUsername)

// secured user route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/update-details").patch(verifyJWT, updateUserDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)
router.route("/update-password").patch(verifyJWT, updateUserPassword)
router.route("/get-user-details").get(verifyJWT, getUserDetails)



export {router as userRouter}