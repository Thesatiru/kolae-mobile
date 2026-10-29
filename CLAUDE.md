# Kolae Mobile

App mobile do Kolae: encontrar **quadras privadas**, ver se estão livres e falar com o
dono para alugar. Projeto Integrador da Fatec Ferraz de Vasconcelos.
Entrega em **5 de dezembro de 2026**; congelamento de features em **29/11**.

- Rafael: este app (React Native + Expo), repositório `Thesatiru/kolae-mobile`.
- João: backend PHP (`/api/v1`) e o site, repositório `Slengm4n/Kolae`.
- Depois da entrega o backend vira Laravel com o mesmo contrato. O app só troca a URL base.

O app Kotlin antigo (`Thesatiru/Kolae-android`) foi descontinuado; não reaproveitar código dele.

## Fonte da verdade (repositório do João)

O contrato da API e as decisões **não são copiados aqui**. Antes de mexer em qualquer
coisa que fale com a API, leia:

- Contrato: https://github.com/Slengm4n/Kolae/blob/main/docs/api.md
- Decisões (D01, D02...): https://github.com/Slengm4n/Kolae/blob/main/docs/decisoes.md
- Status, horário de funcionamento e agenda (S3/S4):
  https://github.com/Slengm4n/Kolae/blob/main/docs/modelo-status.md
- Índice e cronograma dos dois: https://github.com/Slengm4n/Kolae/blob/main/docs/README.md
- Rodar o backend local e conectar o app: https://github.com/Slengm4n/Kolae/blob/main/docs/setup.md

Se o app precisar de algo que não está no contrato, **não invente o formato**: anote como
pendência para combinar com o João, e use mock até lá.

## Modelo do produto (D02, D03, D04)

- O dono da quadra (`owner` = quem cadastrou CNPJ no site, D05) agenda as partidas **no
  site**. O jogador não cria nem entra em partida pelo app.
- O app mostra o **status da quadra**, calculado pela API (nunca pelo app):
  `available` (Disponível), `in_use` (Em uso), `closed` (Fechada), com `status_until`
  (quando o status muda). `status_until` pode vir `null` (dono fechou sem data).
- O aluguel é combinado com o dono: "Falar com o dono" abre `https://wa.me/<owner.whatsapp>`.
  Se `owner.whatsapp` vier `null`, o botão não aparece.
- Detalhe da quadra: informações (rework aprovado) e o botão **Agendar**, que abre a tela de
  status + agenda do dia. Quem alugou não aparece no app (privacidade).

### Real x vitrine

**Real (API):** login, cadastro, esqueci a senha, perfil (editar **só o nome** e a foto;
data de nascimento só leitura, D09), alterar senha, mapa e busca de quadras com filtros,
detalhe da quadra, status e agenda.

**Real a partir da S5:** alterar e-mail com código (D11). Até lá a tela usa mock.

**Vitrine** (só visual, aviso "Prévia", nada chama a API): duas etapas,
seguidores/feed/vitórias/PRO no perfil, chat com a quadra, avaliações, favoritos (D04).
Dados em `src/showcase/` e `src/profile/showcase.ts`, em memória.

## Como o app consome a API

- **Base URL:** até a migração de hospedagem, o backend roda no notebook do João (D13):
  `http://<IP do notebook>:8080/kolae/api/v1`, na mesma rede Wi-Fi. A produção
  (InfinityFree) não funciona para o app.
- **Mock por área:** `EXPO_PUBLIC_MOCK_AUTH` e `EXPO_PUBLIC_MOCK_VENUES` (`true` = mock).
  Cada função de `src/api/` escolhe real ou mock pelo interruptor da sua área.
- **Erros:** `ApiRequestError` tem `status`, `code`, `message` e `fieldErrors`.
  Mostrar `field()` embaixo do input; sem erro de campo, `message`.
- **Deslogar só em erro de token** (D10): `AUTH_MISSING_TOKEN`, `AUTH_INVALID_FORMAT`,
  `AUTH_TOKEN_EXPIRED`, `AUTH_INVALID_TOKEN`, `AUTH_INVALID_USER`. `INVALID_CREDENTIALS`
  é só senha errada no login.
