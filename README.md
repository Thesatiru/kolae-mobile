# Kolae Mobile

App do Kolae em React Native (Expo SDK 58 + TypeScript + Expo Router).

## Rodando

```bash
npm install
npx expo start
```

Abra no celular com o Expo Go (mesma rede Wi-Fi do computador).

## Mock x API real

O arquivo `.env` controla de onde vêm os dados:

- `EXPO_PUBLIC_MOCK_AUTH`: login, cadastro, esqueci a senha, perfil e senha.
- `EXPO_PUBLIC_MOCK_VENUES`: esportes e quadras.

Em cada área, `true` usa dados falsos no formato do contrato (login de teste: `teste@kolae.com` /
`12345678`) e `false` usa `EXPO_PUBLIC_API_URL`. Em dev, use o IP da máquina que roda o PHP
(não `localhost`, que no celular é o próprio celular).

Depois de mudar o `.env`, reinicie com `npx expo start -c`.

## Estrutura

```
src/
  app/              rotas (cada arquivo é uma tela)
    (auth)/         login e cadastro, só para quem não está logado
    (app)/          área logada, com as abas
  api/              uma função por endpoint + mocks + tipos do contrato
  auth/             sessão (token no secure-store) e useAuth()
  components/       Button, TextField, Screen
  i18n/             traduções (site convertido + chaves app_*)
  theme/            cores claro/escuro, iguais às do site
  utils/            máscara e conversão de datas
tools/convert-lang.mjs   converte lang/*.php do site para JSON
```

## Traduções do site

```bash
node tools/convert-lang.mjs ../Kolae/lang
```

Chaves novas do app ficam em `src/i18n/locales/app/` com prefixo `app_`.

## Endpoints usados (S1/S2)

| Método | Rota | Corpo | Resposta (`data`) |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| POST | `/auth/register` | `{ name, email, birthdate, password, password_confirmation }` | `{ token, user }` |
| GET | `/me` | (Bearer) | `user` |

`user`: `{ id, name, email, birthdate, role, avatar_url, created_at }`. Erros: `{ message, errors }` com 401/422.
