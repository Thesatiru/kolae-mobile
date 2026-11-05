# Telas de entrada novas e abertura mais suave

Branch: `feat/auth-redesign` · Período: 04/11–05/11/2026

## Para quem usa

- **Login, cadastro e esqueci a senha com visual novo.** O topo mostra linhas de quadra que se
  desenham ao abrir, e o formulário fica num cartão que sobe da parte de baixo.
- **O login mostra o que o app faz logo na entrada:** "Ache uma quadra livre agora.", com um
  cartão de exemplo que alterna entre quadras "Disponível" e "Em uso".
- **Cadastro em duas etapas** ("Sobre você" e "Seu acesso"), com barra de progresso. As regras
  da senha ficam marcadas enquanto você digita.
- **Data de nascimento sem digitar:** roletas de Dia, Mês e Ano, com vibração leve a cada item.
  A data aparece por extenso para conferir.
- **Campos maiores e mais fáceis de tocar.** O nome do campo não some mais ao digitar, a senha
  tem o botão de mostrar e ocultar, e o "Próximo" do teclado leva ao campo seguinte.
- **Abertura do app sem o pisca azul** no modo escuro e mais rápida: sai a espera fixa de 1,2 s.
- Tudo respeita o tema escolhido, o tamanho do texto, a fonte de leitura fácil e o "reduzir
  movimento" (sem animações e sem o cartão que troca sozinho).

## Para quem desenvolve

- Componentes novos: `AuthScaffold` (moldura das telas de entrada, com `backToLogin()`),
  `CourtLines`, `LiveTicker`, `DateField` e `WheelPicker`, e `Appear`/`useAppear()`.
- `TextField` mudou para o app inteiro: fundo preenchido, rótulo visível, `hint`, `ref` e
  `FieldError`/`fieldBoxStyle` exportados. O editar perfil perdeu o rótulo duplicado.
- **Dependência nova: `expo-haptics`** (vem no Expo Go). Rodar `npm install`.
- Primeiro uso do `react-native-reanimated` no app (já estava instalado).
- i18n: 12 chaves novas nos 7 idiomas (`app_auth_*`, `app_register_step`,
  `app_register_access_*`, `app_continue`, `app_date_day/month/year`,
  `app_rule_match_register`). Saiu `app_login_subtitle`.
- Correção: `<Link asChild>` com filho de estilo em lista quebrava a tela (erro do expo-router);
  os links das telas de entrada viraram `Text` com `onPress`.
- Telas vistas no celular (Expo Go, Android). **A roleta de data ainda não foi testada no
  aparelho.** `tsc` e `expo lint` sem erros.

## Commits

- `eb4def6` feat: campos de texto preenchidos, com rótulo fixo e erro animado
- `9e8291d` feat: roleta de data (Dia | Mês | Ano) com vibração
- `923e106` feat: redesign das telas de entrada (login, cadastro, esqueci a senha)
- `e85f508` feat: loading continua a splash nativa e sai com fade
