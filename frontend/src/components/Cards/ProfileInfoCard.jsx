import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext.jsx";
import { LuPencil } from "react-icons/lu";
import ProfilePhotoModal from "../ProfilePhotoModal.jsx";

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [openProfileSettings, setOpenProfileSettings] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/");
  };

  return (
    user && (
      <>
        <div className="flex items-center group relative">
          <div className="relative">
            <img
              src={user.profileImageUrl}
              alt="profile"
              className="w-11 h-11 bg-gray-300 rounded-full mr-3"
            />
            <button
              onClick={() => setOpenProfileSettings(true)}
              className="absolute -bottom-0.5 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-amber-600"
              title="Edit profile photo"
            >
              <LuPencil className="text-white text-[10px]" />
            </button>
          </div>
          <div>
            <div className="text-[15px] text-black font-bold leading-3">
              {user.name || ""}
            </div>
            <button
              className="text-amber-600 text-sm font-semibold hover:underline cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <ProfilePhotoModal
          isOpen={openProfileSettings}
          onClose={() => setOpenProfileSettings(false)}
        />
      </>
    )
  );
};

export default ProfileInfoCard;
