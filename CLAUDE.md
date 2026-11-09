# Kolae Mobile

App mobile do Kolae: encontrar **quadras privadas**, ver se estão livres e falar com o
dono para alugar. Projeto Integrador da Fatec Ferraz de Vasconcelos.
Entrega em **28 de novembro de 2026**; congelamento de funcionalidades em **21/11** (D28).

- Rafael: este app (React Native + Expo), repositório `Thesatiru/kolae-mobile`.
- João: backend PHP (`/api/v1`) e o site, repositório `Slengm4n/Kolae`.
- Depois da entrega o backend vira Laravel com o mesmo contrato. O app só troca a URL base.

O app Kotlin antigo (`Thesatiru/Kolae-android`) foi descontinuado; não reaproveitar código dele.

## Fonte da verdade (repositório do João)

O contrato da API e as decisões **não são copiados aqui**. Antes de mexer em qualquer
coisa que fale com a API, leia:

- Contrato: https://github.com/Slengm4n/Kolae/blob/main/docs/api.md
- Decisões (D01, D02...): https://github.com/Slengm4n/Kolae/blob/main/docs/decisoes.md
- Status, horário de funcionamento e agenda:
  https://github.com/Slengm4n/Kolae/blob/main/docs/modelo-status.md
- Índice e cronograma dos dois: https://github.com/Slengm4n/Kolae/blob/main/docs/README.md
- Rodar o backend local: https://github.com/Slengm4n/Kolae/blob/main/docs/setup.md

Se o app precisar de algo que não está no contrato, **não invente o formato**: anote como
pendência para combinar com o João, e use mock até lá.

## Modelo do produto (D02, D03, D04)

- O dono da quadra (`owner` = quem cadastrou CNPJ no site, D05) agenda as partidas **no
  site**. O jogador não cria nem entra em partida pelo app.
- O app mostra o **status da quadra**, calculado pela API (nunca pelo app):
  `available` (Disponível), `in_use` (Em uso), `closed` (Fechada), com `status_until`
  (quando o status muda). `status_until` pode vir `null` (dono fechou sem data).
- O aluguel é combinado com o dono: "Falar com o dono" abre `https://wa.me/<owner.whatsapp>`.
  Se `owner.whatsapp` vier `null`, o botão não aparece (D24).
- Detalhe da quadra: informações (rework aprovado) e o botão **Agendar**, que abre a tela de
  status + agenda do dia. Quem alugou não aparece no app (privacidade).

### Real x vitrine

**Real (API):** login, cadastro, esqueci a senha, perfil (editar **só o nome** e a foto;
data de nascimento só leitura, D09), alterar senha, mapa e busca de quadras com filtros,
detalhe da quadra, status e agenda.

**Vitrine** (só visual, aviso "Prévia", nada chama a API): alterar e-mail com código (fora do
escopo da entrega, D28), duas etapas, seguidores/feed/vitórias/PRO no perfil, avaliações,
favoritos (D04) e a **Comunidade** (rede social do esporte: feed Para
você/Amigos, novo post e comentários; posts aceitam texto e foto, nunca links; respostas só
texto). No perfil, capa, seguidores, vitórias, posts e fotos também são vitrine e saem da
Comunidade (sem posts, o perfil fica vazio). Dados em `src/showcase/` (a Comunidade em
`src/showcase/community.ts`), em memória. Exceção: os favoritos ficam salvos no aparelho, por
usuário (AsyncStorage, `src/favorites/`), e também não vão para a API.

**Chat com a quadra: deixou de ser vitrine** (proposta D62, ver "Chat" abaixo). O app está
pronto e roda com mock; falta a API do João.

## Como o app consome a API

- **Base URL: a produção, `https://kolae.online/api/v1`** (HostGator, D41), inclusive pelo
  4G e na apresentação. O backend local (`http://localhost/kolae/api/v1` no PC do Rafael, ou
  `http://<IP do notebook>:8080/kolae/api/v1` no do João) serve **só para testar uma mudança
  antes do deploy**. A `main` do João publica direto na produção.
