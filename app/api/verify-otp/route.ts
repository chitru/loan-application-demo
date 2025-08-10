import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface VerifyOTPRequest {
  leadId: string;
  otp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();

    if (!body.leadId || !body.otp) {
      return NextResponse.json(
        { error: "Lead ID and OTP are required" },
        { status: 400 }
      );
    }

    const verification = await prisma.verification.findFirst({
      where: {
        leadId: body.leadId,
        token: body.otp,
        verifiedAt: null, // Not yet verified
      },
      include: {
        lead: true,
      },
    });

    if (!verification) {
      await prisma.log.create({
        data: {
          leadId: body.leadId,
          system: "otp_verification",
          status: "FAILED",
          responseCode: 400,
          errorMessage: "Invalid OTP",
        },
      });

      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      await prisma.log.create({
        data: {
          leadId: body.leadId,
          system: "otp_verification",
          status: "FAILED",
          responseCode: 400,
          errorMessage: "OTP expired",
        },
      });

      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified and update lead status
    await prisma.$transaction(async (tx) => {
      // Mark verification as completed
      await tx.verification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      });

      // Update lead status
      await tx.lead.update({
        where: { id: body.leadId },
        data: {
          status: "VERIFIED",
          funnelStage: "APPLICANT",
        },
      });

      await tx.log.create({
        data: {
          leadId: body.leadId,
          system: "otp_verification",
          status: "SUCCESS",
          responseCode: 200,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message:
        "Verification successful! You can now continue with your application.",
      lead: {
        id: verification.lead.id,
        name: `${verification.lead.fname} ${verification.lead.lname}`,
        email: verification.lead.email,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Resend OTP endpoint
export async function PUT(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate old OTP and create new one
    await prisma.$transaction(async (tx) => {
      await tx.verification.updateMany({
        where: {
          leadId,
          verifiedAt: null,
        },
        data: {
          expiresAt: new Date(), // Expire immediately
        },
      });

      // Create new verification
      await tx.verification.create({
        data: {
          leadId,
          type: "EMAIL",
          token: otp,
          expiresAt,
        },
      });

      // Log resend attempt
      await tx.log.create({
        data: {
          leadId,
          system: "otp_resend",
          status: "SUCCESS",
          responseCode: 200,
        },
      });
    });

    // For development, need to implement email sending for production
    console.log(`New OTP for ${lead.email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "New verification code sent!",
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    console.error("Error resending OTP:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
