# Redes sociais da quadra

Branch: `feat/venue-socials` · Período: 05/11

## Para quem usa

- No detalhe da quadra, abaixo do "Falar com o dono", aparecem os ícones das redes da quadra
  (Instagram, TikTok, Facebook e site). Cada um abre o perfil no app da rede ou no navegador.
  Quadra sem nenhuma rede não mostra a linha.
- Horário de funcionamento com os dias escritos certo: "Segunda-feira" (antes, "Segunda-Feira").
- Cada tipo de piso tem o seu ícone (antes, todos apareciam com o de grama).

## Para quem desenvolve

- Segue a **proposta** `docs/proposta-redes-sociais.md` do João (vira a D60). Ainda não está no
  `api.md` nem na produção: por enquanto só aparece com `EXPO_PUBLIC_MOCK_VENUES=true`.
- `VenueSocials` em `src/api/types.ts`; `VenueDetail.socials` é **opcional** até a API mandar
  (sem o campo = sem redes). Quando entrar no contrato, tirar o `?`.
- Mock com os quatro casos: Sesc (as quatro), Quadra do Xuxa (algumas), SESI (só o site),
  Arena Suzano (nenhuma) e Arena Ferraz (Instagram e TikTok). O resumo (`GET /venues`) não tem
  `socials`.
- Componente `src/components/VenueSocials.tsx`, com ícones do `FontAwesome6` (o
  MaterialCommunityIcons não tem TikTok). Instagram e TikTok guardam só o usuário: o app monta
  o link.
- Chaves novas nos 7 idiomas: `app_socials`, `app_social_website`, `app_social_a11y`,
  `app_social_hint`.
- `floorIcon()` em `src/utils/floorIcons.ts` (um ícone por chave de piso) e `capitalizeFirst()`
  em `src/utils/format.ts` (o `textTransform: 'capitalize'` punha maiúscula depois do hífen).

## Commits
- f083350 · feat: redes sociais da quadra no detalhe (mock da proposta D60)
- fix: dias da semana com maiúscula só no começo e ícone por tipo de piso