- **Token** de 30 dias, sem renovação (D07). "Lembrar de mim" desmarcado = token só na memória.
- **Senha mínima de 8** (D08); **18 anos ou mais** no cadastro, validado também no app.
- **Piso:** a API manda as chaves `synthetic | court | sand | clay | grass | wood`; o app
  traduz com `app_floor_<chave>`.
- **Esportes:** a API manda `icon_path` do Font Awesome (`fa-futbol`); o app converte para
  MaterialCommunityIcons numa tabela, com ícone padrão quando não conhecer.
- **Agenda:** dia sem funcionamento vem com `opens_at`/`closes_at` `null` e `slots` vazio:
  mostrar "Fechada neste dia". Faixas que já passaram aparecem mais apagadas.
- **Fuso:** tudo em horário de Brasília (D16). Mostrar horas com o fuso que vem na data.
- O app envia `Accept-Language`; a API ainda responde em português (melhoria futura).

## Telas

Design aprovado no canvas "Kolae – Novas telas" (link com o Rafael); prints em `design/`,
na raiz do projeto. **Antes de implementar uma tela, abra a imagem dela em `design/`.**

Navegação: abas **Pesquisar, Mapa, Favoritos, Perfil**. Configurações abrem pela
engrenagem do perfil. Fluxo da quadra: card → informações → Agendar → status e agenda.

## Identidade visual

- Cores da marca: `#0084FF`, `#000000`, `#FFFFFF`. Fonte Kanit em títulos e marca.
- Texto pequeno e links em azul usam `#0069CC`; botões e títulos grandes, `#0084FF`.
- Aparência (Configurações › Aparência) = **Cor** + **Modo** (Claro, Escuro ou Automático).
  Cores: **Kolae** (azul, logo branca sobre azul), **Neutro** (destaque preto, logo preta),
  **Verde**, **Vermelho**, **Rosa**, **Roxo**, **Orgulho** (botões azul escuro, arco-íris na
  logo e em detalhes) e **Alto contraste** (preto/branco puros, bordas grossas, links
  sublinhados; no escuro, amarelo sobre preto). Toda cor tem versão clara e escura em
  `src/theme/colors.ts`. Contraste AA obrigatório: texto sobre botão e link sobre fundo >= 4,5:1.
- Cores de status (sempre com texto junto, nunca só a cor):
  disponível `#0084FF` (fundo `#E5F2FF`, texto `#0B3A66`),
  em uso `#D96500` (fundo `#FFF1E5`, texto `#6B2F00`),
  fechada contorno `#8A8A8A` (fundo `#F1F2F4`, texto `#4A4A4A`).
- Logo em `src/components/Logo.tsx`: `LogoMark` é o símbolo em SVG (cor por prop) e
  `Logo` é o nome "Kolae" em Kanit.

## Acessibilidade

- Linguagem neutra e simples nos 7 idiomas ("Boas-vindas", "Responsável pela quadra",
  "pessoas" em vez de "jogadores" quando não for sobre o jogo).
- Blocos com fundo `surface` usam `contrastOutline(c)`; links fora do padrão sublinhado usam
  `linkDecoration(c)` (no Alto contraste o `surface` é igual ao fundo).
- Use `Text` de `@/components/Text`, nunca o do `react-native`: ele aplica o tamanho do texto
  e a "Fonte para leitura fácil" (Atkinson Hyperlegible). Em `TextInput`, use
  `useInputFont(tamanho)` e multiplique o `fontSize` por `useFontScale()`.
  Exceções: `Logo` e `BrandSplash`, de tamanho fixo.
- Animações: respeite `usePreferences().motionReduced`.
- Leitor de tela: card ou linha com várias informações vira um elemento só (`accessible` +
  `accessibilityLabel` com a frase completa); ícone decorativo escondido; títulos com
  `accessibilityRole="header"`; erro com `accessibilityLiveRegion="polite"`; área de toque de
  44–48 px (use `hitSlop`).

## Stack

- Expo SDK 58, React Native, TypeScript (strict), Expo Router (rotas em `src/app/`)
- axios + TanStack Query; `expo-secure-store` para o token
- i18next nos 7 idiomas (pt-br, en-us, es-es, it-it, ja-jp, zh-cn, hi-in). Textos do site em
  `src/i18n/locales/site/`, do app (prefixo `app_`) em `src/i18n/locales/app/`.
  **Toda chave nova vai nos 7 arquivos do app.** Não remover `lowerCaseLng: true`.
