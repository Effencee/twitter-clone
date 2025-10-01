import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmileFill } from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";

const Reply = ({ user, answer, setAnswer, handleSubmit, isAnswerPending }) => {
  return (
    <div className="flex p-4 gap-4">
      <div className="avatar">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full">
          <img src={user.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>

      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-0 border-b focus:outline-none border-gray-700 focus:border-primary transition-all duration-300"
          placeholder="Add your comment"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="flex justify-between py-2">
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
            {isAnswerPending ? <LoadingSpinner /> : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Reply;
