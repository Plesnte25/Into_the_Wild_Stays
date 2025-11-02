import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  ArrowLeft,
  Shield,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import api from "../lib/axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Enter details, 2: Verify OTPs, 3: Reset password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });

  const [otpData, setOtpData] = useState({
    emailOtp: "",
    phoneOtp: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Timers for OTP resend
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);

  // Send OTP to both email and phone
  const sendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Validate phone format (Indian format)
      const phoneRegex = /^[1-9]\d{9}$/;
      const cleanPhone = formData.phone.replace(/\D/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }

      // Send OTP to email
      const emailResponse = await api.post("/auth/send-email-otp", {
        email: formData.email,
        purpose: "password_reset",
      });

      // Send OTP to phone
      const phoneResponse = await api.post("/auth/send-sms-otp", {
        phone: `+91${cleanPhone}`,
        purpose: "password_reset",
      });

      if (emailResponse.data.success && phoneResponse.data.success) {
        setStep(2);
        setSuccess("OTP sent to your email and phone");

        // Start resend timers (2 minutes)
        setEmailResendTimer(120);
        setPhoneResendTimer(120);
        startResendTimers();
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP sending error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Start countdown timers for OTP resend
  const startResendTimers = () => {
    const emailInterval = setInterval(() => {
      setEmailResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(emailInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const phoneInterval = setInterval(() => {
      setPhoneResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(phoneInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP functions
  const resendEmailOtp = async () => {
    if (emailResendTimer > 0) return;

    try {
      await api.post("/auth/send-email-otp", {
        email: formData.email,
        purpose: "password_reset",
      });
      setEmailResendTimer(120);
      setSuccess("Email OTP resent successfully");
    } catch (err) {
      setError("Failed to resend email OTP");
    }
  };

  const resendPhoneOtp = async () => {
    if (phoneResendTimer > 0) return;

    try {
      const cleanPhone = formData.phone.replace(/\D/g, "");
      await api.post("/auth/send-sms-otp", {
        phone: `+91${cleanPhone}`,
        purpose: "password_reset",
      });
      setPhoneResendTimer(120);
      setSuccess("SMS OTP resent successfully");
    } catch (err) {
      setError("Failed to resend SMS OTP");
    }
  };

  // Verify OTPs and proceed to password reset
  const verifyOtps = async () => {
    setLoading(true);
    setError("");

    try {
      // Verify both OTPs
      const [emailVerify, phoneVerify] = await Promise.all([
        api.post("/auth/verify-email-otp", {
          email: formData.email,
          otp: otpData.emailOtp,
        }),
        api.post("/auth/verify-sms-otp", {
          phone: `+91${formData.phone.replace(/\D/g, "")}`,
          otp: otpData.phoneOtp,
        }),
      ]);

      if (emailVerify.data.success && phoneVerify.data.success) {
        setStep(3);
        setSuccess("Identity verified. You can now set your new password.");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please check the codes and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      const response = await api.post("/auth/reset-password", {
        email: formData.email,
        phone: `+91${formData.phone.replace(/\D/g, "")}`,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/admin/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-teal-50 to-blue-100 py-8 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Secure two-factor authentication required
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 px-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                  step >= stepNumber
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
              </div>
              <span
                className={`text-xs mt-2 ${
                  step >= stepNumber
                    ? "text-teal-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {stepNumber === 1 && "Verify Identity"}
                {stepNumber === 2 && "Enter OTP"}
                {stepNumber === 3 && "New Password"}
              </span>
            </div>
          ))}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2 mx-16"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Step 1: Enter Email & Phone */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verify Your Identity
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter your registered email and phone number. We'll send
                  verification codes to both for security.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="xxxxxxxxxxx@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="xxxxxxxx12"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your 10-digit Indian phone number without country code
                  </p>
                </div>
              </div>

              <button
                onClick={sendOtp}
                disabled={loading || !formData.email || !formData.phone}
                className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : null}
                {loading ? "Sending OTP..." : "Send Verification Code"}
              </button>
            </div>
          )}

          {/* Step 2: Verify OTPs */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Enter Verification Codes
                </h2>
                <p className="text-gray-600 text-sm">
                  We've sent 6-digit codes to your email and phone. Enter both
                  to continue.
                </p>
              </div>

              <div className="space-y-4">
                {/* Email OTP */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-blue-800">
                      <Mail size={16} />
                      Email Code
                    </label>
                    <button
                      onClick={resendEmailOtp}
                      disabled={emailResendTimer > 0}
                      className="text-xs text-blue-600 hover:text-blue-800 disabled:text-blue-400 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {emailResendTimer > 0 ? (
                        <>
                          <Clock size={12} />
                          {formatTime(emailResendTimer)}
                        </>
                      ) : (
                        "Resend"
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-mono text-lg"
                    placeholder="123456"
                    value={otpData.emailOtp}
                    onChange={(e) =>
                      setOtpData({
                        ...otpData,
                        emailOtp: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  <p className="text-xs text-blue-600 mt-2">
                    Sent to: {formData.email}
                  </p>
                </div>

                {/* Phone OTP */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-green-800">
                      <Phone size={16} />
                      SMS Code
                    </label>
                    <button
                      onClick={resendPhoneOtp}
                      disabled={phoneResendTimer > 0}
                      className="text-xs text-green-600 hover:text-green-800 disabled:text-green-400 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {phoneResendTimer > 0 ? (
                        <>
                          <Clock size={12} />
                          {formatTime(phoneResendTimer)}
                        </>
                      ) : (
                        "Resend"
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-center font-mono text-lg"
                    placeholder="123456"
                    value={otpData.phoneOtp}
                    onChange={(e) =>
                      setOtpData({
                        ...otpData,
                        phoneOtp: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  <p className="text-xs text-green-600 mt-2">
                    Sent to: +91 {formData.phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={verifyOtps}
                  disabled={
                    loading ||
                    otpData.emailOtp.length !== 6 ||
                    otpData.phoneOtp.length !== 6
                  }
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : null}
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Set New Password
                </h2>
                <p className="text-gray-600 text-sm">
                  Create a strong new password for your account.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={resetPassword}
                  disabled={
                    loading ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : null}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/admin/login"
              className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            <Shield size={12} className="inline mr-1" />
            Two-factor authentication ensures your account security
          </p>
        </div>
      </div>
    </div>
  );
}
