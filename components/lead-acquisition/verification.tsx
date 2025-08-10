import { Input } from "@/components/ui/input";

interface VerificationProps {
  otp: string;
  setOtp: (otp: string) => void;
  serverOtp: string;
  handleResendOTP: () => void;
}

export default function Verification({
  otp,
  setOtp,
  serverOtp,
  handleResendOTP,
}: VerificationProps) {
  return (
    <div className="space-y-6 py-16">
      <div className="text-center">
        <h2 className="text-xl font-bold">Verify Your Email</h2>
        <p className="text-gray-600 mt-2">
          We&apos;ve sent a 6-digit verification code to your email address.
          Please enter it below to continue. Expires in 10 minutes.
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <label className="block text-sm font-medium mb-2">
          Verification Code
        </label>
        <Input
          type="text"
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
          }}
          className="text-center text-lg tracking-widest"
          maxLength={6}
          autoComplete="one-time-code"
        />

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Didn&apos;t receive the code? Resend
          </button>
        </div>

        {/* Development OTP Display */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-2">
              Development Mode - Server Generated OTP
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-green-700 bg-green-100 px-4 py-2 rounded border">
                {serverOtp || "Waiting for OTP..."}
              </div>
            </div>
            <p className="text-green-600 text-xs mt-2 text-center">
              This OTP was generated on the server and will be hidden in
              production. It is valid for 10 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
