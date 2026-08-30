import { router, type Href } from 'expo-router';

import { TabPlaceholder } from '@/components/navigation/tab-placeholder';

export default function HomeTab() {
  return <TabPlaceholder actionLabel="Open a book" onAction={() => router.push('/book/1' as Href)} title="Home" />;
}
