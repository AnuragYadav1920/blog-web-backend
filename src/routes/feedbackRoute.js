import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {createFeedback, getFeedback} from "../controllers/feedback.controller.js"
const router = Router()

router.route("/feedback").post(verifyJWT,createFeedback)
router.route("/get-feedback").get(getFeedback)

export {router as feedbackRouter}