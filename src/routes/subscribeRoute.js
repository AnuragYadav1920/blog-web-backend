import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {SubscribeAndUnsubscribe, getUserTotalSubscribers, checkSubscribed, getTopCreators} from "../controllers/subscription.controller.js";

const router = Router()
router.route("/subscribe").post(verifyJWT, SubscribeAndUnsubscribe)
router.route("/check-subscribed/:id").get(verifyJWT, checkSubscribed)
router.route("/get-total-subscribers/:id").get(getUserTotalSubscribers)
router.route("/get-top-creators").get(getTopCreators)

export {router as subscribeRouter}