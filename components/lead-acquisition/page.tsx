"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { FormData, STEPS, LOAN_TYPES } from "@/lib/types";
import LoanDetails from "@/components/lead-acquisition/loanDetails";
import PersonalDetails from "@/components/lead-acquisition/personalDetails";
import Verification from "@/components/lead-acquisition/verification";
import LoanApplication from "@/components/lead-acquisition/loanApplication";

export default function LeadAcq() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState(""); // Store server-generated OTP, here for demo purposes
  const [isVerifying, setIsVerifying] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    getValues,
    clearErrors,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      loanAmount: "",
      loanType: "",
      fname: "",
      mname: "",
      lname: "",
      email: "",
      phone: "",
      dob: "",
      state: "",
      postcode: "",
    },
  });

  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(new Set());

  const validateCurrentStep = async (): Promise<boolean> => {
    const currentStepConfig = STEPS.find((step) => step.id === currentStep);
    if (!currentStepConfig) return true;

    const fieldsToValidate = currentStepConfig.fields as (keyof FormData)[];

    if (fieldsToValidate.length === 0) return true;

    setAttemptedSteps((prev) => new Set(prev).add(currentStep));

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const shouldShowErrors = (stepNumber: number): boolean => {
    return attemptedSteps.has(stepNumber);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep === 2) {
        try {
          const formData = getValues();
          const response = await fetch("/api/loan-application", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          if (response.ok) {
            sessionStorage.setItem("leadId", result.leadId);
            setLeadId(result.leadId);

            // Store the OTP in development mode
            if (result.otp) {
              setServerOtp(result.otp);
              console.log("Development OTP received:", result.otp);
            }

            setCurrentStep(currentStep + 1);
          } else {
            toast.error(
              result.error || "Failed to submit application. Please try again."
            );
          }
        } catch (error) {
          toast.error("Error submitting form: " + error);
          toast.error("Failed to submit application. Please try again.");
        }
      } else if (currentStep === 3) {
        await handleOTPVerification();
      } else if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Handle OTP verification
  const handleOTPVerification = async () => {
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    const currentLeadId = leadId || sessionStorage.getItem("leadId");
    if (!currentLeadId) {
      toast.error("Session expired. Please start over.");
      setCurrentStep(1);
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: currentLeadId,
          otp: otp,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setCurrentStep(currentStep + 1);
      } else {
        toast.error(result.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Error verifying OTP: " + error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    const currentLeadId = leadId || sessionStorage.getItem("leadId");
    if (!currentLeadId) {
      toast.error("Session expired. Please start over.");
      return;
    }

    try {
      const response = await fetch("/api/verify-otp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId: currentLeadId }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        setOtp(""); // Clear current OTP
      } else {
        toast.error(result.error || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Error resending OTP: " + error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      const currentStepConfig = STEPS.find((step) => step.id === currentStep);
      if (currentStepConfig) {
        const fieldsToClear = currentStepConfig.fields as (keyof FormData)[];
        fieldsToClear.forEach((field: keyof FormData) => clearErrors(field));
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/loan-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      toast.error("Error submitting form: " + error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLoanAmount = (amount: string) => {
    const num = Number(amount);
    if (num >= 100000) {
      return `$${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num}`;
  };

  const watchedValues = watch();

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-16 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your loan application. We&apos;ll review your
            information and get back to you within 24 hours. Please save your
            application ID for future reference.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <p>
              <strong>Application ID:</strong> {leadId}
            </p>
            <p>
              <strong>Loan Type:</strong>{" "}
              {
                LOAN_TYPES.find((t) => t.value === watchedValues.loanType)
                  ?.label
              }
            </p>
            <p>
              <strong>Amount:</strong>{" "}
              {formatLoanAmount(watchedValues.loanAmount)}
            </p>
            <p>
              <strong>Name:</strong> {watchedValues.fname} {watchedValues.mname}{" "}
              {watchedValues.lname}
            </p>
            <p>
              <strong>Email:</strong> {watchedValues.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="hidden md:flex justify-between items-center mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.id <= currentStep
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-4 ${
                    step.id < currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
      {/* Progress Bar ends here */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6 relative z-10">
          {/* Step 1 - Loan Details*/}
          {currentStep === 1 && (
            <LoanDetails
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              shouldShowErrors={shouldShowErrors}
            />
          )}
          {/* Step 1 ends here */}

          {/* Step 2 - personal details */}
          {currentStep === 2 && (
            <PersonalDetails
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              shouldShowErrors={shouldShowErrors}
            />
          )}
          {/* Step 2 ends here */}

          {/* Step 3 - Verification*/}
          {currentStep === 3 && (
            <Verification
              otp={otp}
              setOtp={setOtp}
              serverOtp={serverOtp}
              handleResendOTP={handleResendOTP}
            />
          )}
          {/* Step 3 ends here */}

          {/* Step 4 - Loan Application */}
          {currentStep === 4 && <LoanApplication />}
          {/* Step 4 ends here */}
        </div>

        {/* Navigation starts her */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < STEPS.length ? (
            <div>
              <Button
                type="button"
                onClick={handleNext}
                disabled={isVerifying}
                className="flex items-center gap-2 hover:cursor-pointer"
              >
                {currentStep === 3
                  ? isVerifying
                    ? "Verifying..."
                    : "Verify Code"
                  : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 hover:cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
        {/* Navigation ends here */}
      </form>
    </div>
  );
}
