import React, { useState, useContext, useEffect } from "react";
import { APP_FEATURES } from "../utils/data";
import HERO_IMG from "../assets/hero-img.png";
import { useNavigate } from "react-router-dom";
import { LuSparkles, LuBrainCircuit, LuRocket, LuTarget, LuChevronRight, LuCode, LuTerminal, LuDatabase } from "react-icons/lu";
import { motion, useScroll, useTransform } from "framer-motion";
import Modal from "../components/Modal";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import { UserContext } from "../context/userContext.jsx";
import ProfileInfoCard from "../components/Cards/ProfileInfoCard.jsx";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-[#FFFCEF] overflow-hidden relative selection:bg-amber-200 selection:text-amber-900">
        
        {/* Dynamic Mesh Background Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: mousePosition.x * 2, 
              y: mousePosition.y * 2,
            }}
            transition={{ type: "spring", damping: 15, stiffness: 50 }}
            className="w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-br from-amber-300/30 via-orange-300/20 to-transparent blur-[80px] rounded-full absolute -top-[10%] -left-[10%] z-0" 
          />
          <motion.div 
            animate={{ 
              x: -mousePosition.x * 2, 
              y: -mousePosition.y * 2,
            }}
            transition={{ type: "spring", damping: 15, stiffness: 50 }}
            className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-bl from-amber-200/40 via-yellow-200/20 to-transparent blur-[80px] rounded-full absolute top-[20%] -right-[10%] z-0" 
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-6 relative z-10">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-center mb-16 md:mb-24 py-4 rounded-full bg-white/40 backdrop-blur-md px-6 md:px-8 border border-white/60 shadow-sm"
          >
            <div className="text-xl text-black font-extrabold tracking-tight flex items-center gap-2">
               <LuBrainCircuit className="text-amber-600 w-6 h-6" />
               Interview<span className="text-amber-600">Prep</span>AI
            </div>
            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                className="bg-black/95 text-sm font-semibold text-white rounded-full px-7 py-2.5 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                onClick={() => setOpenAuthModal(true)}
              >
                Login / Sign Up
              </button>
            )}
          </motion.header>

          {/* Hero Section */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20"
          >
            <motion.div variants={fadeIn} className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2 text-[13px] text-amber-700 font-bold bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-1.5 rounded-full border border-amber-200/60 shadow-sm">
                <LuSparkles className="animate-pulse" />
                Next-Generation AI Interviewing
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeIn}
              className="text-5xl md:text-7xl text-slate-900 font-extrabold mb-8 leading-[1.1] tracking-tight"
            >
              Ace Your Interviews with <br className="hidden md:block"/>
              <span className="relative inline-block mt-2 md:mt-4">
                <span className="absolute -inset-1 bg-gradient-to-r from-[#FF9324] via-[#FCD760] to-[#FF9324] blur-lg opacity-50 bg-[length:200%_auto] animate-text-shine"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#FF9324] via-[#FCD760] to-[#FF9324] bg-[length:200%_auto] animate-text-shine font-black">
                  AI-Powered 
                </span>
              </span>{" "}
              Mastery
            </motion.h1>

            <motion.p 
              variants={fadeIn}
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl font-medium leading-relaxed"
            >
              Get role-specific technical questions, dive deep into underlying concepts, and expand your answers dynamically. Your ultimate interview toolkit is here.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mb-20">
              <button
                className="bg-black text-[15px] font-bold text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-2 group"
                onClick={handleCTA}
              >
                Start Practicing Now
                <LuChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero Image Parallax / Tilt Section */}
        <div className="w-full relative z-20 px-4 md:px-8">
          <motion.div 
            style={{ y: heroY }}
            className="max-w-6xl mx-auto -mt-[80px] md:-mt-[120px] mb-6 md:mb-12 perspective-[2000px]"
          >
            <motion.div
              className="relative rounded-2xl md:rounded-[1rem] border-4 border-[#FED7AA] overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src={HERO_IMG}
                alt="AI Interview Platform Hero"
                className="w-full h-auto relative z-0 object-cover"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Infinite Marquee Section */}
        <div className="w-full overflow-hidden bg-white/60 py-10 md:py-10 border-y border-amber-100 relative ">
          <div className="max-w-7xl mx-auto px-4 mb-6">
            <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">Master technologies trusted by industry leaders</p>
          </div>
          <motion.div 
             className="flex w-max opacity-60"
             animate={{ x: [0, "-50%"] }}
             transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          >
             {[...Array(2)].map((_, j) => (
                <div key={j} className="flex gap-16 md:gap-32 justify-around items-center px-8 md:px-16">
                   <div className="flex items-center whitespace-nowrap gap-2 text-xl font-bold text-slate-700"><LuCode className="text-2xl text-amber-500" /> React Ecosystem</div>
                   <div className="flex items-center whitespace-nowrap gap-2 text-xl font-bold text-slate-700"><LuTerminal className="text-2xl text-slate-800" /> Node.js & Backend</div>
                   <div className="flex items-center whitespace-nowrap gap-2 text-xl font-bold text-slate-700"><LuDatabase className="text-2xl text-blue-500" /> Cloud & Databases</div>
                   <div className="flex items-center whitespace-nowrap gap-2 text-xl font-bold text-slate-700"><LuBrainCircuit className="text-2xl text-purple-500" /> System Design</div>
                </div>
             ))}
          </motion.div>
        </div>

        {/* Features Bento Grid */}
        <div className="w-full bg-[#FFFCEF] py-24 relative z-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Designed to Make You Unstoppable
              </h2>
              <p className="text-lg text-slate-600 font-medium">Everything you need to move from anxiety to complete confidence.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1: Large Span */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-amber-900/5 border border-amber-50 flex flex-col justify-end relative overflow-hidden group hover:shadow-2xl transition-shadow"
              >
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl group-hover:bg-amber-200 transition-colors duration-500" />
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                   <LuSparkles className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">{APP_FEATURES[0]?.title || "AI Role-Play"}</h3>
                <p className="text-slate-600 font-medium text-lg max-w-md relative z-10">{APP_FEATURES[0]?.description || "Experience hyper-realistic interview simulations tailored to your target job title."}</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="col-span-1 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-900/10 border border-slate-700 flex flex-col justify-end relative overflow-hidden group hover:shadow-2xl transition-shadow"
              >
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                   <LuBrainCircuit className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{APP_FEATURES[1]?.title || "Smart Feedback"}</h3>
                <p className="text-slate-300 font-medium">{APP_FEATURES[1]?.description || "Get actionable, real-time feedback on your answers."}</p>
              </motion.div>

              {/* Remaining Features in Grid */}
              {APP_FEATURES.slice(2, 5).map((feature, idx) => (
                <motion.div 
                  key={feature.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                  className="bg-white rounded-3xl p-8 shadow-lg shadow-amber-900/5 border border-amber-50 relative overflow-hidden group hover:-translate-y-1 transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl group-hover:bg-amber-50 transition-colors" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-slate-600 font-medium relative z-10">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="w-full bg-white border-t border-gray-200 text-sm font-medium text-slate-500 text-center py-8 z-20 relative">
          Made with ❤️ • Practice hard and ace your next interview
        </div>
      </div>

      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
        modalClassName="w-[900px] max-w-[95vw] bg-white/40 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-3xl border border-white/50"
      >
        <div className="flex w-full min-h-[550px] h-auto max-h-[90vh] overflow-hidden rounded-[1.5rem]">
          {/* Framer Native 3D Animation Scene */}
          <div className="hidden md:flex flex-1 relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] self-stretch items-center justify-center p-8 overflow-hidden rounded-l-[1.5rem]">
            {/* Ambient animated glow */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-96 h-96 bg-amber-500/20 rounded-full blur-[80px]"
            />
            {/* 3D Floating Elements */}
            <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ perspective: "1000px" }}>
              <motion.div
                animate={{ rotateY: [0, 15, -15, 0], rotateX: [0, 10, -10, 0], y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex items-center justify-center z-20 mb-8"
                style={{ transformStyle: "preserve-3d" }}
              >
                <LuBrainCircuit className="text-7xl text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
              </motion.div>
              
              <motion.div
                 animate={{ rotateY: [0, -25, 25, 0], x: [0, 30, -10, 0], y: [0, 15, -30, 0] }}
                 transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                 className="absolute top-[18%] left-[12%] w-20 h-20 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 rounded-2xl shadow-xl flex items-center justify-center z-10"
                 style={{ transformStyle: "preserve-3d" }}
              >
                 <LuRocket className="text-3xl text-orange-400 drop-shadow-md" />
              </motion.div>
              
              <motion.div
                 animate={{ rotateZ: [0, 30, -15, 0], rotateX: [0, 20, -20, 0], x: [0, -30, 25, 0], y: [0, 40, -10, 0] }}
                 transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                 className="absolute bottom-[25%] right-[15%] w-24 h-24 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-full shadow-xl flex items-center justify-center z-30"
                 style={{ transformStyle: "preserve-3d" }}
              >
                 <LuTarget className="text-4xl text-blue-400 drop-shadow-md" />
              </motion.div>

              <div className="text-center z-40 relative mt-4">
                 <h1 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">Interview Prep AI</h1>
                 <p className="text-sm text-slate-300 font-medium drop-shadow-md">Master your next interview with the power of AI</p>
              </div>
            </div>
          </div>
          
          {/* Form Container */}
          <div className="flex-1 flex flex-col justify-center items-center bg-white/80 p-8">
            {currentPage === "login" && (
              <Login
                setCurrentPage={setCurrentPage}
                closeModal={() => setOpenAuthModal(false)}
              />
            )}
            {currentPage === "signup" && (
              <SignUp
                setCurrentPage={setCurrentPage}
                closeModal={() => setOpenAuthModal(false)}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;
