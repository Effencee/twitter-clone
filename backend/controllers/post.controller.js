import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uplodaedResponse = await cloudinary.uploader.upload(img);
      img = uplodaedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      res.status(200).json(post.likes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const favUnfovPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isAlreadyFavourite = post.favourites.includes(userId);

    if (isAlreadyFavourite) {
      await Post.updateOne({ _id: postId }, { $pull: { favourites: userId } });
      await User.updateOne(
        { _id: userId },
        { $pull: { favouritePosts: postId } }
      );
      const updatedFavourites = post.favourites.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedFavourites);
    } else {
      post.favourites.push(userId);
      await User.updateOne(
        { _id: userId },
        { $push: { favouritePosts: postId } }
      );
      await post.save();
      res.status(200).json(post.favourites);
    }
  } catch (error) {
    console.log("Error in favUnfovPosts controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const postId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({ user: userId, text });
    await post.save();

    const updatedPost = await Post.findById(postId).populate({
      path: "comments.user",
      select: "fullName username profileImg",
    });

    const notification = new Notification({
      from: userId,
      to: post.user,
      type: "comment",
    });
    await notification.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId, commentId: commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      await Post.updateOne(
        { _id: postId, "comments._id": commentId },
        { $pull: { "comments.$.likes": userId } }
      );
      const updatedLikes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      comment.likes.push(userId);
      await post.save();
      res.status(200).json(comment.likes);
    }
  } catch (error) {
    console.log("Error in likeUnlikeComment controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const postId = req.params.id;
    const commentId = req.params.commentId;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.replies.push({ user: userId, text });
    await post.save();

    const populatedPost = await Post.findById(postId).populate({
      path: "comments.replies.user",
      select: "fullName username profileImg",
    });

    const populatedComment = populatedPost.comments.find(
      (c) => c._id.toString() === commentId
    );

    const lastReply =
      populatedComment.replies[populatedComment.replies.length - 1];

    const notification = new Notification({
      from: userId,
      to: post.user,
      type: "reply",
    });
    await notification.save();

    res.status(200).json(lastReply);
  } catch (error) {
    console.log("Error in replieToComment controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikeReply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId, commentId: commentId, replyId: replyId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const reply = comment.replies.find(
      (reply) => reply._id.toString() === replyId
    );

    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    const isLiked = reply.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (isLiked) {
      reply.likes = reply.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      reply.likes.push(userId);
    }

    await post.save();

    res.status(200).json(reply.likes.map((id) => id.toString()));
  } catch (error) {
    console.log("Error in likeUnlikeReply controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllReplies = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const post = await Post.findById(req.params.id).populate({
      path: "comments.replies.user",
      select: "fullName username profileImg",
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json(comment.replies);
  } catch (error) {
    console.log("Error in getAllReplies controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: "user",
        select: "fullName username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "fullName username profileImg",
      });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getPost controller: ", error.message);
    console.log("id: " + req.params.id);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: "user",
      select: "fullName username profileImg",
    });

    const { text } = req.body;
    let { img } = req.body;

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (post.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to update this post" });
    }

    if (img) {
      if (post.img) {
        await cloudinary.uploader.destroy(
          post.img.split("/").pop().split(".")[0]
        );
      }
      const uplodaedResponse = await cloudinary.uploader.upload(img);
      img = uplodaedResponse.secure_url;
    }

    post.text = text || post.text;
    post.img = img;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in updatePost controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params;
    const user = await User.findOne(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFavouritePosts = async (req, res) => {
  try {
    const userId = req.params;
    const user = await User.findOne(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const favouritePosts = await Post.find({
      _id: { $in: user.favouritePosts },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(favouritePosts);
  } catch (error) {
    console.log("Error in getFavouritePosts controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
