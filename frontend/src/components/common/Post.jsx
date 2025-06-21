import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaPen } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { fetchUser } from "../../services/userService";
import PostDataFill from "./PostDataFill";

const Post = ({ post }) => {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const postOwner = post.user;
  const isLiked = post.likes.includes(data._id);
  const isFavourite = post.favourites.includes(data._id);
  const location = useLocation();

  const isMyPost = data._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");

        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
  });

  const { mutate: likePost, isPending: isLikePending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}/like`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!Array.isArray(oldPosts)) return oldPosts;
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });

      queryClient.setQueryData(["post"], (oldPost) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          likes: updatedLikes,
        };
      });
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error.message);
    },
  });

  const { mutate: commentPost, isPending: isCommentPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (updatedPost) => {
      toast.success("Comment added successfully");
      setComment("");
      const newComment = updatedPost.comments.at(-1);
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            return { ...p, comments: [...p.comments, newComment] };
          }
          return p;
        });
      });
    },
  });

  const { mutate: favouritePost, isPending: isFavouritePending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}/favourite`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (updatedFavourites) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!Array.isArray(oldPosts)) return oldPosts;
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            return { ...p, favourites: updatedFavourites };
          }
          return p;
        });
      });

      queryClient.setQueryData(["post"], (oldPost) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          favourites: updatedFavourites,
        };
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    mutate();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommentPending) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLikePending) return;
    likePost();
  };

  const handleToggleFavourite = () => {
    if (isFavouritePending) return;
    favouritePost();
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link
              to={`/profile/${postOwner.username}`}
              className="font-bold lg:text-lg"
            >
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 lg:text-lg">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <>
                <span className="flex justify-end gap-4 flex-1">
                  {!isEditing && (
                    <FaPen
                      className="cursor-pointer hover:text-primary"
                      onClick={() => setIsEditing(true)}
                    />
                  )}

                  {!isPending && !isEditing && (
                    <FaTrash
                      className="cursor-pointer hover:text-red-500"
                      onClick={handleDeletePost}
                    />
                  )}
                  {isPending && <LoadingSpinner size="sm" />}
                </span>
              </>
            )}
          </div>
          <PostDataFill
            post={post}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
          <Link
            to={`/${post._id}`}
            state={{ from: location.pathname }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            <span className="text-lg whitespace-pre-line">{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </Link>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments
                      .slice()
                      .reverse()
                      .map((comment) => (
                        <div
                          key={comment._id}
                          className="flex gap-2 items-start"
                        >
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img
                                src={
                                  comment.user.profileImg ||
                                  "/avatar-placeholder.png"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-bold">
                                {comment.user.fullName}
                              </span>
                              <span className="text-gray-700 text-sm">
                                @{comment.user.username}
                              </span>
                            </div>
                            <div className="text-sm">{comment.text}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommentPending ? <LoadingSpinner size="md" /> : "Post"}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLikePending && <LoadingSpinner size="sm" />}
                {!isLiked && !isLikePending && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLikePending && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>{" "}
            <div
              className="flex w-1/3 justify-end gap-2 items-center"
              onClick={handleToggleFavourite}
            >
              {isFavouritePending && <LoadingSpinner size="sm" />}
              {!isFavouritePending && !isFavourite && (
                <FaRegBookmark className="w-4 h-4 cursor-pointer text-slate-500 hover:text-yellow-500" />
              )}
              {!isFavouritePending && isFavourite && (
                <FaRegBookmark className="w-4 h-4 cursor-pointer text-yellow-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
