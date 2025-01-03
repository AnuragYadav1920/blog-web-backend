import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createBlog, deleteBlog, getAllBlog, updateBlog, updateBlogImage, getUserBlogs, getSingleBlog, getChannelBlogs,getMyLikedPost } from "../controllers/blog.controller.js"
import { handleLikeAction, totalLikes} from "../controllers/like.controller.js"
import { createComment, getCommentsByPostId } from "../controllers/comment.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/get-all-posts").get(getAllBlog)
router.route("/get-blog/:id").get(getSingleBlog)
router.route("/get-channel-blogs/:id").get(getChannelBlogs)

// secured blog  routes
router.route("/create-post").post(verifyJWT,upload.single("postImage"), createBlog)
router.route("/update-post/:id").patch(verifyJWT, updateBlog)
router.route("/update-post-image/:id").patch(verifyJWT, upload.single("postImage"), updateBlogImage)
router.route("/delete-post/:id").delete(verifyJWT, deleteBlog)
router.route("/get-user-blogs").get(verifyJWT,getUserBlogs)
router.route("/like-post/:id").post(verifyJWT, handleLikeAction)
router.route("/get-my-liked-post").get(verifyJWT,getMyLikedPost)
router.route("/create-comment/:id").post(verifyJWT,createComment)
router.route("/all-comments/:id").get(getCommentsByPostId)

export {router as blogRouter}