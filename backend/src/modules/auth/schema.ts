import { z } from 'zod';

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  first_name: z.string().min(1).optional(),
  phone: z.string().min(5).optional(),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const refreshRequestSchema = z.object({
  refresh_token: z.string().min(1),
});

export const logoutRequestSchema = z.object({
  refresh_token: z.string().min(1),
});
