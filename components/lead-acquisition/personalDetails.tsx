import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
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

import { FormData, STATES } from "@/lib/types";

interface PersonalDetailsProps {
  register: UseFormRegister<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
  errors: FieldErrors<FormData>;
  shouldShowErrors: (stepNumber: number) => boolean;
}

export default function PersonalDetails({
  register,
  setValue,
  watch,
  errors,
  shouldShowErrors,
}: PersonalDetailsProps) {
  const watchedValues = watch();

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Legal First Name *
          </label>
          <Input
            type="text"
            placeholder="Enter your first name"
            {...register("fname", {
              required: "First name is required",
              minLength: {
                value: 2,
                message: "First name must be at least 2 characters",
              },
            })}
            className={
              errors.fname && shouldShowErrors(2) ? "border-red-500" : ""
            }
          />
          {errors.fname && shouldShowErrors(2) && (
            <p className="text-red-500 text-sm mt-1">{errors.fname?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Legal Middle Name (if any)
          </label>
          <Input
            type="text"
            placeholder="Enter your middle name (optional)"
            {...register("mname")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Legal Last Name *
          </label>
          <Input
            type="text"
            placeholder="Enter your last name"
            {...register("lname", {
              required: "Last name is required",
              minLength: {
                value: 2,
                message: "Last name must be at least 2 characters",
              },
            })}
            className={
              errors.lname && shouldShowErrors(2) ? "border-red-500" : ""
            }
          />
          {errors.lname && shouldShowErrors(2) && (
            <p className="text-red-500 text-sm mt-1">{errors.lname?.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Email Address *
        </label>
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email",
            },
          })}
          className={
            errors.email && shouldShowErrors(2) ? "border-red-500" : ""
          }
        />
        {errors.email && shouldShowErrors(2) && (
          <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone Number *</label>
        <Input
          type="tel"
          placeholder="Enter your phone number"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^\+?[\d\s-()]{10,}$/,
              message: "Please enter a valid phone number",
            },
          })}
          className={
            errors.phone && shouldShowErrors(2) ? "border-red-500" : ""
          }
        />
        {errors.phone && shouldShowErrors(2) && (
          <p className="text-red-500 text-sm mt-1">{errors.phone?.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Date of Birth *
        </label>
        <Input
          type="date"
          {...register("dob", {
            required: "Date of birth is required",
            validate: (value: string) => {
              const age =
                new Date().getFullYear() - new Date(value).getFullYear();
              if (age < 18) return "You must be at least 18 years old";
              if (age > 100) return "Please enter a valid date of birth";
              return true;
            },
          })}
          className={errors.dob && shouldShowErrors(2) ? "border-red-500" : ""}
        />
        {errors.dob && shouldShowErrors(2) && (
          <p className="text-red-500 text-sm mt-1">{errors.dob?.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">State *</label>
          <Select
            value={watchedValues.state}
            onValueChange={(value) => {
              setValue("state", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger
              className={`w-full ${
                errors.state && shouldShowErrors(2) ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("state", {
              required: "Please select your state",
            })}
          />
          {errors.state && shouldShowErrors(2) && (
            <p className="text-red-500 text-sm mt-1">{errors.state?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Postcode *</label>
          <Input
            type="text"
            placeholder="Enter your postcode"
            maxLength={4}
            {...register("postcode", {
              required: "Postcode is required",
              pattern: {
                value: /^\d{4}$/,
                message: "Please enter a valid 4-digit postcode",
              },
            })}
            className={
              errors.postcode && shouldShowErrors(2) ? "border-red-500" : ""
            }
          />
          {errors.postcode && shouldShowErrors(2) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.postcode?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
