import { z } from "zod";
export const ResumeProfile = z.object({
  isResume: z.boolean(),
  summary: z.string(),
  education: z.array(z.string()),
  skills: z.array(z.string()),
  experience: z.array(z.string()),
});
export type Profile = z.infer<typeof ResumeProfile>;
export const MatchResult = z.object({
  score: z.number().int().min(0).max(100),
  fit: z.enum([
    "Strong match",
    "Possible match",
    "Stretch role",
    "Insufficient information",
  ]),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  nextSteps: z.array(z.string()),
});
export type Match = z.infer<typeof MatchResult>;
