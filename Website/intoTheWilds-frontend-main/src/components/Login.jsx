import React, { useState, useEffect } from "react"; // Import useEffect
import { useNavigate, Link } from "react-router-dom";
import { AtSign, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { api, loginUser, googleSignup } from "../api"; // Ensure googleSignup is imported
import axios from "axios";
import { Key } from "lucide-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../utils/baseurl";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import bgLogo from "../assets/IntotheWildStaysLogo.png";

const Login = () => {
  const [emailorphone, setEmailorphone] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();
  // const [form, setForm] = useState({ emailorphone:"",password:"" });
  // const handleChange = (e) =>
  //   setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await api.post(
        "/auth/login",
        { emailorphone, password: passwordValue },
        { withCredentials: true }
      );

      const { token, user } = data;

      // Persist session
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = user?.role?.toLowerCase();
      if (role === "admin") {
        navigate("/admin", {
          replace: true,
          state: {
            token,
            user,
          },
        });
      } else {
        navigate("/", {
          replace: true,
          state: {
            token,
            user,
          },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

const handleGoogleLogin = async (credentialResponse) => {
  setIsLoading(true);
  console.log(credentialResponse);
  try {
    const res = await axios.post(`${BASE_URL}/auth/google`, {
      credential: credentialResponse.credential, // ✅ backend expects only this
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ ...user, isGoogleUser: true }));

    toast.success("Google login successful");
    navigate("/user-profile", { state: { user } });
  } catch (error) {
    console.error("Google login failed:", error);
    toast.error("Google login failed.");
  } finally {
    setIsLoading(false);
  }
};



  const handleOtpSubmit = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/verify-email`, {
        emailorphone,
        otp,
      });
      console.log(res);
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setIsModalOpen(false);
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          navigate("/", { state: { user: res.data.user } });
        }, 2000);
      } else {
        toast.error("Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("OTP verification failed.");
    }
  };

  return (
    <div className="min-h-screen from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center lg:gap-10 px-4 pt-12 relative bg-[url('https://iili.io/2tGzdep.jpg')] bg-no-repeat bg-center bg-cover">
      <div className="hidden lg:flex items-center">
        <img className="w-56" src={bgLogo} alt="" />
        <h1 className="text-4xl font-bold">IntoTheWildStays</h1>
      </div>
      {/* Login Form */}
      <div className="w-full border-l-2 border-white max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-emerald-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-emerald-700">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-teal-500" />
              </div>
              <input
                placeholder="Email address or phone number"
                value={emailorphone}
                onChange={(e) => setEmailorphone(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-lg shadow-sm
                text-gray-900 placeholder-gray-500 font-medium
                disabled:opacity-50 disabled:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                transition duration-300 ease-in-out"
                style={{
                  caretColor: "#059669",
                  textAlign: "left",
                  lineHeight: "1.5",
                }}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full pl-10 pr-12 py-3 border border-emerald-300 rounded-lg shadow-sm
                text-gray-900 placeholder-gray-500 font-medium
                disabled:opacity-50 disabled:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                transition duration-300 ease-in-out"
                style={{
                  caretColor: "#059669",
                  textAlign: "left",
                  lineHeight: "1.5",
                }}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-teal-500" />
                ) : (
                  <Eye className="h-5 w-5 text-teal-500" />
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4
                border border-transparent rounded-lg shadow-sm
                text-base font-semibold text-white
                bg-gradient-to-r from-emerald-600 to-teal-600
                hover:from-emerald-700 hover:to-teal-700
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-teal-500
                transition duration-300 ease-in-out transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            {/* Google Login Custom Button */}
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={(response) => {
                  handleGoogleLogin(response);
                }}
                onError={() => {
                  console.log("Login failed");
                }}
                type="standard"
                text="continue_with"
                theme="dark"
                shape="square"
              />
            </div>
          </form>

          {error && (
            <div className="mt-4 text-center">
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">
                {error}
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-emerald-700">
                  New to our platform?
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/register"
                className="font-medium text-teal-600 hover:text-teal-500
                transition duration-300 ease-in-out hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Enter OTP
            </h3>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-teal-500" />
              </div>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="block w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-lg shadow-sm
                text-gray-900 placeholder-gray-500 font-medium
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                transition duration-300 ease-in-out"
                style={{
                  caretColor: "#059669",
                  textAlign: "left",
                  lineHeight: "1.5",
                }}
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleOtpSubmit}
                className="py-2 px-4 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition duration-300"
              >
                Confirm OTP
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">
              Login Successful!
            </h2>
            <p className="text-emerald-700 mb-4">Redirecting...</p>
            <div className="w-full bg-emerald-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full animate-countdown"
                style={{ animationDuration: "2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
