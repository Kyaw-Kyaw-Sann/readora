import { z } from 'zod';

export const reviewSchema = z.object({
  rating:z.number().int().min(1,'Choose a rating from 1 to 5.').max(5,'Choose a rating from 1 to 5.'),
  comment:z.string().max(2000,'Comment must not exceed 2000 characters.'),
});
export type ReviewFormValues = z.infer<typeof reviewSchema>;
