import { z } from "zod";
const password = z.string().min(8).max(128).regex(/[A-Z]/, "Password needs an uppercase letter").regex(/[a-z]/, "Password needs a lowercase letter").regex(/[0-9]/, "Password needs a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password,
  marketingOptIn: z.boolean().optional().default(false)
});
export const loginSchema = z.object({ email: z.string().email().transform((v) => v.toLowerCase().trim()), password: z.string().min(1) });
export const requestPasswordResetSchema = z.object({ email: z.string().email().transform((v) => v.toLowerCase().trim()) });
export const resetPasswordSchema = z.object({ token: z.string().min(20), password });
export const verifyEmailSchema = z.object({ token: z.string().min(20) });
