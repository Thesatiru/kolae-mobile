# Pesquisar nova

Branch: `feat/search-redesign` · Período: 05/11–06/11/2026

## Para quem usa

- **Boas-vindas com o nome** ("Olá, João!") e um resumo ao vivo: **"5 quadras livres agora"**,
  com uma bolinha pulsando. Tocar nele mostra só as quadras livres.
- **Filtros rápidos** logo abaixo da busca: Livre agora, Grátis, Coberta, Com iluminação e Área
  de lazer. Dá para combinar com o esporte e com o texto da busca.
- **Buscas recentes:** ao tocar na busca, aparecem as últimas 6, para repetir com um toque. Dá
  para apagar uma por uma ou todas. Ficam só no celular.
- **Resultados em grade** quando há busca ou filtro, com a quantidade ("12 quadras") e o botão
  "Limpar filtros" quando nada é encontrado.
- **"Ver todas"** na seção "Disponíveis agora".
- **Carregamento mais bonito:** cards cinza no formato do conteúdo, no lugar da bolinha girando.
  Os cards entram um depois do outro.
- Vibração leve ao tocar nos filtros e esportes.
- Tudo respeita o "reduzir movimento": a bolinha e os esqueletos ficam parados e os cards
  aparecem sem animação.

## Para quem desenvolve

- Novos: `Skeleton` (e `VenueCardSkeleton`, `VenueRowSkeleton`, `VenueGridSkeleton`),
  `useRecentSearches` (`src/search/`, AsyncStorage `kolae.recentSearches.<userId>`) e
  `utils/haptics` com `tick()`, o ponto único da vibração (a roleta já usa).
- `QueryState` ganhou `skeleton` e `emptyAction`. Sem eles, continua igual.
- Filtros só com parâmetros que a API já aceita (`status`, `max_price_cents=0`, `is_covered`,
  `has_lighting`, `has_leisure_area`). O resumo usa `per_page=1` e lê `meta.total`.
- i18n: 13 chaves novas nos 7 idiomas.
- `tsc`, `expo lint` e o bundle do Metro sem erros. **Ainda não visto no celular.**

## Commits

- `2c2c0b6` feat: carregamento em esqueleto e ponto único para a vibração
- `d7fe8d7` feat: Pesquisar nova (resumo ao vivo, buscas recentes, filtros e resultados)