- Ícones: `@expo/vector-icons` (MaterialCommunityIcons); imagens com `expo-image`
- Mapa (S3): `react-native-maps` + `expo-location`. No APK precisa de chave própria do
  Google Maps (Maps SDK for Android), senão o mapa fica cinza.
- APK de teste com a API local: liberar tráfego `http://` no build.
- Ambiente do desenvolvedor: Linux, testes no celular pelo Expo Go

Antes de usar qualquer API do Expo, confira a documentação da versão 58
(https://docs.expo.dev/versions/v58.0.0/). Instale libs com `npx expo install`.
Nunca rodar `npm audit fix --force`.

## Estrutura

```
design/                      prints das telas aprovadas (referência, não vai no app)
src/app/_layout.tsx          fontes, splash e providers
src/app/(auth)/              login, cadastro, esqueci a senha (só sem sessão)
src/app/(app)/_layout.tsx    exige sessão; Stack sem header
src/app/(app)/(tabs)/        abas nativas
src/app/(app)/venue/[id]     informações da quadra
src/app/(app)/settings/      configurações: index, general, privacy, appearance, change-password
src/app/(app)/chat/[id]      vitrine
src/app/(app)/reviews/[id]   vitrine
src/api/                     uma função por endpoint, real ou mock; mocks em src/api/mocks/
src/api/types.ts             tipos do contrato (seguir docs/api.md do João)
src/api/errors.ts            ApiRequestError
src/auth/                    AuthProvider, useAuth(), token
src/preferences/             cor, modo, tamanho do texto, fonte de leitura fácil, movimento
src/showcase/, src/profile/  dados de vitrine
src/components/              Text, Button, TextField, Screen, PageHeader, SettingsList,
                             StatusBadge, VenueCard, QueryState, Logo, CurvedHeader...
src/theme/                   cores e useColors()
src/utils/                   datas, formatação, mapas, soon()
tools/convert-lang.mjs       converte os lang/*.php do site para JSON
```

## Regras do código

- Telas nunca chamam axios direto: sempre uma função de `src/api/`.
- Toda função de `src/api/` tem versão mock, e o mock segue **exatamente** o contrato
  (`code`, `errors` como lista, status HTTP).
- Erros sempre por `toApiError(err)`.
- Textos visíveis sempre via `t()`, nos 7 idiomas.
- Cores sempre de `useColors()`, nunca hex solto nas telas.
- Telas com formulário usam `<Screen>`.
- Listas com dados da API usam `useQuery` + `<QueryState>`.
- Status da quadra: sempre o mesmo `StatusBadge` (selo e faixa), nunca recriar.
- Rodar `npx tsc --noEmit` antes de considerar uma tarefa pronta.
- Um commit por etapa concluída.

## Pendências da S2 no app

O backend da S2 já está pronto (adiantado). Falta no app:

1. Separar o mock em `EXPO_PUBLIC_MOCK_AUTH` e `EXPO_PUBLIC_MOCK_VENUES`.
2. `code` em `ApiRequestError` e deslogar só nos erros de token.
3. `token_type` e `expires_at` no login; `per_page` na paginação.
4. Senha mínima de 8 e validação dos 18 anos no cadastro (7 idiomas).
5. Chaves de piso da API e conversão do `icon_path` dos esportes.
6. Editar nome (`PATCH /me`, sem `birthdate`) e trocar foto (`POST /me/avatar`).
7. Alterar senha ligada à API (`PUT /me/password`).
8. Testar tudo com o backend do João; depois, primeiro APK de teste.

## Cronograma do app

| Semana | Entrega |
|---|---|
| S1 · 26/10–01/11 | Base, navegação, temas, i18n, acessibilidade, telas com mock ✔ |
| S2 · 02/11–08/11 | Login, cadastro, perfil e senha na API real; primeiro APK |
| S3 · 09/11–15/11 | Aba Mapa com status, filtros e busca; chave do Google Maps |
| S4 · 16/11–22/11 | Informações da quadra, Agendar, status e agenda; "Falar com o dono" |
| S5 · 23/11–29/11 | Troca de e-mail real; vitrines; erro, vazio e sem conexão; polimento |
| S6 · 30/11–05/12 | Só correções, testes em aparelhos reais, APK final, ensaio |

Cadastro e edição de quadras e o agendamento de partidas ficam só no site.