- **Mock por área:** `EXPO_PUBLIC_MOCK_AUTH`, `EXPO_PUBLIC_MOCK_VENUES` e `EXPO_PUBLIC_MOCK_CHAT`
  (`true` = mock). Cada função de `src/api/` escolhe real ou mock pelo interruptor da sua área.
  Com a produção no ar, o normal é AUTH e VENUES em `false`; o CHAT fica `true` até a API do
  chat subir (no `.env` e no perfil `preview` do `eas.json`).
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
- **Preço:** `0` = "Grátis", `null` = "Preço não informado" (D31).
- **Fotos:** `cover_image_url`, `images` e `avatar_url` podem vir `null` (ou fora da lista)
  quando o arquivo não existe no servidor: mostrar a imagem padrão.
- **Descrição:** `description` `null` esconde a seção "Sobre a quadra" (D30).
- **Redes da quadra** (D60): `socials` vem sempre no detalhe (nunca na lista), com `null` no que
  o dono não informou; as quatro `null` escondem a linha. Instagram e TikTok vêm só com o
  usuário: o app monta o link. Facebook e site abrem como vieram.
- **Distância no detalhe:** calculada no app com a posição da pessoa e as coordenadas (D33).
- **Agenda:** dia sem funcionamento vem com `opens_at`/`closes_at` `null` e `slots` vazio:
  mostrar "Fechada neste dia". `opening_hours` vazio no detalhe = "Horário não informado"
  (D23). Faixas que já passaram aparecem mais apagadas.
- **Fuso:** tudo em horário de Brasília (D16). Mostrar horas com o fuso que vem na data.
- O app envia `Accept-Language`; a API ainda responde em português (melhoria futura).
- **Segundo plano:** o `focusManager` do TanStack segue o `AppState` (`src/network/online.ts`):
  todo `refetchInterval` (status da quadra, polling do chat) para com o app fora da tela.

## Chat (proposta D62, em andamento)

Contrato: `docs/proposta-chat.md` do João (vira a D62 e entra no `api.md` quando os dois
aprovarem). **Data de corte: 18/11.** Se até lá não funcionar de ponta a ponta, o chat volta a
ser vitrine só com `EXPO_PUBLIC_MOCK_CHAT=true`: o aviso "Prévia" já aparece sozinho com o
mock ligado.

- Pessoa ↔ responsável pela quadra, **só texto, sem links**, até 1000 caracteres. O responsável
  responde pelo painel do site. O WhatsApp (D24) continua no cabeçalho do chat e no detalhe.
- **Polling**, sem WebSocket (HostGator): conversa aberta a cada 5 s (`after_id`), lista a cada
  30 s, o Menu ao voltar para ele. Intervalos em `src/chat/useChatThread.ts`.
- Rotas: `chat/[id]` recebe o id da **quadra** e abre (ou reaproveita) a conversa com
  `POST /venues/{id}/conversations`. `messages` é a lista (Menu › Mensagens, com as não lidas).
- `src/api/chat.ts`: uma função por rota da proposta. `src/api/mocks/chat.mock.ts` faz o papel
  da API (mesmos códigos) e o responsável responde sozinho em 3 s. Comandos de teste no texto:
  `#bloquear` (bloqueia a conversa) e `#falhar` (a 1ª tentativa dá 500).
- `src/chat/useChatThread.ts`: mensagens numa query só (1ª busca = as mais recentes; depois só
  `after_id`), mais antigas ao rolar para cima (`before_id`), envio otimista com "enviando" e
  "não enviada" (tocar: tentar de novo ou apagar), marca como lida e anuncia no leitor de tela
  o que chega. Erros: 422 devolve o texto para o campo com `errors.body`; 403 `CHAT_BLOCKED`
  fecha o campo ("não recebe mais mensagens"); 404 no envio = quadra desativada, só leitura;
  422 `CHAT_OWN_VENUE` ao abrir mostra "Esta quadra é sua".
