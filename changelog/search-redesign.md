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
- **Destaque "Livre agora, pertinho de você":** um card grande com a quadra livre mais perto,
  com o botão **"Falar com o dono"** direto (ou "Ver quadra", quando ela não tem WhatsApp).
- **Ordenar os resultados** por Mais perto, Menor preço ou Nome, e **"Ver no mapa"**, que abre o
  Mapa já com os mesmos filtros.
- **Convite para ligar a localização** quando ela está desligada, com o botão "Ativar".
- **Vistas recentemente:** as últimas quadras que você abriu, com o status atualizado.
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
- `search/userList.ts`: `createUserList()`, lista salva no aparelho por pessoa e compartilhada
  entre telas (`useSyncExternalStore`). Usada por buscas recentes e `useRecentlyViewed`; o
  detalhe da quadra registra o id ao carregar.
- `NearestFreeCard`, `LocationPrompt` e `LiveDot` em `src/search/`. O destaque busca o detalhe
  só da quadra destacada (o WhatsApp não vem na lista), na mesma chave `['venue', id]` do
  detalhe.
- Mapa: aceita os parâmetros de rota `at, q, sport, available, free, covered, lighting,
  leisure` ("1" = ligado), aplicados uma vez por `at` (ajuste de estado na renderização, sem
  `useEffect`).
- Conferido na produção: `sort=price|name|distance` com os filtros respondem 200.
- Filtros só com parâmetros que a API já aceita (`status`, `max_price_cents=0`, `is_covered`,
  `has_lighting`, `has_leisure_area`). O resumo usa `per_page=1` e lê `meta.total`.
- i18n: 21 chaves novas nos 7 idiomas.
- `tsc`, `expo lint` e o bundle do Metro sem erros. **Ainda não visto no celular.**

## Commits

- `2c2c0b6` feat: carregamento em esqueleto e ponto único para a vibração
- `d7fe8d7` feat: Pesquisar nova (resumo ao vivo, buscas recentes, filtros e resultados)
- `81f9727` feat: listas no aparelho compartilhadas entre telas e "vistas recentemente"
- `e2057d9` feat: destaque da quadra livre mais perto, ordem, "Ver no mapa" e convite de localização
