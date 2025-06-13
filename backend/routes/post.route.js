import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  likeUnlikePost,
  commentOnPost,
  deletePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  updatePost,
  favUnfovPosts,
  getFavouritePosts,
  getPost,
} from "../controllers/post.controller.js";

const router = express.Router();

//feed
router.get("/", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/liked/:username", protectRoute, getLikedPosts);
router.get("/favourites/:username", protectRoute, getFavouritePosts);
router.get("/:id", protectRoute, getPost);
//post
router.post("/", protectRoute, createPost);
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);
//interactions
router.post("/:id/favourite", protectRoute, favUnfovPosts);
router.post("/:id/like", protectRoute, likeUnlikePost);
router.post("/:id/comments", protectRoute, commentOnPost);

export default router;
