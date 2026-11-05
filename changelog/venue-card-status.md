# Status e distância no card da quadra

Branch: `feat/venue-card-status` · Período: 05/11/2026

## Para quem usa

- **Os cards da Pesquisar e dos Favoritos mostram se a quadra está livre:** "Disponível · até
  19:00", "Em uso · até 21:00" ou "Fechada", sem precisar abrir a quadra.
- **A distância aparece no card** ("1,2 km · R$ 120/h") quando o app sabe onde você está.
- **O status se atualiza sozinho** quando muda, como já acontecia no mapa.
- O leitor de tela lê também o status e a distância de cada card.

## Para quem desenvolve

- `VenueCard`: largura padrão de 176 px (era 164) e foto com 82% da largura (era quadrada).
- `StatusBadge`: novo `statusText(t, status, until)` e texto com `flexShrink` (quebra linha).
- `msUntilNextChange` saiu de `map.tsx` para `utils/date.ts` e agora é usado também na
  Pesquisar e nos Favoritos (`refetchInterval`).
- Nada novo na API: `status`, `status_until` e `distance_km` já vinham na listagem.
- **Ainda não testado no celular.** `tsc` e `expo lint` sem erros.

## Commits

- `cba6c38` feat: card da quadra mostra o status e a distância
