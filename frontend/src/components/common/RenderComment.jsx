import React from "react";
import { Link } from "react-router-dom";

const RenderComment = ({text}) => {
  const mentionRegex = /@(\w+)/g;

  const parts = text.split(mentionRegex);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <Link
          key={i}
          to={`/profile/${part}`}
          className="text-primary hover:underline"
        >
          @{part}
        </Link>
      );
    }
    return part;
  });
};

export default RenderComment;
