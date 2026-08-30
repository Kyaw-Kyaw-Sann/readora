import { router, type Href } from 'expo-router';

import { TabPlaceholder } from '@/components/navigation/tab-placeholder';

export default function ProfileTab() {
  return <TabPlaceholder actionLabel="View Premium" onAction={() => router.push('/premium' as Href)} title="Profile" />;
}
