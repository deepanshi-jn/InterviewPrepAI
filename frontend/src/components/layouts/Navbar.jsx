import React from "react";
import ProfileInfoCard from "../Cards/ProfileInfoCard.jsx";
import { Link, useLocation } from "react-router-dom";
import { LuFileText, LuLayoutDashboard, LuSettings } from "react-icons/lu";

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="h-16 bg-white/90 border-b border-gray-200/50 backdrop-blur-md py-2.5 px-4 md:px-6 lg:px-8 sticky top-0 z-40">
      <div className="container mx-auto flex justify-between gap-5 items-center">
        <div className="flex items-center gap-6">
          <Link to="/dashboard">
            <h2 className="text-lg md:text-xl font-medium text-black leading-5">
              Interview Prep AI
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/dashboard")
                  ? "bg-amber-50 text-amber-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LuLayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/interview-history"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/interview-history")
                  ? "bg-amber-50 text-amber-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LuFileText className="w-4 h-4" />
              Reports
            </Link>
            <Link
              to="/settings"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/settings")
                  ? "bg-amber-50 text-amber-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LuSettings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>
        <ProfileInfoCard />
      </div>
    </div>
  );
};
