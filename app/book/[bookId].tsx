import { router, type Href } from 'expo-router';

import { RoutePlaceholder } from '@/components/navigation/route-placeholder';

export default function BookDetailScreen() {
  return <RoutePlaceholder actionLabel="Open reader" onAction={() => router.push('/reader/1' as Href)} subtitle="Book metadata, reviews, favorite status, and access controls will appear here." title="Book Detail" />;
}
