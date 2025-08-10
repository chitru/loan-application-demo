export interface FormData {
  loanAmount: string;
  loanType: string;
  fname: string;
  mname?: string;
  lname: string;
  email: string;
  phone: string;
  dob: string;
  state: string;
  postcode: string;
}

export const STEPS = [
  {
    id: 1,
    title: "Loan Details",
    description: "Amount and type",
    fields: ["loanAmount", "loanType"],
  },
  {
    id: 2,
    title: "Personal Details",
    description: "Contact details",
    fields: [
      "fname",
      "mname",
      "lname",
      "email",
      "phone",
      "dob",
      "state",
      "postcode",
    ],
  },
  {
    id: 3,
    title: "Verification",
    description: "identification",
    fields: ["otp"],
  },
  {
    id: 4,
    title: "Loan Application",
    description: "Provide ID",
    fields: [],
  },
];

export const LOAN_TYPES = [
  { value: "personal", label: "Personal Loan" },
  { value: "business", label: "Business Loan" },
  { value: "education", label: "Education Loan" },
  { value: "auto", label: "Auto Loan" },
  { value: "home", label: "Home Loan" },
  { value: "debt_consolidation", label: "Debt Consolidation Loan" },
  { value: "other", label: "Other" },
];

export const STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];
