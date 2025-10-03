import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useLocation } from "react-router";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { ShieldCheckIcon, MailIcon, LoaderIcon } from "lucide-react";
import Logo from "../components/Logo";

function EmailVerificationPage() {
  const [otp, setOtp] = useState("");
  const { verifyEmail, resendOTP, isVerifyingEmail, isResendingOTP } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and userId from location state
  const email = location.state?.email || "";
  const userId = location.state?.userId || "";

  // Redirect to signup if no email or userId
  useEffect(() => {
    if (!email || !userId) {
      navigate("/signup");
    }
  }, [email, userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !userId) return;

    try {
      await verifyEmail({ userId, otp });
      navigate("/"); // Changed from "/chat" to "/"
    } catch (error) {
      // Error is handled in the store with toast
      console.error("Verification error:", error);
    }
  };

  const handleResendOTP = async () => {
    if (!userId) return;

    try {
      await resendOTP({ userId });
    } catch (error) {
      // Error is handled in the store with toast
      console.error("Resend OTP error:", error);
    }
  };

  // Don't render the form if we don't have required data
  if (!email || !userId) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <div className="absolute top-4 left-4 z-10">
          <Logo size="xl" animated={true} />
        </div>
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8">
                  <ShieldCheckIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Verify Your Email</h2>
                  <p className="text-slate-400">
                    Please enter the verification code sent to your email address
                  </p>
                  <div className="mt-2 text-slate-300 font-medium">{email}</div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP INPUT */}
                  <div>
                    <label className="auth-input-label">Verification Code</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="input"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button 
                    className="auth-btn" 
                    type="submit" 
                    disabled={isVerifyingEmail || !otp || otp.length < 6}
                  >
                    {isVerifyingEmail ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Verify Email"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={isResendingOTP}
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {isResendingOTP ? "Sending..." : "Resend Verification Code"}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="auth-link"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/email-verification.png"
                  alt="Email verification"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Secure Your Account
                  </h3>
                  <p className="mt-2 text-slate-400">
                    Email verification helps protect your account from unauthorized access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default EmailVerificationPage;