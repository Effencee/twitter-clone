import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getFollowers, getFollowing, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get('/profile/:username/followers', protectRoute, getFollowers);
router.get('/profile/:username/following', protectRoute, getFollowing);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.put("/update", protectRoute, updateUser);

export default router;
