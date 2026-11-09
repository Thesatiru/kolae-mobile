# Compartilhar a quadra com o link do site

Branch: `feat/venue-share` · Período: 05/11

## Para quem usa

- O botão de compartilhar da quadra agora manda o link da página pública dela no site
  (`kolae.online/quadra/<id>`), que abre sem login e sem o app. No WhatsApp aparece a prévia com
  nome, descrição e capa. Antes, ia só o nome da quadra.

## Para quem desenvolve

- `src/utils/site.ts`: `SITE_URL` (o endereço da API sem `/api/v1`; antes ficava só no
  `legal.ts`) e `venuePageUrl(id)`, a página pública da D49.
- O link vai dentro do `message`, porque no Android o `Share` ignora o `url`.
- Com o mock das quadras ligado, o link aponta para ids de exemplo que podem não existir no site
  (404). Com a API real, é a quadra de verdade.
- Abrir o app direto pelo link (App Links) ainda não existe: precisaria do
  `/.well-known/assetlinks.json` no site e do `intentFilters` no `app.config.ts`.

## Commits
- 28e0d28 · feat: compartilhar a quadra com o link da página pública

PR #9.
