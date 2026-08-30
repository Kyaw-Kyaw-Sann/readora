import { router, type Href } from 'expo-router';

import { RoutePlaceholder } from '@/components/navigation/route-placeholder';

export default function InterestsScreen() {
  return <RoutePlaceholder actionLabel="Save interests" onAction={() => router.replace('/home' as Href)} subtitle="Choose the topics you enjoy. They will shape your recommendations." title="What do you like to read?" />;
}
