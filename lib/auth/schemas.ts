import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

// =====================================================================

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
