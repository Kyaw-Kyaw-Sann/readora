import { z } from 'zod';

export const emailSchema = z.object({
  email: z.email('Enter a valid email address.'),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the six-digit code.'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(1, 'New password is required.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export type EmailFormValues = z.infer<typeof emailSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
