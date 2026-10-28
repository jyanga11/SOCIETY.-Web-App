import { z } from "zod";

export const inquirySchema = z.object({
  "user-name": z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(150, "Name cannot exceed 150 characters."),

  "user-email": z
    .string()
    .trim()
    .email()
    .max(254),

  note: z
    .string()
    .trim()
    .min(3, "Please describe your project in more detail.")
    .max(5000, "Description cannot exceed 5,000 characters."),

  service_type: z
    .string()
    .trim()
    .min(1, "Service type is required.")
    .max(100),

  newsletter_opt_in: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;