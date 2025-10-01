import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useAddComment = (postId, comment, setComment) => {
  const queryClient = useQueryClient();

  const { mutate: commentPost, isPending: isCommentPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`, {
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
          if (p._id === postId) {
            return { ...p, comments: [...p.comments, newComment] };
          }
          return p;
        });
      });
      queryClient.setQueryData(["post"], (oldPost) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          comments: [...oldPost.comments, newComment],
        };
      });
    },
  });

  return { commentPost, isCommentPending };
};

export default useAddComment;
