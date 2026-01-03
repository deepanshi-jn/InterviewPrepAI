import React from "react";
import { LuRocket, LuSparkles, LuTarget } from "react-icons/lu";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 min-h-[calc(100vh-200px)]">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-orange-50 to-pink-50 rounded-full p-6">
          <LuRocket className="text-5xl text-orange-500" />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
        Ready to Start Your Journey?
      </h2>
      <p className="text-gray-600 text-center mb-6 max-w-md text-sm md:text-base">
        Create your first interview preparation session and unlock a world of
        curated questions tailored just for you!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-6">
        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-11 h-11 flex items-center justify-center mb-3">
            <LuSparkles className="text-xl text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1.5 text-sm md:text-base">AI-Powered</h3>
          <p className="text-xs md:text-sm text-gray-600">
            Get intelligent questions tailored to your role and experience level
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-full w-11 h-11 flex items-center justify-center mb-3">
            <LuTarget className="text-xl text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1.5 text-sm md:text-base">Focused Practice</h3>
          <p className="text-xs md:text-sm text-gray-600">
            Target specific topics and skills you want to master
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-full w-11 h-11 flex items-center justify-center mb-3">
            <LuRocket className="text-xl text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1.5 text-sm md:text-base">Track Progress</h3>
          <p className="text-xs md:text-sm text-gray-600">
            Monitor your preparation journey and stay organized
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2 justify-center">
          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          Click "Add New" button below to create your first session
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
