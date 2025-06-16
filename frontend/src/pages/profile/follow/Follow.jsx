import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchUser } from "../../../services/userService";
import { FaArrowLeft } from "react-icons/fa";
import FollowSkeleton from "../../../components/skeletons/FollowSkeleton";
import useFollow from "../../../hooks/useFollow";

const Follow = () => {
  const [hovered, setHovered] = useState(null);
  const { username } = useParams();
  const path = useLocation().pathname.split("/").at(-1);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false,
  });

  const { mutate } = useFollow();

  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ["followers"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}/followers`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ["following"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}/following`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  if (followingLoading || followersLoading) {
    return (
      <div className="w-3xl border-r border-l min-h-screen border-gray-700">
        <FollowSkeleton />
      </div>
    );
  }

  return (
    <div className="w-3xl border-r border-l min-h-screen border-gray-700">
      {/* title name etc */}
      <div className="flex gap-10 px-4 py-2 items-center">
        <Link to={`/profile/${username}`}>
          <FaArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col">
          <p className="font-bold text-lg">{userProfile?.fullName}</p>
          <span className="text-sm text-slate-500">@{userProfile?.username}</span>
        </div>
      </div>
      {/* actions */}
      <div className="flex gap-2 items-center border-b border-gray-700">
        <Link
          to={`/profile/${username}/followers`}
          className="w-1/2 p-3 flex justify-center transition duration-300 hover:bg-secondary cursor-pointer relative"
        >
          <span>Followers</span>
          {path === "followers" && (
            <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
          )}
        </Link>
        <Link
          to={`/profile/${username}/following`}
          className="w-1/2 p-3 flex justify-center transition duration-300 hover:bg-secondary cursor-pointer relative"
        >
          <span>Following</span>
          {path === "following" && (
            <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
          )}
        </Link>
      </div>
      {/* followers */}
      <div className="flex flex-col gap-2 px-4 py-2">
        {path === "followers"
          ? followersData?.map((follower) => (
              <div
                className="flex justify-between items-center"
                key={follower._id}
              >
                <Link
                  to={`/profile/${follower.username}`}
                  className="flex gap-2 items-center mt-4"
                >
                  <img
                    src={follower.profileImg || "/avatar-placeholder.png"}
                    alt={follower.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">{follower.fullName}</span>
                    <span className="text-sm text-slate-500">
                      @{follower.username}
                    </span>
                  </div>
                </Link>
                {user?.following.includes(follower._id) && (
                  <button
                    onMouseEnter={() => setHovered(follower._id)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={() => {
                      mutate(follower._id);
                      setHovered(null);
                    }}
                    className={`btn border ${
                      hovered === follower._id
                        ? " border-red-700 bg-red-700/25 text-red-700"
                        : "border-gray-600 bg-black text-white"
                    }  text-md font-bold rounded-full mt-2`}
                  >
                    {hovered === follower._id ? "Unfollow" : "Following"}
                  </button>
                )}
                {!user?.following.includes(follower._id) && (
                  <button
                    onClick={() => {
                      mutate(follower._id);
                      setHovered(null);
                    }}
                    className="btn border border-gray-600 bg-white text-black text-md font-bold rounded-full mt-2 hover:bg-white/80"
                  >
                    Follow
                  </button>
                )}
              </div>
            ))
          : followingData?.map((following) => (
              <div
                className="flex justify-between items-center"
                key={following._id}
              >
                <Link
                  to={`/profile/${following.username}`}
                  className="flex gap-2 items-center mt-4"
                >
                  <img
                    src={following.profileImg || "/avatar-placeholder.png"}
                    alt={following.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">{following.fullName}</span>
                    <span className="text-sm text-slate-500">
                      @{following.username}
                    </span>
                  </div>
                </Link>
                {user?.following.includes(following._id) && (
                  <button
                    onMouseEnter={() => setHovered(following._id)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={() => {
                      mutate(following._id);
                      setHovered(null);
                    }}
                    className={`btn border ${
                      hovered === following._id
                        ? " border-red-700 bg-red-700/25 text-red-700"
                        : "border-gray-600 bg-black text-white"
                    }  text-md font-bold rounded-full mt-2`}
                  >
                    {hovered === following._id ? "Unfollow" : "Following"}
                  </button>
                )}
                {!user?.following.includes(following._id) && (
                  <button
                    onClick={() => {
                      mutate(following._id);
                      setHovered(null);
                    }}
                    className="btn border border-gray-600 bg-white text-black text-md font-bold rounded-full mt-2 hover:bg-white/80"
                  >
                    Follow
                  </button>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default Follow;
