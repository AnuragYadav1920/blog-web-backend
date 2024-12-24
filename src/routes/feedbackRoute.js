import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {createFeedback, getFeedback} from "../controllers/feedback.controller.js"
import {createContactDetails}  from "../controllers/contact.controller.js"
const router = Router()

router.route("/feedback").post(createFeedback)
router.route("/get-feedback").get(getFeedback)
router.route("/sent-message").post(createContactDetails)

export {router as feedbackRouter}