import React, { useState } from "react";
import { LuShield, LuUser } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import TwoFactorSettings from "../../components/TwoFactorSettings.jsx";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("security");

  const tabs = [
    { id: "security", label: "Security", icon: LuShield },
    // You can add more tabs here in the future
    // { id: "profile", label: "Profile", icon: LuUser },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "security" && <TwoFactorSettings />}
          {/* Add more tab content here */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