- Balão da pessoa: `primaryForText(c)` (no tema Kolae, branco sobre `#0069CC`, 5,6:1).

**Para ligar na API:** o João sobe as rotas (com o painel, D62) → conferir as dúvidas abaixo →
`EXPO_PUBLIC_MOCK_CHAT=false` no `.env` e no `eas.json` → testar app ↔ painel pelo 4G.
Se o contrato mudar, só `src/api/types.ts`, `src/api/chat.ts` e o mock mudam; as telas não.

**Dúvidas do contrato (combinar com o João, o app assumiu o que está entre parênteses):**
1. `last_message` de uma conversa sem mensagens (`null`).
2. `GET /conversations/{id}/messages` sem `after_id`/`before_id` (as `per_page` mais recentes,
   em ordem crescente de id).
3. Códigos dos 404: conversa que não é sua e envio com a quadra desativada (o app olha só o
   status 404).
4. Abrir a tela já cria a conversa (como na proposta), então podem surgir conversas vazias:
   o painel e o `GET /conversations` deveriam esconder as que não têm mensagem.
5. `Retry-After` do 429: o app mostra só a mensagem (o `ApiRequestError` não lê cabeçalhos).

## Telas

Design aprovado no canvas "Kolae – Novas telas" (link com o Rafael); prints em `design/`,
na raiz do projeto. **Antes de implementar uma tela, abra a imagem dela em `design/`.**

Navegação (decidida em 29/10): abas **Pesquisar, Mapa, Comunidade e Menu (☰)**. Perfil,
Favoritos, Configurações, Central de ajuda e o tutorial abrem pelo Menu (cada um com uma
descrição curta), como nos apps que guardam curtidas e salvos fora da barra. Comunidade = rede
social do esporte (vitrine). Fluxo da quadra: card → informações → Agendar →
status e agenda.

Telas de entrada (login, cadastro, esqueci a senha) refeitas em 05/11 e aprovadas pelo João
no celular (sem print em `design/`): todas usam o `AuthScaffold` (topo da marca com linhas de
quadra que se desenham, cartão do formulário que sobe). O login mostra a proposta logo de cara
com o `LiveTicker` (quadras de exemplo com `StatusBadge`). Cadastro em duas etapas; a data de
nascimento é a roleta (`DateField`), sem digitar.

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
  em uso **vermelho** `#D32F2F` (fundo `#FDECEA`, texto `#7F1D1D`; trocado do laranja em 29/10),
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
- Animações: respeite `usePreferences().motionReduced` (sem animar e sem conteúdo que troca
  sozinho). Entradas em cascata com `Appear`/`useAppear()`, que já fazem isso.
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
- Animações com `react-native-reanimated` (e `Animated` do RN na roleta); vibração com
  `expo-haptics` (`selectionAsync` para "catraca", sem exagero)
- Mapa: `react-native-maps` + `expo-location`. No APK precisa de **chave própria do Google
  Maps para Android** (Maps SDK for Android, restrita ao pacote do app e à assinatura do
  build), senão o mapa fica cinza. A chave do site (`kolae.online`) é outra.
- APK: a produção é `https://`, então **não precisa liberar tráfego HTTP**. Só seria preciso
  para um APK apontando para o backend local.
- Build: EAS (perfil `preview` para APK de teste). Passo a passo (chave do Maps, build,
  roteiro de teste pelo 4G e problemas comuns) em `docs/apk.md`.
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
src/app/(app)/(tabs)/        abas nativas: index (Pesquisar), map, community, menu
src/app/(app)/profile/       perfil (index) e editar perfil (edit); abre pelo Menu
src/app/(app)/user/[handle]  perfil de outra pessoa (vitrine), pela foto num post
src/app/(app)/favorites, tour   abrem pelo Menu, por cima das abas
src/app/(app)/venue/[id]     informações da quadra
src/app/(app)/settings/      configurações: index, general, privacy, appearance,
                             change-password, help
