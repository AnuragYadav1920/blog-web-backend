import { Router } from "express";
import { getSearchedBlogs, getSearchedData, getSearchedUsers } from "../controllers/search.controller.js";

const router = Router()

router.route("/search").get(getSearchedData)
router.route("/search/users").get(getSearchedUsers)
router.route("/search/blogs").get(getSearchedBlogs)

export {router as searchRouter}
