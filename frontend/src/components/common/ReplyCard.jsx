import React from "react";
import Reply from "./Reply";
import RenderComment from "./RenderComment";
import { FaRegHeart } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser } from "../../services/userService";
import LoadingSpinner from "./LoadingSpinner";

const ReplyCard = ({
  comment,
  reply,
  replyText,
  replyInput,
  setReplyText,
  setShowReplyInput,
  setReplyInput,
  handleReply,
  isReplyPending,
  postId,
}) => {
  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
  const queryClient = useQueryClient();
  const isReplyLiked = reply.likes.includes(data._id);

  const { mutate: likeReply, isPending: isLikeReplyPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `/api/posts/${postId}/comments/${comment?._id}/replies/${reply?._id}/like`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["replies", comment?._id], (oldReplies) => {
        if (!oldReplies) return oldReplies;
        return oldReplies.map((r) => {
          if (r._id === reply._id) {
            if (r.likes.includes(data._id)) {
              return { ...r, likes: r.likes.filter((id) => id !== data._id) };
            } else {
              return { ...r, likes: [...r.likes, data._id] };
            }
          }
          return r;
        });
      });
    },
  });

  const handleLikeReply = () => {
    if (isLikeReplyPending) return;
    likeReply();
  };

  return (
    <div className="pl-12">
      <div className="flex gap-2 items-start px-4 pt-4 pb-2">
        <div className="avatar">
          <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full">
            <img src={reply.user.profileImg || "/avatar-placeholder.png"} />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-bold lg:text-lg">
              {reply.user.fullName}
            </span>
            <span className="text-gray-700 text-sm lg:text-lg">
              @{reply.user.username}
            </span>
          </div>
          <div className="text-sm lg:text-lg">
            {<RenderComment text={reply.text} />}
          </div>
        </div>
      </div>
      <div className="flex gap-8 items-center">
        <div
          className="pl-14 lg:pl-18 flex gap-1 items-center group cursor-pointer"
          onClick={handleLikeReply}
        >
          {isLikeReplyPending && <LoadingSpinner size="sm" />}
          {!isReplyLiked && !isLikeReplyPending && (
            <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
          )}
          {isReplyLiked && !isLikeReplyPending && (
            <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
          )}

          <span
            className={`text-sm group-hover:text-pink-500 ${
              isReplyLiked ? "text-pink-500" : "text-slate-500"
            }`}
          >
            {reply.likes.length}
          </span>
        </div>
        <button
          className="font-bold cursor-pointer hover:bg-primary/40 px-4 h-8 rounded-full"
          onClick={() => {
            setReplyInput(reply._id);
            setReplyText("@" + comment.user.username + " ");
            setShowReplyInput(false);
          }}
        >
          Reply
        </button>
      </div>
      {replyInput === reply._id && (
        <Reply
          user={data}
          answer={replyText}
          setAnswer={setReplyText}
          handleSubmit={handleReply}
          isAnswerPending={isReplyPending}
        />
      )}
    </div>
  );
};

export default ReplyCard;
