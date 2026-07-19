import { z } from "zod";

export const signalTypes = [
  "recruiter_interest",
  "referral",
  "project_opportunity",
  "endorsement",
  "portfolio_feedback",
] as const;

export const signalSchema = z.object({
  type: z.enum(signalTypes),
  name: z.string().min(2).max(100),
  email: z.string().email().max(160),
  organization: z
    .string()
    .max(160)
    .optional()
    .transform((value) => value || undefined),
  message: z.string().min(10).max(4000),
  contextUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export type VisitorSignalInput = z.infer<typeof signalSchema>;

export interface JobMatchBreakdown {
  requiredSkills: number;
  preferredSkills: number;
  experience: number;
  architecture: number;
  delivery: number;
  domain: number;
  leadership: number;
  overall: number;
}
