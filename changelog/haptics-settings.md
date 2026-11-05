# Vibração com opção e coração que pula

Branch: `feat/haptics-settings` (saiu da `feat/search-redesign`) · Período: 06/11/2026

## Para quem usa

- **Nova opção "Vibração"** em Configurações › Aparência, ao lado de "Reduzir animações".
  Começa ligada e desliga todas as vibrações do app de uma vez.
- **Vibração leve** ao tocar nos filtros (Pesquisar e Mapa), trocar o dia na agenda, escolher
  outro pino no mapa e girar a roleta de data.
- **Favoritar vibra** e o **coração "pula"** quando a quadra entra nos favoritos, no card e no
  detalhe. As curtidas da Comunidade ganharam o mesmo coração.
- Com "Reduzir animações" ligado, o coração não pula. A vibração tem a sua própria opção.

## Para quem desenvolve

- `utils/haptics`: `tick()` (seleção) e `tap()` (ação que fica, como favoritar). Só vibram com
  a preferência `haptics` ligada, avisada pelo `PreferencesProvider` (`setHapticsEnabled`).
  **Nunca chamar `expo-haptics` direto nas telas.**
- `HeartIcon`: coração que pula ao marcar (não ao abrir já marcado). `CircleButton` aceita
  `children`.
- `FilterChip` vibra sozinho. Quem usa não chama `tick()` de novo.
- As abas são `NativeTabs`: ficam com o comportamento do sistema, sem vibração própria.
- i18n: `app_haptics` e `app_haptics_desc` nos 7 idiomas.
- `tsc`, `expo lint` e o bundle do Metro sem erros. **Ainda não testado no celular.**
- **Depende da `feat/search-redesign`** (onde nasceu o `utils/haptics`): mergear aquela antes.

## Commits

- `ad91aa7` feat: opção "Vibração" nas Configurações
- `4508026` feat: vibração e coração que pula nos pontos de toque do app
