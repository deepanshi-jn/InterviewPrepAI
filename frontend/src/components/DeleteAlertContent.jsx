import React from "react";
import { LuCircleAlert, LuTrash2 } from "react-icons/lu";

const DeleteAlertContent = ({ content, onDelete }) => {
  return (
    <div className="p-7 bg-gradient-to-br from-white to-red-50/30">
      {/* Warning Icon */}
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
          <LuCircleAlert className="w-8 h-8 text-red-600" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Confirm Deletion
        </h3>
        <p className="text-sm text-gray-600">{content}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onDelete}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105"
        >
          <LuTrash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlertContent;
