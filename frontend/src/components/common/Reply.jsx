import EmojiPicker from "emoji-picker-react";
import React, { useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";

const Reply = ({
  user,
  comment,
  setComment,
  handleSubmit,
  isCommentPending,
}) => {
  return (
    <div className="flex border-b border-gray-700 p-4 gap-4">
      <div className="avatar">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full">
          <img src={user.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>

      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
          placeholder="Add your comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="dropdown relative">
            <div tabIndex={0} role="button">
              <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
            </div>
            <div
              tabIndex={0}
              className="dropdown-content absolute mt-2 z-[50] p-2 rounded-box max-w-80 -translate-x-1/3"
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setComment((prev) => {
                    return prev + emojiData.emoji;
                  });
                }}
                theme="dark"
                height={400}
                width="100%"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary rounded-full btn-sm text-white px-4"
          >
            {isCommentPending ? <LoadingSpinner /> : "Comment"}
          </button>
        </div>
        {/* {isError && <div className="text-red-500">{error.message}</div>} */}
      </form>
    </div>
  );
};

export default Reply;
