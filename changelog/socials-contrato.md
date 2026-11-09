# Redes da quadra pela API

Branch: `fix/socials-contrato` · Período: 05/11

## Para quem usa

- As redes sociais da quadra agora vêm do site: o que o responsável cadastrar no painel aparece
  no app, no detalhe da quadra.

## Para quem desenvolve

- A D60 entrou no `api.md` e na produção (site, PRs #72–#76): `VenueDetail.socials` deixa de ser
  opcional e o `VenueSocials` não aceita mais `undefined`.
- `CLAUDE.md`: regra das redes em "Como o app consome a API"; a pendência vira só o teste de ponta
  a ponta com uma quadra real.

## Commits
- fix: socials obrigatório no detalhe, como no contrato (D60)