src/app/(app)/post/          vitrine da Comunidade: [id] e new
src/app/(app)/chat/[id]      chat com a quadra (id da quadra); proposta D62
src/app/(app)/messages       lista de conversas (Menu › Mensagens)
src/app/(app)/reviews/[id]   vitrine
src/api/                     uma função por endpoint, real ou mock; mocks em src/api/mocks/
src/api/types.ts             tipos do contrato (seguir docs/api.md do João)
src/api/errors.ts            ApiRequestError
src/auth/                    AuthProvider, useAuth(), token
src/preferences/             cor, modo, tamanho do texto, fonte de leitura fácil, movimento
src/showcase/                dados de vitrine
src/profile/                 ProfileView (próprio perfil e de outra pessoa), trocar a foto
src/components/              Text, Button, TextField, Screen, PageHeader, SettingsList,
                             StatusBadge, VenueCard, QueryState, Logo, CurvedHeader...
                             Entrada: AuthScaffold, CourtLines, LiveTicker. Formulário:
                             DateField (roleta) e WheelPicker. Animação: Appear.
                             Carregando: Skeleton (e os de card, fileira e grade)
src/chat/                    useChatThread (polling, envio, lida) e balões do chat
src/network/                 internet (onlineManager), segundo plano (focusManager), faixa offline
src/search/                  buscas recentes (no aparelho, por pessoa, como os favoritos)
src/theme/                   cores e useColors()
src/map/                     pinos, filtros e card da aba Mapa; VenueMiniMap (detalhe)
src/utils/                   datas, formatação, mapas, links (hasLink), soon(); site.ts (links do site, como a
                             página pública da quadra); haptics.tick() é o ponto
                             único da vibração (nunca chamar expo-haptics direto nas telas)
