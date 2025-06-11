import { useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("all");

  return (
    <>
      <div className="w-full mr-auto border-l border-r border-gray-700 min-h-screen">

        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-20 pl-12 lg:pl-0 flex w-full border-b border-gray-700">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("all")}
          >
            For you
            {feedType === "all" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        <CreatePost />

        <Posts feedType={feedType} />
      </div>
    </>
  );
};
export default HomePage;
