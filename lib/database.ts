import { prisma } from "./prisma";
import { LoanType, LeadStatus, FunnelStage } from "@prisma/client";

export interface CreateLeadData {
  fname: string;
  mname?: string;
  lname: string;
  email: string;
  phone: string;
  dob: Date;
  state: string;
  postcode: number;
  loanAmount: number;
  loanType: LoanType;
}

export interface LeadMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
  pagePath?: string;
}

export async function createLead(
  data: CreateLeadData,
  metadata?: LeadMetadata
) {
  return await prisma.$transaction(async (tx) => {
    // Check if lead already exists with this email
    const existingLead = await tx.lead.findUnique({
      where: { email: data.email },
    });

    let lead;
    if (existingLead) {
      // Update existing lead
      lead = await tx.lead.update({
        where: { id: existingLead.id },
        data: {
          fname: data.fname,
          mname: data.mname || null,
          lname: data.lname,
          phone: data.phone,
          dob: data.dob,
          state: data.state,
          postcode: data.postcode,
          loanAmount: data.loanAmount,
          loanType: data.loanType,
          status: LeadStatus.SUBMITTED,
        },
      });
    } else {
      // Create new lead
      lead = await tx.lead.create({
        data: {
          fname: data.fname,
          mname: data.mname || null,
          lname: data.lname,
          email: data.email,
          phone: data.phone,
          dob: data.dob,
          state: data.state,
          postcode: data.postcode,
          loanAmount: data.loanAmount,
          loanType: data.loanType,
          status: LeadStatus.SUBMITTED,
          funnelStage: FunnelStage.LEAD,
        },
      });
    }

    // Create metadata record if provided
    if (metadata) {
      await tx.leadMetadata.create({
        data: {
          leadId: lead.id,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          referrerUrl: metadata.referrerUrl,
          pagePath: metadata.pagePath,
        },
      });
    }

    return lead;
  });
}

export async function getLeadById(id: string) {
  return await prisma.lead.findUnique({
    where: { id },
    include: {
      metadata: true,
      logs: true,
      verification: true,
    },
  });
}

export async function getLeadByEmail(email: string) {
  return await prisma.lead.findUnique({
    where: { email },
    include: {
      metadata: true,
      logs: true,
      verification: true,
    },
  });
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  funnelStage?: FunnelStage
) {
  return await prisma.lead.update({
    where: { id },
    data: {
      status,
      ...(funnelStage && { funnelStage }),
    },
  });
}

export async function createLog(
  leadId: string,
  system: string,
  status: "PENDING" | "SUCCESS" | "FAILED",
  responseCode?: number,
  errorMessage?: string
) {
  return await prisma.log.create({
    data: {
      leadId,
      system,
      status,
      responseCode,
      errorMessage,
    },
  });
}

export async function createVerification(
  leadId: string,
  type: "EMAIL" | "PHONE",
  token: string,
  expiresAt: Date
) {
  return await prisma.verification.create({
    data: {
      leadId,
      type,
      token,
      expiresAt,
    },
  });
}

export async function verifyToken(token: string) {
  const verification = await prisma.verification.findUnique({
    where: { token },
    include: { lead: true },
  });

  if (!verification || verification.expiresAt < new Date()) {
    return null;
  }

  // Mark as verified
  await prisma.verification.update({
    where: { id: verification.id },
    data: { verifiedAt: new Date() },
  });

  return verification;
}
