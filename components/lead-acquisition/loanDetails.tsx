import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";

import { FormData, LOAN_TYPES } from "@/lib/types";

interface LoanDetailsProps {
  register: UseFormRegister<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
  errors: FieldErrors<FormData>;
  shouldShowErrors: (stepNumber: number) => boolean;
}

export default function LoanDetails({
  register,
  setValue,
  watch,
  errors,
  shouldShowErrors,
}: LoanDetailsProps) {
  const watchedValues = watch();

  return (
    <div className="space-y-6 w-full py-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Loan Amount ($) *
        </label>
        <Input
          type="number"
          placeholder="Enter loan amount"
          {...register("loanAmount", {
            required: "Loan amount is required",
            min: {
              value: 1000,
              message: "Minimum loan amount is $1,000",
            },
            validate: (value: string) => {
              if (isNaN(Number(value)) || Number(value) <= 0) {
                return "Please enter a valid loan amount";
              }
              return true;
            },
          })}
          className={
            errors.loanAmount && shouldShowErrors(1) ? "border-red-500" : ""
          }
        />
        {errors.loanAmount && shouldShowErrors(1) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.loanAmount?.message}
          </p>
        )}
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-2">Loan Type *</label>
        <Select
          value={watchedValues.loanType}
          onValueChange={(value) => {
            setValue("loanType", value, { shouldValidate: true });
          }}
        >
          <SelectTrigger
            className={`w-full ${
              errors.loanType && shouldShowErrors(1) ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Select loan type" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {LOAN_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Hidden input for validation */}
        <input
          type="hidden"
          {...register("loanType", {
            required: "Please select a loan type",
          })}
        />
        {errors.loanType && shouldShowErrors(1) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.loanType?.message}
          </p>
        )}
      </div>
    </div>
  );
}
