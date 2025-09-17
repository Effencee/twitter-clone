import React from "react";

const SelectedPostSkeleton = () => {
  const arr = Array(5).fill(0);
  return (
    <>
      <div className="flex w-full flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
          <div className="flex flex-col gap-4 w-full">
            <div className="skeleton h-4 w-3/5 rounded-full"></div>
            <div className="skeleton h-4 w-4/5 rounded-full"></div>
          </div>
        </div>
        <div className="skeleton h-40 w-full rounded-xl"></div>
      </div>
      <div className="flex justify-center gap-4 w-full p-4">
        <div className="skeleton h-20 w-full rounded-xl"></div>
      </div>
      {arr.map((_, index) => (
        <div className="flex items-center gap-4 p-4" key={index}>
          <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
          <div className="flex flex-col gap-4 w-full">
            <div className="skeleton h-4 w-3/5 rounded-full"></div>
            <div className="skeleton h-4 w-4/5 rounded-full"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SelectedPostSkeleton;
