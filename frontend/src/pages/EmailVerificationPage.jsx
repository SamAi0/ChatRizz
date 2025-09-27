import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { Mail, Shield, ArrowLeft, RefreshCcw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function EmailVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationData, setVerificationData] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  useEffect(() => {
    // Get verification data from location state or redirect
    const data = location.state;
    if (!data || !data.email || !data.userId) {
      navigate("/signup");
      return;
    }
    setVerificationData(data);
  }, [location.state, navigate]);

  useEffect(() => {
    // If user is already authenticated, redirect to chat
    if (authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  useEffect(() => {
    // Cooldown timer for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (i + index < 6 && /^\d$/.test(char)) {
          newOtp[i + index] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastFilledIndex = Math.min(index + pastedData.length - 1, 5);
      document.getElementById(`otp-${lastFilledIndex}`)?.focus();
      return;
    }

    // Handle single character input
    if (/^\d$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value !== "" && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: verificationData.userId,
          otp: otpString,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        // The auth cookie will be set automatically
        window.location.href = "/"; // Force full page reload to update auth state
      } else {
        toast.error(data.message);
        if (data.message.includes("expired")) {
          setOtp(["", "", "", "", "", ""]);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: verificationData.userId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        setOtp(["", "", "", "", "", ""]);
        setResendCooldown(120); // 2 minutes cooldown
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!verificationData) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-md">
        <BorderAnimatedContainer>
          <div className="p-8 text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-2">Verify Your Email</h2>
              <p className="text-slate-400 text-sm">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-cyan-400 font-medium">{verificationData.email}</p>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="6"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold border-2 border-slate-600 rounded-lg bg-slate-800 text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    autoComplete="off"
                  />
                ))}
              </div>
              
              <p className="text-slate-500 text-xs">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || otp.join("").length !== 6}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isVerifying ? "Verifying..." : "Verify Email"}
            </button>

            {/* Resend Section */}
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Didn't receive the code?</p>
              <button
                onClick={handleResendOtp}
                disabled={isResending || resendCooldown > 0}
                className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <RefreshCcw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : isResending 
                    ? "Sending..." 
                    : "Resend Code"
                }
              </button>
            </div>

            {/* Back to signup */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={() => navigate("/signup")}
                className="text-slate-400 hover:text-slate-300 text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Sign Up
              </button>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default EmailVerificationPage;