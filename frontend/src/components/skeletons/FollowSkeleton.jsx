const FollowSkeleton = () => {
  const arr = new Array(8).fill(0);

  return (
    <div>
      <div className="flex flex-col gap-4 w-3/4 p-4 mb-4">
        <div className="skeleton h-4 w-20 rounded-full"></div>
        <div className="skeleton h-4 w-28 rounded-full"></div>
      </div>

      {arr.map((_, index) => (
        <div key={index} className="flex w-full flex-col p-4">
          <div className="flex items-center gap-4">
            <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
            <div className="flex flex-col gap-4 w-3/4">
              <div className="skeleton h-4 w-1/2 rounded-full"></div>
              <div className="skeleton h-4 w-2/3 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowSkeleton;
