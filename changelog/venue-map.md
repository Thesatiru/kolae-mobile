# Mapa no detalhe da quadra

Branch: `feat/venue-map` · Período: 05/11

## Para quem usa

- Em "Localização", no detalhe da quadra, aparece o mapa de verdade com o pino da quadra (antes
  era só um desenho). Tocar no mapa abre o Google Maps, como o link logo abaixo.
- Quadra sem localização no mapa continua com o desenho do pino.

## Para quem desenvolve

- Componente `src/map/VenueMiniMap.tsx`, com o `react-native-maps` da aba Mapa. No Android usa o
  `liteMode` (imagem do mapa, sem gestos); no iOS os gestos ficam desligados. Tema escuro com o
  `darkMapStyle`.
- Fica fora do leitor de tela: o link "Abrir no Google Maps" faz o mesmo.
- No APK precisa da mesma chave do Google Maps para Android da aba Mapa (`docs/apk.md`); sem ela,
  fica cinza.

## Commits
- feat: mapa de verdade no detalhe da quadra
