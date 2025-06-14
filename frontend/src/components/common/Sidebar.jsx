import { IoNotifications, IoHomeSharp } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchUser } from "../../services/userService";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const location = useLocation().pathname;
  const path = location.split("/")[1];

  const { mutate } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  return (
    <div className="fixed lg:sticky bottom-0 lg:top-12 left-0 bg-black/80 backdrop-blur-md z-20 flex lg:flex-col items-center justify-center lg:items-start w-full lg:w-60 h-16 lg:h-[calc(100vh-3rem)] border-t border-gray-700 lg:border-t-0">
      <ul className="flex lg:flex-col gap-3">
        <li className="flex justify-center lg:justify-start">
          <Link
            to="/"
            className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
          >
            <IoHomeSharp
              className={`w-8 h-8 ${location === "/" ? "text-primary" : ""}`}
            />
            <span className="text-2xl hidden md:block">Home</span>
          </Link>
        </li>
        <li className="flex justify-center lg:justify-start">
          <Link
            to="/notifications"
            className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
          >
            <IoNotifications
              className={`w-8 h-8 ${
                location === "/notifications" ? "text-primary" : ""
              }`}
            />
            <span className="text-2xl hidden md:block">Notifications</span>
          </Link>
        </li>

        <li className="flex justify-center lg:justify-start">
          <Link
            to={`/profile/${data?.username}`}
            className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
          >
            <FaUser
              className={`w-8 h-8 ${path === "profile" ? "text-primary" : ""}`}
            />
            <span className="text-2xl hidden md:block">Profile</span>
          </Link>
        </li>
      </ul>
      {data && (
        <Link
          to={`/profile/${data.username}`}
          className="lg:mt-auto lg:mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
        >
          <div className="avatar hidden lg:inline-flex">
            <div className="w-12 h-12 rounded-full">
              <img src={data?.profileImg || "/avatar-placeholder.png"} />
            </div>
          </div>
          <div className="flex justify-between flex-1">
            <div className="hidden lg:block mr-4">
              <p className="text-white font-bold text-sm w-24 truncate">
                {data?.fullName}
              </p>
              <p className="text-slate-500 text-sm">@{data?.username}</p>
            </div>
            <BiLogOut
              className="w-8 h-8 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                mutate();
              }}
            />
          </div>
        </Link>
      )}
    </div>
  );
};
export default Sidebar;
