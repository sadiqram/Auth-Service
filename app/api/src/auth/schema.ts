import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1),
});

export const refreshSchema = z.object({ refreshToken: z.string().min(20) })

export const logoutSchema = refreshSchema
export type RegisterSchema = z.infer<typeof registerSchema>;