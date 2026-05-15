import { z } from "zod";

import { applicationStatuses } from "../../types/application";

export const statusFormSchema = z.object({
  status: z.enum(applicationStatuses, {
    error: "Status is required.",
  }),
  note: z.string().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email("Please enter a valid email address.").or(z.literal("")),
  phone: z.string().optional(),
});

export const communicationFormSchema = z.object({
  type: z.string().trim().min(1, "Type is required."),
  direction: z.enum(["incoming", "outgoing"], {
    error: "Direction is required.",
  }),
  summary: z.string().trim().min(1, "Summary is required."),
  body: z.string().optional(),
  date: z.string().optional(),
});

export type StatusFormValues = z.infer<typeof statusFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type CommunicationFormValues = z.infer<typeof communicationFormSchema>;
