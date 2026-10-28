# Kolae Mobile

App mobile do Kolae: encontrar **quadras privadas**, ver se estão livres e falar com o
dono para alugar. Projeto Integrador da Fatec Ferraz de Vasconcelos.
Entrega em **5 de dezembro de 2026**; congelamento de features em **29/11**.

- Rafael: este app (React Native + Expo).
- João: backend PHP (`/api/v1`) e o site (repositório `Slengm4n/Kolae`).
- Depois da entrega o backend vira Laravel, mantendo o mesmo contrato de API.
  O app só troca a URL base.

O app Kotlin antigo (`Thesatiru/Kolae-android`) foi descontinuado; não reaproveitar código dele.

## Modelo do produto (decidido em 28/10)

- **Partidas são agendadas pelo dono da quadra (role `owner`) no site**, para quem alugou
  o horário. O jogador **não cria nem entra em partida pelo app**.
- O app mostra o **status da quadra**, que muda sozinho conforme o horário:
  - `available` (Disponível): aberta e sem partida agora;
  - `in_use` (Em uso): há partida agendada neste horário;
  - `closed` (Fechada): fora do horário de funcionamento ou fechada pelo dono.
- **O status é calculado pela API**, nunca pelo app. O app só exibe.
- O aluguel é combinado direto com o dono: o botão "Falar com o dono" abre o WhatsApp
  dele (a confirmar com o João se o dono tem esse contato cadastrado).
- Detalhe da quadra: informações da quadra (como no Figma) e um botão **Agendar** que
  abre a tela de status + agenda do dia.

### Real x vitrine

Funcionam de verdade, com a API: login, cadastro, esqueci a senha, perfil (editar nome,
data de nascimento e avatar), alterar e-mail e senha, mapa e busca de quadras com
filtros, detalhe da quadra, status e agenda.

**Vitrine** (só visual, com mock, para mostrar o futuro na feira): verificação em duas
etapas, seguidores/feed/vitórias/selo PRO no perfil, chat com a quadra, avaliações,
favoritos (em memória). Nessas telas, nada chama a API.
Dados de vitrine ficam em `src/showcase/` (chat e avaliações, em memória enquanto o app está
aberto) e `src/profile/showcase.ts`. Telas de vitrine mostram um aviso "Prévia" para ninguém
achar que a ação foi de verdade.

## Telas

Design aprovado no canvas "Kolae – Novas telas" (link com o Rafael). Grupos:
mapa de quadras (+ filtros), recuperar senha (+ link enviado), configurações
(principal, idioma em lista, gerais, privacidade e segurança, alterar senha),
aparência (temas), segurança da conta (alterar e-mail, verificar código,
duas etapas, app autenticador), status das quadras (mapa com status, status e
agenda, variações dos selos).

Navegação: abas **Pesquisar, Mapa, Favoritos, Perfil**. Configurações abrem pela
engrenagem do perfil.

## Identidade visual

- Cores da marca: `#0084FF`, `#000000`, `#FFFFFF`. Fonte Kanit em títulos e marca.
- Texto pequeno e links em azul usam `#0069CC` (o `#0084FF` não tem contraste
  suficiente em texto pequeno sobre branco). Botões e títulos grandes usam `#0084FF`.
- Aparência (Configurações › Aparência) = **Cor** + **Modo** (Claro, Escuro ou Automático, que
  segue o celular). Cores: **Kolae** (azul, logo branca sobre azul), **Neutro** (destaque preto,
  logo preta), **Verde**, **Vermelho**, **Rosa**, **Roxo**, **Orgulho** (botões azul escuro, arco-íris
  na logo e em detalhes) e **Alto contraste** (preto/branco puros, bordas grossas, links sublinhados;
  no escuro, amarelo sobre preto). Toda cor tem versão clara e escura em `src/theme/colors.ts`.
  Contraste AA obrigatório: texto branco sobre o botão e link sobre o fundo >= 4,5:1.
- Cores de status (sempre com texto junto, nunca só a cor):
  disponível `#0084FF` (fundo `#E5F2FF`, texto `#0B3A66`),
  em uso `#D96500` (fundo `#FFF1E5`, texto `#6B2F00`),
  fechada contorno `#8A8A8A` (fundo `#F1F2F4`, texto `#4A4A4A`).
- Logo em `src/components/Logo.tsx`: `LogoMark` é o símbolo em SVG (path do Figma, cor por prop) e
  `Logo` é o nome "Kolae" em Kanit.

## Acessibilidade

