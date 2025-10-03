import React, { useState } from "react";
import { FaPen, FaRegHeart, FaTrash } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import Reply from "./Reply";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import { fetchUser } from "../../services/userService";
import ReplyCard from "./ReplyCard";
import CommentReplyEdit from "./CommentReplyEdit";

const CommentCard = ({
  comment,
  showReplyInput,
  setShowReplyInput,
  reply,
  setReply,
  postId,
}) => {
  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
  const [expandedComments, setExpandedComments] = useState({});
  const [replyInput, setReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editComment, setEditComment] = useState(false);
  const queryClient = useQueryClient();
  const isCommentLiked = comment.likes.includes(data._id);
  const isMyComment = data._id === comment.user._id;

  const { data: replies, isPending: isRepliesPending } = useQuery({
    queryKey: ["replies", comment?._id],
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/posts/${postId}/comments/${comment?._id}/replies`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  });

  const { mutate: replyOnPost, isPending: isReplyPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `/api/posts/${postId}/comments/${comment?._id}/replies`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: reply || replyText }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: (newReply) => {
      setShowReplyInput(false);
      setReplyInput(false);
      setReply("");
      queryClient.setQueryData(["replies", comment?._id], (oldReplies) => {
        if (!oldReplies) return [newReply];
        return [...oldReplies, newReply];
      });
    },
  });

  const { mutate: likeComment, isPending: isLikePending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `/api/posts/${postId}/comments/${comment?._id}/like`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["post"], (oldPost) => {
        if (!oldPost) return oldPost;

        return {
          ...oldPost,
          comments: oldPost.comments.map((c) => {
            if (c._id === comment._id) {
              if (c.likes.includes(data._id)) {
                return { ...c, likes: c.likes.filter((id) => id !== data._id) };
              } else {
                return { ...c, likes: [...c.likes, data._id] };
              }
            }
            return c;
          }),
        };
      });
    },
  });

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleLikeComment = () => {
    if (isLikePending) return;
    likeComment();
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (isReplyPending) return;
    replyOnPost();
  };

  return (
    <div key={comment._id} className="border-b border-gray-700 pb-4">
      <div className="flex gap-2 items-start w-full px-4 pt-4 pb-2">
        <div className="avatar">
          <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full">
            <img src={comment.user.profileImg || "/avatar-placeholder.png"} />
          </div>
        </div>
        <div className="flex flex-col grow">
          <div className="flex items-center gap-1">
            <div className="flex gap-2">
              <span className="font-bold lg:text-lg">
                {comment.user.fullName}
              </span>
              <span className="text-gray-700 text-sm lg:text-lg">
                @{comment.user.username}
              </span>
            </div>
            {isMyComment && (
              <span className="flex gap-4 flex-1 justify-end">
                {!editComment && (
                  <FaPen
                    className="cursor-pointer hover:text-primary"
                    onClick={() => setEditComment(true)}
                  />
                )}
                <FaTrash className="cursor-pointer hover:text-red-500" />
              </span>
            )}
            <CommentReplyEdit
              isEditing={editComment}
              postId={postId}
              comment={comment}
              setIsEditing={setEditComment}
            />
          </div>
          <div className="text-sm lg:text-lg">{comment.text}</div>
        </div>
      </div>
      <div className="flex gap-8 items-center">
        <div
          className="pl-14 lg:pl-18 flex gap-1 items-center group cursor-pointer"
          onClick={handleLikeComment}
        >
          {isLikePending && <LoadingSpinner size="sm" />}
          {!isCommentLiked && !isLikePending && (
            <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
          )}
          {isCommentLiked && !isLikePending && (
            <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
          )}

          <span
            className={`text-sm group-hover:text-pink-500 ${
              isCommentLiked ? "text-pink-500" : "text-slate-500"
            }`}
          >
            {comment.likes.length}
          </span>
        </div>
        <button
          className="font-bold cursor-pointer hover:bg-primary/40 px-4 h-8 rounded-full"
          onClick={() => {
            setShowReplyInput(comment._id);
            setReplyInput(false);
          }}
        >
          Reply
        </button>
      </div>
      {showReplyInput === comment._id && (
        <Reply
          user={data}
          answer={reply}
          setAnswer={setReply}
          handleSubmit={handleReply}
          isAnswerPending={isReplyPending}
        />
      )}
      {replies?.length > 0 && (
        <button
          className="font-bold cursor-pointer hover:bg-primary/40 px-4 h-8 rounded-full ml-14 mt-2 flex items-center gap-2"
          onClick={() => toggleReplies(comment._id)}
        >
          {expandedComments[comment._id]
            ? "Hide replies"
            : `Show replies (${replies?.length})`}
          <MdKeyboardArrowDown className="w-6 h-6" />
        </button>
      )}
      {isRepliesPending && <LoadingSpinner />}
      {expandedComments[comment._id] &&
        replies.map((reply) => (
          <ReplyCard
            key={reply._id}
            comment={comment}
            reply={reply}
            replyText={replyText}
            replyInput={replyInput}
            setReplyText={setReplyText}
            setShowReplyInput={setShowReplyInput}
            setReplyInput={setReplyInput}
            handleReply={handleReply}
            isReplyPending={isReplyPending}
            postId={postId}
          />
        ))}
    </div>
  );
};

export default CommentCard;
