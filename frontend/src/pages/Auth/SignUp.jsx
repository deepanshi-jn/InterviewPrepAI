import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext.jsx";
import { uploadImage } from "../../utils/uploadImage";

const Signup = ({ setCurrentPage, closeModal }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    let profileImageUrl = "";
    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError("");
    try {
      //upload profile image if selected
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
      });
      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        closeModal();
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during sign up. Please try again.");
      }
    }
  };

  return (
    <div className="w-full flex flex-col justify-center bg-transparent mt-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Create an Account
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Join us today by entering your details below.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-2.5">
        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

        <div className="space-y-2.5">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            label="Full Name"
            placeholder="John Doe"
            type="text"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email Address"
            placeholder="email@example.com"
            type="email"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSignUp(e);
              }
            }}
            label="Password"
            placeholder="min 8 characters"
            type="password"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-[#FF9324] to-[#FFA94D] hover:from-[#e68420] hover:to-[#e69540] text-white font-medium rounded-lg transition-all mt-3 text-sm"
        >
          SIGN UP
        </button>

        <p className="text-xs text-gray-600 text-center mt-3">
          Already have an account?{" "}
          <button
            type="button"
            className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
            onClick={() => setCurrentPage("login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default Signup;
