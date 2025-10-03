import { useMutation, useQueryClient } from "@tanstack/react-query";
import EmojiPicker from "emoji-picker-react";
import React, { useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

const CommentReplyEdit = ({
  isEditing,
  postId,
  comment,
  setIsEditing,
  reply,
}) => {
  const [commentText, setCommentText] = useState(comment?.text);
  const [replyText, setReplyText] = useState(reply?.text);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: updateComment, isPending: isUpdatePending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `/api/posts/${postId}/comments/${comment?._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: commentText }),
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
    onSuccess: (updatedComment) => {
      toast.success("Comment updated successfully");
      setIsEditing(false);
      queryClient.setQueryData(["post"], (oldPost) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          comments: oldPost.comments.map((c) => {
            if (c._id === updatedComment._id) {
              return updatedComment;
            }
            return c;
          }),
        };
      });
    },
  });

  const { mutate: updateReply, isPending: isUpdateReplyPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `/api/posts/${postId}/comments/${comment?._id}/replies/${reply?._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: replyText }),
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
    onSuccess: (updatedReply) => {
      toast.success("Reply updated successfully");
      setIsEditing(false);
      queryClient.setQueryData(["replies", comment?._id], (oldReplies) => {
        if (!oldReplies) return oldReplies;
        return oldReplies.map((r) => {
          if (r._id === updatedReply._id) {
            return updatedReply;
          }
          return r;
        });
      });
    },
  });

  const handleUpdateComment = (e) => {
    e.preventDefault();
    if (isUpdatePending) return;
    updateComment();
  };

  const handleUpdateReply = (e) => {
    e.preventDefault();
    if (isUpdateReplyPending) return;
    updateReply();
  };

  return (
    <dialog open={isEditing} className="modal border-none outline-none">
      <div className="modal-box rounded border border-gray-600">
        <h3 className="text-2xl font-bold border-b border-gray-600 mb-4 pb-2">
          Update
        </h3>
        <textarea
          className={`textarea w-full h-20 p-0 text-lg resize-none border-none focus:outline-none border-gray-800`}
          placeholder="Comment on post"
          value={reply ? replyText : commentText}
          onChange={(e) =>
            reply
              ? setReplyText(e.target.value)
              : setCommentText(e.target.value)
          }
        />

        <div className="border-t border-gray-600 pt-2 flex justify-between my-4">
          <div className="flex gap-4 items-center">
            <BsEmojiSmileFill
              className="fill-primary w-5 h-5 cursor-pointer"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            />
          </div>
          <button
            className="btn btn-primary rounded-full btn-sm text-white px-4"
            onClick={reply ? handleUpdateReply : handleUpdateComment}
          >
            {isUpdatePending ? <LoadingSpinner size="sm" /> : "Update"}
          </button>
        </div>

        <EmojiPicker
          onEmojiClick={(emojiData) => {
            reply
              ? setReplyText((prev) => {
                  return prev + emojiData.emoji;
                })
              : setCommentText((prev) => {
                  return prev + emojiData.emoji;
                });
          }}
          previewConfig={{
            defaultEmoji: "",
            defaultCaption: "",
            showPreview: false,
          }}
          categories={false}
          open={isEmojiPickerOpen}
          theme="dark"
          height={200}
          width="100%"
          searchDisabled={true}
        />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          className="outline-none"
          onClick={() => {
            setIsEditing(false);
            setCommentText(comment.text);
            setReplyText(reply.text);
            setIsEmojiPickerOpen(false);
          }}
        >
          close
        </button>
      </form>
    </dialog>
  );
};

export default CommentReplyEdit;
