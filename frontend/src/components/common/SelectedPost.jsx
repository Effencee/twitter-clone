import { useState } from "react";
import Post from "./Post";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaRegHeart } from "react-icons/fa";
import SelectedPostSkeleton from "../skeletons/SelectedPostSkeleton";
import { fetchUser } from "../../services/userService";
import Reply from "./Reply";
import useAddComment from "../../hooks/useAddComment";

const SelectedPost = () => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [comment, setComment] = useState("");
  const postId = useParams().id;
  const location = useLocation();

  const from = location.state?.from;

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  const {
    data: post,
    isLoading: isPostLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["post"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  });

  const { commentPost, isCommentPending } = useAddComment(
    postId,
    comment,
    setComment
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCommentPending) return;
    commentPost();
  };

  return (
    <div className="w-3xl border-r border-l border-gray-700">
      {/*arrow back*/}
      <div className="flex gap-10 px-4 py-2 items-center border-b border-gray-700">
        <Link to={from || "/"}>
          <FaArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col">
          <p className="font-bold text-lg">POST</p>
        </div>
      </div>

      {(isPostLoading || isRefetching || isUserLoading) && (
        <div className="w-3xl">
          <SelectedPostSkeleton />
        </div>
      )}
      {/*Post*/}

      {!isPostLoading && !isRefetching && !isUserLoading && (
        <>
          <Post post={post} />
          <Reply
            user={user}
            comment={comment}
            setComment={setComment}
            handleSubmit={handleSubmit}
            isCommentPending={isCommentPending}
          />
        </>
      )}
      {/*Form to add comment*/}

      {/*Comments*/}
      {!isRefetching &&
        post?.comments.map((comment) => (
          <div
            key={comment._id}
            className={`${
              showReplyInput === comment._id
                ? ""
                : "border-b border-gray-700 pb-4"
            }`}
          >
            <div className="flex gap-2 items-start px-4 pt-4 pb-2">
              <div className="avatar">
                <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full">
                  <img
                    src={comment.user.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold lg:text-lg">
                    {comment.user.fullName}
                  </span>
                  <span className="text-gray-700 text-sm lg:text-lg">
                    @{comment.user.username}
                  </span>
                </div>
                <div className="text-sm lg:text-lg">{comment.text}</div>
              </div>
            </div>
            <div className="flex gap-8 items-center">
              <div className="pl-14 lg:pl-18">
                <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 hover:text-pink-500" />
              </div>
              <button
                className="font-bold cursor-pointer hover:bg-primary/40 px-4 h-8 rounded-full"
                onClick={() => setShowReplyInput(comment._id)}
              >
                Reply
              </button>
            </div>
            {showReplyInput === comment._id && <Reply user={user} />}
          </div>
        ))}
    </div>
  );
};

export default SelectedPost;
