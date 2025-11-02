import { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";
import { User, AtSign, Lock, Key } from "lucide-react";
import { BASE_URL } from "../utils/baseurl";
import axios from "axios";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { googleSignup } from "../api";
import bgLogo from "../assets/IntotheWildStaysLogo.png";

const Register = () => {
  const [name, setName] = useState("");
  const [emailorphone, setEmailorphone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // New email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailorphone)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return; // Exit the function if validation fails
    }

    // New password validation
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$#!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and include letters, numbers, and special symbols."
      );
      setIsLoading(false);
      return; // Exit the function if validation fails
    }

    try {
      setIsLoading(true);
      const data = await registerUser(name, emailorphone, password);
      setIsModalOpen(true); // Open OTP modal
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
    setIsLoading(false);
  };

  const handleGoogleSignup = async (response) => {
    const res = await googleSignup(response);
    toast.success(res.data.message);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setShowSuccessDialog(true);
    setTimeout(() => {
      setShowSuccessDialog(false);
      navigate("/");
    }, 2000);
  };

  const handleOtpSubmit = async () => {
    if (otp) {
      setIsLoading(true);
      const data = await axios.post(`${BASE_URL}/auth/verify-email`, {
        emailorphone,
        otp,
      });
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      if (data.status === 200) {
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          navigate("/");
        }, 2000);
      } else {
        setError("Invalid OTP. Please try again.");
      }
      setIsLoading(false);
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:gap-10 px-4 py-32 bg-[url('https://iili.io/2tGzdep.jpg')] bg-no-repeat bg-center bg-cover">
      <div className="hidden lg:flex items-center">
        <img className="w-56" src={bgLogo} alt="" />
        <h1 className="text-4xl font-bold">IntoTheWildStays</h1>
      </div>
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden border border-emerald-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-emerald-900">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-emerald-700">
              Sign up to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-teal-500" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-teal-500" />
              </div>
              <input
                placeholder="Email address or phone number"
                value={emailorphone}
                onChange={(e) => setEmailorphone(e.target.value)}
                required
                className="block w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-500" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={(response) => {
                  handleGoogleSignup(response);
                }}
                onError={() => {
                  toast.error("Login failed");
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/login"
                className="font-medium text-teal-600 hover:text-teal-500 
                transition duration-300 ease-in-out hover:underline"
              >
                Sign in to your account
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
                className="block w-full pl-10 pr-4 py-3 border border-emerald-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out"
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
              Signup Successful!
            </h2>
            <p className="text-emerald-700 mb-4">Start Booking</p>
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

export default Register;
