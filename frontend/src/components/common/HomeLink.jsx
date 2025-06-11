import { Link, useLocation } from "react-router-dom";
import XSvg from "../svgs/X";

const HomeLink = () => {
  const path = useLocation().pathname;
  const param = path.split("/")[1];
  return (
    <Link
      to="/"
      className={`flex justify-center md:justify-start fixed lg:sticky top-0 ${
        param !== "profile" ? "" : "hidden lg:block"
      } lg:border-b-0 border-gray-700 z-30 bg-black/80`}
    >
      <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
    </Link>
  );
};

export default HomeLink;
