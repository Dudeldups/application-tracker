import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "interesting",
  "preparing",
  "applied",
  "confirmation_received",
  "interview",
  "technical_task",
  "offer",
  "rejected",
  "withdrawn",
  "no_response",
]);

export const remoteTypeSchema = z.enum([
  "remote",
  "hybrid",
  "onsite",
  "unknown",
]);

const optionalDateStringSchema = z
  .string()
  .trim()
  .min(1)
  .refine(value => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date",
  })
  .optional();

const optionalUrlSchema = z.string().trim().url().optional().or(z.literal(""));

const ratingSchema = z.number().int().min(1).max(5).optional();

export const createApplicationSchema = z.object({
  companyName: z.string().trim().min(1, "companyName is required"),
  jobTitle: z.string().trim().min(1, "jobTitle is required"),

  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  remoteType: remoteTypeSchema.optional(),

  source: z.string().trim().optional(),
  jobUrl: optionalUrlSchema,

  status: applicationStatusSchema.optional(),

  foundAt: optionalDateStringSchema,
  appliedAt: optionalDateStringSchema,
  lastContactAt: optionalDateStringSchema,
  followUpAt: optionalDateStringSchema,

  jobAdText: z.string().optional(),

  cvVersion: z.string().trim().optional(),
  coverLetterVersion: z.string().trim().optional(),
  usedCoverLetter: z.boolean().optional(),

  customizationNotes: z.string().optional(),
  notes: z.string().optional(),

  interestRating: ratingSchema,
  skillFitRating: ratingSchema,
  priorityRating: ratingSchema,
});

export type ApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = createApplicationSchema.partial();

export const updateStatusSchema = z.object({
  status: applicationStatusSchema,
  note: z.string().optional(),
});

export const createCommunicationSchema = z.object({
  type: z.string().trim().min(1, "type is required"),
  direction: z.string().trim().min(1, "direction is required"),
  summary: z.string().trim().min(1, "summary is required"),
  body: z.string().optional(),
  date: optionalDateStringSchema,
});

export const createContactSchema = z.object({
  name: z.string().trim().optional(),
  role: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
});
