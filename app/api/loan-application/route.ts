import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoanType, Prisma } from "@prisma/client";
import { FormData } from "@/lib/types";

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Helper function to map loan type string to enum
function mapLoanType(loanType: string): LoanType {
  const mapping: Record<string, LoanType> = {
    personal: LoanType.PERSONAL,
    business: LoanType.BUSINESS,
    education: LoanType.EDUCATION,
    auto: LoanType.AUTO,
    home: LoanType.HOME,
    debt_consolidation: LoanType.DEBT_CONSOLIDATION,
    other: LoanType.OTHER,
  };

  return mapping[loanType.toLowerCase()] || LoanType.OTHER;
}

export async function POST(request: NextRequest) {
  try {
    const body: FormData = await request.json();

    const requiredFields = [
      "loanAmount",
      "loanType",
      "fname",
      "lname",
      "email",
      "phone",
      "dob",
      "state",
      "postcode",
    ];
    for (const field of requiredFields) {
      if (!body[field as keyof FormData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const loanAmount = parseFloat(body.loanAmount);
    if (isNaN(loanAmount) || loanAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid loan amount" },
        { status: 400 }
      );
    }

    // Australian postcode validation
    const postcode = parseInt(body.postcode);
    if (isNaN(postcode) || postcode < 200 || postcode > 9999) {
      return NextResponse.json({ error: "Invalid postcode" }, { status: 400 });
    }

    const dob = new Date(body.dob);
    if (isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    // Check age requirement (18+)
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) {
      return NextResponse.json(
        { error: "Must be at least 18 years old" },
        { status: 400 }
      );
    }

    // Get client metadata
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || undefined;
    const referrer = request.headers.get("referer") || undefined;

    // Create lead with metadata in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Check if lead already exists with this email
        const existingLead = await tx.lead.findUnique({
          where: { email: body.email },
        });

        let lead;
        if (existingLead) {
          // Update existing lead
          lead = await tx.lead.update({
            where: { id: existingLead.id },
            data: {
              fname: body.fname,
              mname: body.mname || null,
              lname: body.lname,
              phone: body.phone,
              dob,
              state: body.state,
              postcode,
              loanAmount,
              loanType: mapLoanType(body.loanType),
              status: "SUBMITTED",
            },
          });
        } else {
          // Create new lead
          lead = await tx.lead.create({
            data: {
              fname: body.fname,
              mname: body.mname || null,
              lname: body.lname,
              email: body.email,
              phone: body.phone,
              dob,
              state: body.state,
              postcode,
              loanAmount,
              loanType: mapLoanType(body.loanType),
              status: "SUBMITTED",
              funnelStage: "LEAD",
            },
          });
        }

        // Create metadata record
        await tx.leadMetadata.create({
          data: {
            leadId: lead.id,
            ipAddress,
            userAgent,
            referrerUrl: referrer,
            pagePath: "/loan-application",
          },
        });

        return lead;
      }
    );

    // Generate OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // for production 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create verification record
    await prisma.verification.create({
      data: {
        leadId: result.id,
        type: "EMAIL",
        token: otp,
        expiresAt,
      },
    });

    // Create initial log entry
    await prisma.log.create({
      data: {
        leadId: result.id,
        system: "lead_capture",
        status: "SUCCESS",
        responseCode: 200,
      },
    });

    // Mock Salesforce API integration (replace with real endpoint)
    try {
      const salesforceResponse = await fetch(
        "https://api.salesforce.com/v1/umeloans/leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authorization headers here in production
            // "Authorization": `Bearer ${process.env.SALESFORCE_TOKEN}`
          },
          body: JSON.stringify({
            data: {
              leadId: result.id,
              email: body.email,
              firstName: body.fname,
              lastName: body.lname,
              phone: body.phone,
              loanAmount: loanAmount,
              loanType: body.loanType,
            },
          }),
        }
      );

      // Log the Salesforce sync attempt
      await prisma.log.create({
        data: {
          leadId: result.id,
          system: "salesforce",
          status: salesforceResponse.ok ? "SUCCESS" : "FAILED",
          responseCode: salesforceResponse.status,
          errorMessage: salesforceResponse.ok
            ? null
            : `HTTP ${salesforceResponse.status}`,
        },
      });
    } catch (salesforceError) {
      // Log failed Salesforce sync
      console.error("Salesforce sync failed:", salesforceError);
      await prisma.log.create({
        data: {
          leadId: result.id,
          system: "salesforce",
          status: "FAILED",
          responseCode: 500,
          errorMessage: "Network error or API unavailable",
        },
      });
    }

    // TODO: Send OTP via email/SMS here
    // await sendOTP(body.email, otp); // Implement this function
    console.log(`OTP for ${body.email}: ${otp}`); // For development

    // TODO: Add Salesforce integration here
    // You can create a log entry for the Salesforce sync attempt

    return NextResponse.json({
      success: true,
      leadId: result.id,
      message:
        "Application submitted successfully. Please check your email for verification code.",
      // Don't send OTP in response in production!
      ...(process.env.NODE_ENV === "development" && { otp }), // Only for development
    });
  } catch (error) {
    console.error("Error processing loan application:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Loan application API endpoint" });
}
