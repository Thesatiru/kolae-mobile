import * as SecureStore from 'expo-secure-store';

// Guarda por pessoa (id do usuário): num celular compartilhado, cada conta vê o tutorial
// no seu primeiro login. Fica no aparelho; reinstalar o app mostra de novo.
const key = (userId: number) => `kolae_tour_done_${userId}`;

export async function hasSeenTour(userId: number) {
  try {
    return (await SecureStore.getItemAsync(key(userId))) === '1';
  } catch {
    return true; // sem acesso ao armazenamento: não insiste em mostrar
  }
}

export async function markTourSeen(userId: number) {
  await SecureStore.setItemAsync(key(userId), '1').catch(() => {});
}
