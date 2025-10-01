import { useState } from "react";
import Post from "./Post";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import SelectedPostSkeleton from "../skeletons/SelectedPostSkeleton";
import { fetchUser } from "../../services/userService";
import Reply from "./Reply";
import useAddComment from "../../hooks/useAddComment";
import CommentCard from "./CommentCard";

const SelectedPost = () => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");
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

      {!isPostLoading && !isRefetching && !isUserLoading && (
        <>
          <Post post={post} />
          <Reply
            user={user}
            answer={comment}
            setAnswer={setComment}
            handleSubmit={handleSubmit}
            isAnswerPending={isCommentPending}
          />
        </>
      )}
      <span className="block border-t border-gray-700"></span>
      {!isRefetching &&
        post?.comments.map((comment) => (
          <CommentCard
            key={comment._id}
            user={comment.user}
            reply={reply}
            setReply={setReply}
            comment={comment}
            showReplyInput={showReplyInput}
            setShowReplyInput={setShowReplyInput}
            postId={postId}
          />
        ))}
    </div>
  );
};

export default SelectedPost;
