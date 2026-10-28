import * as SecureStore from 'expo-secure-store';

const KEY = 'kolae_token';

// "Lembrar de mim" desmarcado: o token fica só na memória e some ao fechar o app.
let memoryToken: string | null = null;

export async function getToken() {
  return memoryToken ?? (await SecureStore.getItemAsync(KEY));
}

export async function saveToken(token: string, remember: boolean) {
  memoryToken = token;
  if (remember) await SecureStore.setItemAsync(KEY, token);
  else await SecureStore.deleteItemAsync(KEY);
}

export async function clearToken() {
  memoryToken = null;
  await SecureStore.deleteItemAsync(KEY);
}
