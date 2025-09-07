import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <span className="text-sm text-gray-600">
        Halaman <span className="font-semibold">{currentPage}</span> dari{" "}
        <span className="font-semibold">{totalPages}</span>
      </span>

      {/* Pagination Buttons */}
      <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`p-2 rounded-md transition hover:bg-gray-100 text-gray-600 ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
          title="Halaman Sebelumnya"
        >
          <FiChevronLeft size={18} />
        </button>

        {generatePageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-md text-sm font-medium transition
              ${
                page === currentPage
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md transition hover:bg-gray-100 text-gray-600 ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
          }`}
          title="Halaman Berikutnya"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
