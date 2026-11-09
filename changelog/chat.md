# Chat com a quadra

Branch: `feat/chat` · Período: 09/11/2026– · Proposta: `docs/proposta-chat.md` do João (D62)

## Para quem usa

- **Converse com a quadra pelo Kolae:** no detalhe da quadra, "Conversar" abre a conversa com a
  pessoa responsável, que responde pelo painel do site. Só texto, sem links.
- **Menu › Mensagens:** todas as suas conversas, a mais recente primeiro, com o número de
  mensagens novas (também ao lado do item no Menu).
- As mensagens novas chegam sozinhas enquanto a conversa está aberta (a cada 5 segundos).
- Mensagem que não saiu fica marcada como "Não enviada": toque para tentar de novo ou apagar.
- Se a quadra bloquear a conversa ou sair do Kolae, a conversa fica só para leitura, com o aviso.
- Leitor de tela: cada mensagem é lida inteira ("Você" ou o nome da quadra, texto e horário), e
  as que chegam são anunciadas.
- Enquanto a API do chat não sobe, a conversa é de demonstração, com o aviso "Prévia".

## Para quem desenvolve

- `src/api/chat.ts` (5 rotas da proposta) e `src/api/mocks/chat.mock.ts` (mesmos códigos; o
  responsável responde em 3 s; `#bloquear` e `#falhar` para testar os estados).
- Nova flag `EXPO_PUBLIC_MOCK_CHAT` (fora do `ANY_MOCK`): `true` no `.env.example` e no `eas.json`
  até a API subir.
- `src/chat/useChatThread.ts`: polling com `after_id` numa query só, `before_id` ao rolar,
  envio otimista, lida e anúncio. `src/chat/parts.tsx`: balões, separador de dia, avatar.
- Telas: `chat/[id]` refeita (sem foto, áudio e localização, fora da proposta) e `messages`.
- `focusManager` ligado ao `AppState`: todo `refetchInterval` para com o app em segundo plano.
- `primaryForText(c)` em `theme/colors`: fundo de destaque com texto corrido em AA (no tema
  Kolae, `#0069CC`). `formatMessageDay` em `utils/format`. `hasLink` foi para `utils/links`.
- Saiu `src/showcase/chat.ts`. i18n: 26 chaves novas (`app_chat_*`, `app_messages_*`,
  `app_menu_messages_desc`) nos 7 idiomas; saíram as 5 da vitrine antiga.
- `tsc`, `expo lint` e o bundle do Android sem erros. **Ainda não testado no celular.**
- Dúvidas do contrato listadas no CLAUDE.md (seção "Chat").

## Commits

