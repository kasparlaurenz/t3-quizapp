export const ProgressBar = ({ width }: { width: number }) => {
  const color =
    width >= 80 ? "bg-green-300" : width >= 50 ? "bg-yellow-300" : "bg-red-300";

  return (
    <div className="mb-4 mt-4 flex h-2 w-3/4 rounded-md border border-zinc-400 bg-zinc-600 text-xs">
      <div
        style={{ width: width == 0 ? "0%" : `${width}%` }}
        className={`flex h-full flex-col justify-center whitespace-nowrap rounded-md text-center text-white shadow-none ${color}`}
      ></div>
    </div>
  );
};
