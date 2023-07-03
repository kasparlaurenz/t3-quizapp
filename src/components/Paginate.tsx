import React from "react";

const Paginate = ({
  currentPage,
  dataPerPage,
  totalData,
  paginate,
  nextPage,
  prevPage,
}: {
  currentPage: number;
  dataPerPage: number;
  totalData: number;
  paginate: (num: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalData / dataPerPage); i++) {
    pageNumbers.push(i);
  }
  return (
    <nav className=" mt-4 flex items-center justify-center gap-2">
      <button
        type="button"
        className="h-7 w-7 rounded-full bg-gray-500 font-bold text-white hover:bg-gray-700"
        onClick={prevPage}
      >
        ⮜
      </button>
      <ul className="flex gap-2">
        {pageNumbers.map((number) => (
          <li
            className={
              currentPage === number
                ? "h-2 w-2 cursor-pointer rounded-full bg-gray-300 text-center font-bold text-gray-800 hover:bg-gray-300"
                : "h-2 w-2 cursor-pointer rounded-full bg-gray-500 text-center font-bold text-gray-800 hover:bg-gray-300"
            }
            onClick={() => paginate(number)}
            key={number}
          ></li>
        ))}
      </ul>
      <button
        type="button"
        className="h-7 w-7 rounded-full bg-gray-500 font-bold text-white hover:bg-gray-700"
        onClick={nextPage}
      >
        ⮞
      </button>
    </nav>
  );
};

export default Paginate;
