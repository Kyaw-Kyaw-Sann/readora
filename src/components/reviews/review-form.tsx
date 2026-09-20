import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { reviewSchema, type ReviewFormValues } from '@/schemas/review.schema';
import type { Review, ReviewRequest } from '@/types/review.types';

interface Props {review?:Review;pending:boolean;error?:string;onSubmit:(request:ReviewRequest)=>void;onCancel:()=>void}

export function ReviewForm({review,pending,error,onSubmit,onCancel}: Props) {
  const {control,handleSubmit} = useForm<ReviewFormValues>({resolver:zodResolver(reviewSchema),defaultValues:{rating:review?.rating ?? 0,comment:review?.comment ?? ''}});
  return <View className="mt-3 gap-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
    <Text className="font-serif text-xl text-text dark:text-text-dark">{review ? 'Edit your review' : 'Write a review'}</Text>
    <Controller control={control} name="rating" render={({field:{value,onChange},fieldState:{error:fieldError}})=><View>
      <Text className="text-sm text-text dark:text-text-dark">Your rating</Text>
      <View className="mt-2 flex-row justify-between gap-1">{[1,2,3,4,5].map(rating=><Pressable key={rating} disabled={pending} accessibilityRole="radio" accessibilityState={{checked:value===rating,disabled:pending}} accessibilityLabel={`${rating} ${rating===1 ? 'star' : 'stars'}`} onPress={()=>onChange(rating)} className={`min-h-12 min-w-10 flex-1 items-center justify-center rounded-xl border ${rating<=value ? 'border-primary bg-primary-soft dark:bg-border-dark' : 'border-border dark:border-border-dark'}`}><Text className="text-lg text-primary">★</Text><Text className="text-xs text-text dark:text-text-dark">{rating}</Text></Pressable>)}</View>
      {fieldError ? <Text className="mt-2 text-sm text-danger">{fieldError.message}</Text> : null}
    </View>} />
    <Controller control={control} name="comment" render={({field:{value,onChange,onBlur},fieldState:{error:fieldError}})=><View>
      <AppTextInput label="Comment (optional)" placeholder="Share what you think about this book…" multiline numberOfLines={4} textAlignVertical="top" maxLength={2000} editable={!pending} value={value} onChangeText={onChange} onBlur={onBlur} error={fieldError?.message} />
      <Text className="mt-1 text-right text-xs text-text-muted dark:text-text-muted-dark">{value.length}/2000</Text>
    </View>} />
    {error ? <Text accessibilityLiveRegion="polite" className="text-sm text-danger">{error}</Text> : null}
    <AppButton label={review ? 'Save changes' : 'Submit review'} loading={pending} onPress={handleSubmit(values=>onSubmit({rating:values.rating,comment:values.comment.trim() || undefined}))} />
    <AppButton label="Cancel" variant="ghost" disabled={pending} onPress={onCancel} />
  </View>;
}
