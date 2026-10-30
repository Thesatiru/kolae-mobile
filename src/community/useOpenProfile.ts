import { router } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { handleFor } from '@/showcase/community';

/** Abre o perfil pelo @: o próprio vai para /profile, o de outra pessoa para /user/[handle]. */
export function useOpenProfile() {
  const { user } = useAuth();
  const mine = user ? handleFor(user.name) : null;
  return (handle: string) => {
    if (handle === mine) router.push('/profile');
    else router.push({ pathname: '/user/[handle]', params: { handle } });
  };
}
