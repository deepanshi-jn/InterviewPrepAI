import React, { useState, useContext } from "react";
import { LuUser, LuUpload, LuTrash2, LuSave } from "react-icons/lu";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { uploadImage } from "../utils/uploadImage";
import { UserContext } from "../context/userContext";
import SpinnerLoader from "./Loader/SpinnerLoader";

const ProfileSettingsModal = ({ onClose }) => {
  const { user, updateUser } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);

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
        imageUrl = await uploadImage(selectedImage);
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

  return (
    <div className="p-6 w-full">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
        Update Profile Photo
      </h2>

      <div className="flex flex-col items-center mb-4 md:mb-6">
        <div className="relative mb-4 md:mb-5">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center bg-amber-50 rounded-full border-4 border-gray-200">
              <LuUser className="text-5xl md:text-6xl text-amber-500" />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <label className="flex items-center justify-center gap-2 text-sm text-white font-medium bg-gradient-to-r from-[#FF9324] to-[#e99a4b] px-5 py-2.5 rounded-lg cursor-pointer hover:shadow-lg transition-all w-full sm:w-auto">
            <LuUpload />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {previewUrl && (
            <button
              onClick={handleRemoveImage}
              className="flex items-center justify-center gap-2 text-sm text-white font-medium bg-red-500 px-5 py-2.5 rounded-lg hover:bg-red-600 transition-all w-full sm:w-auto"
            >
              <LuTrash2 />
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t mt-2">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all w-full sm:w-auto"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveProfilePhoto}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#FF9324] to-[#e99a4b] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <SpinnerLoader />
              Saving...
            </>
          ) : (
            <>
              <LuSave />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
