import { useMutation, useQueryClient } from "@tanstack/react-query";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { useRef } from "react";
import toast from "react-hot-toast";
import { BsEmojiSmileFill } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import LoadingSpinner from "./LoadingSpinner";

const PostDataFill = ({ isEditing, post, setIsEditing }) => {
  const [text, setText] = useState(post?.text);
  const [img, setImg] = useState(post?.img);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const imgRef = useRef(null);

  const queryClient = useQueryClient();

  const { mutate: updatePost, isPending: isUpdatePending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
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
      toast.success("Post updated successfully");
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!Array.isArray(oldPosts)) return oldPosts;
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            return updatedPost;
          }
          return p;
        });
      });

      queryClient.setQueryData(["post"], (oldPost) => {
        if (!oldPost) return oldPost;
        return { ...oldPost, text, img };
      });
      
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePost = (e) => {
    e.preventDefault();
    if (isUpdatePending) return;
    updatePost();
  };

  return (
    <dialog open={isEditing} className="modal border-none outline-none">
      <div className="modal-box rounded border border-gray-600">
        <h3 className="text-2xl font-bold border-b border-gray-600 mb-4 pb-2">
          Update
        </h3>
        <textarea
          className={`textarea w-full ${
            img ? "h-30 lg:h-40" : "h-60 lg:h-80"
          } p-0 text-lg resize-none border-none focus:outline-none border-gray-800`}
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-40 mx-auto mt-4">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg("");
                imgRef.current.value = null;
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-30 lg:h-40 object-contain rounded"
            />
          </div>
        )}
        <div className="border-t border-gray-600 pt-2 flex justify-between my-4">
          <div className="flex gap-4 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />

            <BsEmojiSmileFill
              className="fill-primary w-5 h-5 cursor-pointer"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button
            className="btn btn-primary rounded-full btn-sm text-white px-4"
            onClick={handleUpdatePost}
          >
            {isUpdatePending ? <LoadingSpinner size="sm" /> : "Update"}
          </button>
        </div>
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            setText((prev) => {
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
            setText(post.text);
          }}
        >
          close
        </button>
      </form>
    </dialog>
  );
};

export default PostDataFill;
