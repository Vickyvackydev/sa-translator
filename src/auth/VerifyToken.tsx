import React, { useState, useRef, useEffect } from "react";
import { Globe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resendToken, verifyToken } from "../services/auth.service";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { authType, setToken, storedEmail } from "../state/slices/authReducer";

export default function VerifyTokenScreen() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const tokenType = useSelector(authType);
  const email = useSelector(storedEmail);
  const [resending, setResending] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(data)) return;

    const pasteData = data.split("");
    setOtp(pasteData);

    // Focus last input
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    const payload = {
      token: otp.join(""),
      type: tokenType || "REGISTER",
    };

    setIsLoading(true);
    try {
      const response = await verifyToken(payload);
      toast.success(response.message || "Email verified successfully!");
      if (tokenType === "PASSWORD_RESET") {
        dispatch(setToken(response?.data?.token));
        navigate("/reset-password");
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error(
        err.response?.data?.message ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    const payload = {
      email: email || "vickyvacky5@yopmail.com",
      type: tokenType || "REGISTER",
    };

    try {
      const response = await resendToken(payload);
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message);
      setResending(false);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-amber-600 rounded-2xl mb-4">
            <Globe className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Email
          </h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length < 6}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {resending ? "Resending..." : "Resend Code"}
              </button>
            </p>
          </div>

          <button
            onClick={() => navigate("/register")}
            className="mt-6 flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to registration
          </button>
        </div>
      </div>
    </div>
  );
}
