import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'Use at most 100 characters.'),
  profileImageUrl: z.string().trim().max(2000, 'Image URL is too long.').refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
    } catch { return false; }
  }, 'Enter a valid HTTP or HTTPS image URL.'),
});

export const passwordSchema = z.object({
  currentPassword: z.string().refine((value) => !!value.trim(), 'Enter your current password.'),
  newPassword: z.string().min(8, 'Use at least 8 characters.').refine((value) => !!value.trim(), 'Enter a new password.'),
  confirmPassword: z.string(),
}).refine((value) => value.newPassword !== value.currentPassword, {
  path: ['newPassword'], message: 'New password must be different.',
}).refine((value) => value.newPassword === value.confirmPassword, {
  path: ['confirmPassword'], message: 'Passwords do not match.',
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