tools/convert-lang.mjs       converte os lang/*.php do site para JSON
changelog/                   uma nota por branch (base do changelog); ver changelog/README.md
```

## Regras do código

- Telas nunca chamam axios direto: sempre uma função de `src/api/`.
- Toda função de `src/api/` tem versão mock, e o mock segue **exatamente** o contrato
  (`code`, `errors` como lista, status HTTP).
- Erros sempre por `toApiError(err)`. Tela sem dados por erro: `<ErrorState>` (ou o `<QueryState>`,
  que já usa), com o K, "Algo deu errado..." e o caminho do suporte (`utils/support.ts`).
  Mensagem em formulário ou alerta: `errorMessage(err)` (sem internet e erro 500 já traduzidos).
- Textos visíveis sempre via `t()`, nos 7 idiomas.
- Cores sempre de `useColors()`, nunca hex solto nas telas.
- Telas com formulário usam `<Screen>`.
- Listas com dados da API usam `useQuery` + `<QueryState>`.
- Status da quadra: sempre o mesmo `StatusBadge` (selo e faixa), nunca recriar.
- Rodar `npx tsc --noEmit` antes de considerar uma tarefa pronta.
- Um commit por etapa concluída.
- Uma branch por assunto (`feat/...`, `fix/...`), saindo da `main`. Cada branch anota o que
  mudou para quem usa em `changelog/<nome-da-branch>.md` (sem `feat/`), atualizado a cada commit.
- Windows (máquina do João): rodar o Expo no PowerShell, não no WSL, com
  `npx.cmd expo start --offline` (sem login no Expo CLI a pergunta de conta trava o Expo Go).

## Pendências

Em ordem de prioridade. Apague o item quando terminar.

1. **Primeiro APK de teste** (EAS, perfil `preview`) com a chave do Google Maps para Android;
   testar pelo 4G. A v1 sai **só como APK** (decidido em 05/11): sem Play Store nem App Store.
   **Em andamento (05/11):** o João está mexendo no build. Antes, o projeto era da conta Expo
   `satiru` e o João entrava como `slengm4n`, sem acesso. Anotar aqui qual conta compila e o
   SHA-1 da keystore: a chave do Maps e o login com Google dependem dele.
2. **Testar as redes da quadra de ponta a ponta:** a D60 está na produção desde 05/11, mas
   nenhuma quadra real tinha rede cadastrada. Cadastrar numa quadra pelo painel do site e abrir
   no app com o mock desligado.
3. **Entrar com Google** (decidido tentar em 05/11; **corte em 12/11**). Proposta, contrato,
   datas e plano B em `docs/proposta-login-google.md` do João. Não roda no Expo Go: precisa do
   build do EAS. Se não sair até o corte, o botão some (`EXPO_PUBLIC_GOOGLE_LOGIN=false`).
4. **Chat com o responsável pela quadra** (decidido tentar em 05/11; **corte em 18/11**). A pessoa
   escreve pelo app (`chat/[id]` deixa de ser vitrine), o responsável responde pelo painel do
   site, por consulta periódica. Proposta em `docs/proposta-chat.md` do João. Se não sair até o
   corte, volta a ser vitrine com "Prévia".
   **App pronto com mock** (branch `feat/chat`, 09/11; ver a seção "Chat"): falta a API e o
   painel do João, as 5 dúvidas do contrato e o teste ponta a ponta pelo 4G.
   Nas duas propostas, cada passo (inclusive o que der errado) vai no "Registro do andamento".
5. Revisar as vitrines com o aviso "Prévia" (S5): faltam o perfil de outra pessoa
   (`user/[handle]`), seguidores, vitórias e PRO no perfil, duas etapas e alterar e-mail.
6. Estados de erro e vazio tela por tela (S5).
7. **Perfil, polimento** (ideias de 05/11, sem contrato novo): "No Kolae desde" (`created_at`),
   selo de responsável para `owner`, favoritos e vistas recentemente no perfil, vazio com "Criar
   post", puxar para atualizar o `/me`, foto pela câmera, aviso de alterações não salvas no editar
   perfil. Para `owner`, um atalho "Gerenciar minhas quadras" no Menu abrindo o painel do site
   (gerenciar quadras pelo app fica fora: a API é só leitura, D02).
8. **@usuário (nickname)** (ideia de 05/11, sem decisão): nome real + `@usuario` único, que hoje
   o app inventa a partir do nome (`handleFor`). Pede coluna `username`, regras e `PATCH /me` no
   site. Só se sobrar tempo; senão, proposta para depois da entrega.
9. **Redes nos perfis das pessoas** (ideia de 05/11, sem decisão): como vitrine agora; de verdade
   só junto da Comunidade real, depois da entrega.

Depois da entrega (Laravel): comunidade de verdade, chat em tempo real, favoritos na conta e as
partidas com jogadores. Proposta em `docs/proposta-partidas.md` e lista em `docs/sugestoes.md`,
no repositório do João. Também ficam para depois: entrar com Apple (só se houver versão para
iPhone) e abrir o app pelo link da quadra (App Links: `assetlinks.json` no site e
`intentFilters`).

## Cronograma (igual ao docs/README.md do João)

| Sprint | App (Rafael) | Pronto quando |
|---|---|---|
| S1 · 26/10–28/10 | Base, navegação, temas, i18n, acessibilidade, telas com mock ✔ | |
| S2–S3 · 29/10–08/11 | Login, cadastro, perfil e configurações na API real; mapa com status ✔; primeiro APK | Quadra do site aparece no app com status |
| S4 · 09/11–15/11 | Mapa e detalhe com a API real, agenda do dia, "Falar com o dono" | Status muda sozinho no app |
| S5 · 16/11–21/11 | Vitrines, estados de erro e vazio | **Congelamento em 21/11** |
| S6 · 22/11–28/11 | Correções, APK final, ensaio | **Entrega em 28/11** |

Cadastro e edição de quadras e o agendamento de partidas ficam só no site.
