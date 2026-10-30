import { useLocalSearchParams } from 'expo-router';

import { ProfileView } from '@/profile/ProfileView';
import { findAuthor } from '@/showcase/community';

// Perfil de outra pessoa (vitrine): abre tocando na foto dela num post ou comentário.
export default function UserScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const author = findAuthor(handle) ?? { name: handle, handle, tone: 'primary' as const };
  return <ProfileView author={author} />;
}