- Textos em linguagem neutra e simples, nos 7 idiomas ("Boas-vindas", "Responsável pela
  quadra", "pessoas" em vez de "jogadores" quando não for sobre o jogo).
- Blocos com fundo `surface` usam `contrastOutline(c)` e links fora do padrão sublinhado usam
  `linkDecoration(c)`: no Alto contraste o `surface` é igual ao fundo.
- "Fonte para leitura fácil" (Atkinson Hyperlegible) é aplicada pelo `Text` do app; em
  `TextInput` use `useInputFont(tamanho)`.
- Use `Text` de `@/components/Text`, nunca o do `react-native`: ele aplica o "Tamanho do texto"
  (Configurações › Aparência). Em `TextInput`, multiplique o `fontSize` por `useFontScale()`.
  Exceções: `Logo` e `BrandSplash`, que têm tamanho fixo.
- Animações: respeite `usePreferences().motionReduced` (opção do app ou do sistema).
- Leitor de tela: card ou linha com várias informações vira um elemento só (`accessible` +
  `accessibilityLabel` com a frase completa); ícone decorativo fica escondido; títulos com
  `accessibilityRole="header"`; erro com `accessibilityLiveRegion="polite"`; área de toque de
  pelo menos 44–48 px (use `hitSlop`).

## Stack

- Expo SDK 58, React Native, TypeScript (strict), Expo Router (rotas em `src/app/`)
- axios + TanStack Query para dados; `expo-secure-store` para o token
- i18next nos 7 idiomas do site (pt-br, en-us, es-es, it-it, ja-jp, zh-cn, hi-in). Textos do site em
  `src/i18n/locales/site/`, textos do app (prefixo `app_`) em `src/i18n/locales/app/`. Toda chave
  nova vai nos 7 arquivos do app. Os códigos são minúsculos: não remover `lowerCaseLng: true`,
  senão o i18next procura "pt-BR", não acha nada e a tela mostra as chaves.
- Ícones: `@expo/vector-icons` (MaterialCommunityIcons); imagens com `expo-image`
- Mapa (S3): `react-native-maps` + `expo-location`. No APK precisa de chave própria do
  Google Maps (Maps SDK for Android), senão o mapa fica cinza.
- Ambiente do desenvolvedor: Linux, testes no celular pelo Expo Go

Antes de usar qualquer API do Expo, confira a documentação da versão 58
(https://docs.expo.dev/versions/v58.0.0/). Instale libs com `npx expo install`, nunca
com `npm install`, para pegar versões compatíveis com o SDK. Nunca rodar
`npm audit fix --force`.

## Estrutura

```
src/app/_layout.tsx        fontes, splash e providers
src/app/(auth)/            login, cadastro, esqueci a senha (só sem sessão)
src/app/(app)/_layout.tsx  exige sessão; Stack sem header
src/app/(app)/(tabs)/      abas nativas: index (Pesquisar), favorites, profile
src/app/(app)/venue/[id]   detalhe da quadra (abre por cima das abas)
src/favorites/             favoritos em memória (vitrine)
src/api/            uma função por endpoint, cada uma com versão real e mock
src/api/mocks/      dados falsos no formato do contrato
src/api/types.ts    tipos do contrato
src/api/errors.ts   ApiRequestError (status, message, fieldErrors)
src/auth/           AuthProvider, useAuth(), token no secure-store
src/components/     Button, TextField (com ícone), Screen, Checkbox, Stars,
                    VenueCard, QueryState (carregando/erro/vazio), Logo, BrandSplash
src/i18n/           locales/site (convertido do site) e locales/app (chaves app_*)
src/theme/          palette e useColors() (hoje claro/escuro; virar 3 temas)
src/utils/          datas e formatação de preço/nota
```

## Regras do código

- Telas nunca chamam axios direto: sempre uma função de `src/api/`.
- Toda função de `src/api/` tem a versão mock (`if (USE_MOCK) ...`). O mock segue
  exatamente o contrato, incluindo erros 401/422.
- Erros: sempre `toApiError(err)`; mostrar `field()` embaixo do input e `message`
  quando não houver erro por campo.
- Textos visíveis sempre via `t()`. Reaproveitar chaves do site quando existirem;
  chaves novas vão em `src/i18n/locales/app/pt-br.json` e `en-us.json` com prefixo `app_`.
- Cores sempre de `useColors()`, nunca hex solto nas telas.
- Telas com formulário usam `<Screen>` (o teclado não cobre os campos).
- Novas abas entram em `src/app/(app)/(tabs)/_layout.tsx`.
- Listas com dados da API usam `useQuery` + `<QueryState>`.
- Status da quadra: usar sempre o mesmo componente de selo/faixa, nunca recriar.
- Rodar `npx tsc --noEmit` antes de considerar uma tarefa pronta.

## Contrato da API v1

- Sucesso: `{ "data": ... }`. Erro: `{ "message": "...", "errors": { "campo": ["..."] } }`
  com status correto (401, 403, 422).
- Datas em ISO 8601 (`2026-11-10T20:00:00-03:00`); dinheiro em centavos.
- Listas paginadas (`?page=2`); imagens como URL completa.
- Autenticação: `Authorization: Bearer <token>` (o interceptor em `client.ts` injeta).
- Mudança que quebra o app vira `/api/v2`.

### Endpoints

| Método | Rota | Corpo / query | `data` |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| POST | `/auth/register` | `{ name, email, birthdate, password, password_confirmation }` | `{ token, user }` |
| POST | `/auth/forgot-password` | `{ email }` | (vazio; mesma resposta exista ou não o e-mail) |
| GET | `/me` | | `user` |
| PATCH | `/me` | `{ name?, birthdate? }` | `user` |
| POST | `/me/avatar` | multipart `avatar` | `user` |
| PUT | `/me/password` | `{ current_password, password, password_confirmation }` | (vazio) |
| POST | `/me/email` | `{ email, current_password }` | (vazio; envia código ao e-mail novo) |
| POST | `/me/email/confirm` | `{ code }` | `user` |
| GET | `/sports` | | `Sport[]` |
| GET | `/venues` | `?q=&sport_id=&status=available&max_price_cents=&is_covered=&has_lighting=&floor_type=&lat=&lng=&radius_km=&sort=distance\|rating&page=` | lista paginada de `VenueSummary` |
| GET | `/venues/{id}` | `?lat=&lng=` | `VenueDetail` |
| GET | `/venues/{id}/schedule` | `?date=2026-10-28` | `Schedule` |

`user`: `{ id, name, email, birthdate, role, avatar_url, created_at }`,
com `role` sendo `admin` (administrador do Kolae), `owner` (dono de quadra) ou `player`.

Campos novos que o app espera em `VenueSummary` e `VenueDetail`:

```json
{
  "latitude": -23.5428,
  "longitude": -46.3108,
  "status": "in_use",
  "status_until": "2026-10-28T21:00:00-03:00",
  "owner_whatsapp": "5511999999999"
}
```

`status_until` = quando o status atual muda (fim da partida, fechamento ou abertura).

`Schedule`:

```json
{
  "date": "2026-10-28",
  "opens_at": "08:00",
  "closes_at": "22:00",
  "slots": [
    { "start": "2026-10-28T17:00:00-03:00", "end": "2026-10-28T19:00:00-03:00", "status": "available" },
    { "start": "2026-10-28T19:00:00-03:00", "end": "2026-10-28T21:00:00-03:00", "status": "in_use" },
    { "start": "2026-10-28T21:00:00-03:00", "end": "2026-10-28T22:00:00-03:00", "status": "available" }
  ]
}
```

### O que o backend precisa criar ou mudar

1. **Horário de funcionamento** de cada quadra (abre/fecha por dia da semana) e um jeito
   de o dono marcar a quadra como fechada. Hoje não existe no banco.
2. **Tabela `matches`**: corrigir as divergências (`duration_minutes` x `end_time`,
   `canceled` x `cancelled`) e garantir início e fim de cada partida.
3. **Cálculo do status** a partir do horário de funcionamento e das partidas, devolvido
   em `/venues` e `/venues/{id}`, com filtro `status=available`.
4. **Agenda do dia** (`/venues/{id}/schedule`).
5. **Contato do dono** (WhatsApp) para o botão "Falar com o dono".
6. Login e cadastro devolvendo `{ token, user }`; endpoints de `/me` acima.
7. Avaliações e favoritos não existem no banco: no app ficam como vitrine.

### Para a apresentação

O status depende do relógio. Cadastrar nos dados de demonstração partidas que começam
e terminam durante a apresentação, para a banca ver a quadra mudar de "Disponível" para
"Em uso" ao vivo.

## Cronograma do app

| Semana | Entrega |
|---|---|
| S1 · 26/10 a 01/11 | Base Expo, navegação, tema, i18n, login, cadastro e telas com mock ✔ |
| S2 · 02/11 a 08/11 | Login e cadastro na API real; perfil e configurações (editar dados, avatar, senha, e-mail); esqueci a senha; 3 temas; primeiro APK de teste |
| S3 · 09/11 a 15/11 | Aba Mapa com pinos de status e filtros; busca; chave do Google Maps no APK |
| S4 · 16/11 a 22/11 | Detalhe da quadra com botão Agendar; status e agenda do dia; "Falar com o dono" |
| S5 · 23/11 a 29/11 | Telas de vitrine; estados de erro, vazio e sem conexão; polimento |
| S6 · 30/11 a 05/12 | Só correção de bugs, testes em aparelhos reais, APK final, ensaio |

Cadastro e edição de quadras e o agendamento de partidas ficam só no site.
