import React, { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { LuUser, LuUpload, LuTrash2, LuSave, LuX } from "react-icons/lu";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { uploadImage } from "../utils/uploadImage";
import { UserContext } from "../context/userContext";
import SpinnerLoader from "./Loader/SpinnerLoader";

const ProfilePhotoModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Function to update user in context
  const setUser = (userData) => {
    updateUser({
      ...userData,
      token: localStorage.getItem("token"),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSaveProfilePhoto = async () => {
    try {
      setIsLoading(true);
      let imageUrl = previewUrl;

      // Upload new image if selected
      if (selectedImage) {
        const uploadResponse = await uploadImage(selectedImage);
        imageUrl = uploadResponse.imageUrl;
      }

      // Update profile photo in backend
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE_PHOTO,
        {
          profileImageUrl: imageUrl || "",
        }
      );

      if (response.data) {
        // Update user state directly (context setUser)
        setUser(response.data);
        toast.success("Profile photo updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Failed to update profile photo:", error);
      toast.error("Failed to update profile photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-white to-amber-50/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-amber-100/50">
        {/* Decorative gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9324] to-[#FCD760] rounded-t-2xl"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full p-2 transition-all z-10 backdrop-blur-sm"
          disabled={isLoading}
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF9324] to-[#FCD760] bg-clip-text text-transparent text-center">
              Update Profile Photo
            </h2>
            <p className="text-sm text-gray-600 text-center mt-2">
              Choose a photo that represents you
            </p>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-6">
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-amber-200 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF9324]/20 to-[#FCD760]/20 group-hover:from-[#FF9324]/30 group-hover:to-[#FCD760]/30 transition-all"></div>
                </div>
              ) : (
                <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 rounded-full border-4 border-white shadow-lg">
                  <LuUser className="text-6xl md:text-7xl text-amber-500" />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <label className="flex items-center justify-center gap-2 text-sm text-white font-semibold bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-black hover:to-black px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                <LuUpload className="w-4 h-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>

              {previewUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center justify-center gap-2 text-sm text-white font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  disabled={isLoading}
                >
                  <LuTrash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all w-full sm:w-auto hover:scale-105"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfilePhoto}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-black hover:to-black rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <SpinnerLoader />
                  Saving...
                </>
              ) : (
                <>
                  <LuSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProfilePhotoModal;
