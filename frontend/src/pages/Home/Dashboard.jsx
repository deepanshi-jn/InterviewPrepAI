import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { CARD_BG } from "../../utils/data";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layouts/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import SummaryCard from "../../components/Cards/SummaryCard.jsx";
import moment from "moment";
import Modal from "../../components/Modal.jsx";
import CreateSessionForm from "../Home/CreateSessionForm.jsx";
import DeleteAlertContent from "../../components/DeleteAlertContent.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import SpinnerLoader from "../../components/Loader/SpinnerLoader.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session deleted successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions();
    } catch (error) {
      console.error("Failed to delete session", error);
      toast.error("Failed to delete session. Please try again.");
      return;
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-[#FFFCEF] min-h-screen">
        <div className="container mx-auto pt-8 pb-8 px-4 md:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <SpinnerLoader />
            </div>
          ) : sessions?.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-[#FF9324] to-[#FCD760] rounded-full"></div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Your Interview Sessions
                  </h1>
                </div>
                <p className="text-gray-600 ml-16">
                  Manage and track your interview preparation journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions?.map((data, index) => (
                  <SummaryCard
                    key={data?._id}
                    colors={CARD_BG[index % CARD_BG.length]}
                    role={data?.role || ""}
                    topicsToFocus={data?.topicsToFocus || ""}
                    experience={data?.experience || "-"}
                    questions={data?.questions?.length || "-"}
                    description={data?.description || ""}
                    lastUpdated={
                      data?.updatedAt
                        ? moment(data?.updatedAt).format("Do MMM YYYY")
                        : ""
                    }
                    onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                    onDelete={() => setOpenDeleteAlert({ open: true, data })}
                  />
                ))}
              </div>
            </>
          )}
          <button
            className="group fixed bottom-10 md:bottom-20 right-10 md:right-20 z-50 flex items-center justify-center gap-2 h-12 px-5 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-[#e68420] hover:to-[#e69540] text-white font-medium rounded-full shadow-lg shadow-amber-300/30 hover:shadow-amber-400/40 transition-all duration-300 hover:scale-105 text-sm"
            onClick={() => setOpenCreateModal(true)}
          >
            <LuPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New</span>
          </button>
        </div>
      </div>
      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
        }}
        hideHeader
      >
        <div>
          <CreateSessionForm />
        </div>
      </Modal>
      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete Alert"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Are you sure you want to delete this session? This action cannot be undone."
            onDelete={() => {
              deleteSession(openDeleteAlert.data);
            }}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
