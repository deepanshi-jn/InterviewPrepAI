import React from "react";
import { LuX } from "react-icons/lu";

const Drawer = ({ isOpen, onClose, title, children, className = "" }) => {
  return (
    <div
      className={`fixed top-[64px] right-0 h-[calc(100vh-64px)] p-4 overflow-y-auto w-full md:w-[40vw] bg-white shadow-2xl  transition-transform shadow-cyan-800/10 border-r border-l-gray-800 z-40 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${className}`}
      tabIndex="-1"
      aria-labelledby="drawer-right-label"
    >
      <div className="flex justify-between items-center mb-4">
        <h5
          id="drawer-right-label"
          className="flex items-center text-base font-semibold text-black"
        >
          {title}
        </h5>
        <button
          onClick={onClose}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center"
          aria-label="Close drawer"
          type="button"
        >
          <LuX className="" />
        </button>
      </div>
      <div className="text-sm mx-3 mb-6">{children}</div>
    </div>
  );
};

export default Drawer;
