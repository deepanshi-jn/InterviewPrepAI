import React from "react";

const Modal = ({ children, isOpen, onClose, title, hideHeader, modalClassName = "max-w-2xl bg-white shadow-lg rounded-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm w-full h-full p-4">
      <div
        className={`relative flex flex-col overflow-hidden w-auto my-auto ${modalClassName}`}
      >
        {!hideHeader && (
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="md:text-lg font-medium text-gray-900">{title}</h3>
          </div>
        )}

        <button
          type="button"
          className="text-gray-400 bg-black/5 backdrop-blur hover:bg-black/10 hover:text-gray-900 rounded-full text-sm w-8 h-8 flex justify-center items-center absolute top-4 right-4 cursor-pointer z-50 transition-all border border-black/5 shadow-sm"
          onClick={onClose}
        >
          <svg
            className="w-3.5 h-3.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="gray"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>

        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[90vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
