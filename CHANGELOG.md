# Changelog

Mudanças relevantes do app Kolae, da mais recente para a mais antiga.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[Versionamento Semântico](https://semver.org/lang/pt-BR/):

- **patch** (`1.0.1`): correções, sem funcionalidade nova;
- **minor** (`1.1.0`): funcionalidades novas, compatíveis com o que já existe;
- **major** (`2.0.0`): mudança grande de produto ou de contrato com a API.

A versão do app é independente da do site e da API ([`Slengm4n/Kolae`](https://github.com/Slengm4n/Kolae)).
Cada versão tem uma tag `vX.Y.Z` e uma release no GitHub com o texto da seção correspondente.
Durante o desenvolvimento, cada branch anota o que mudou em `changelog/<branch>.md`; ao lançar,
as notas entram aqui e os arquivos saem (ver [`changelog/README.md`](changelog/README.md)).

## [Não lançado]

## [1.0.0] - 2026-11-24

Primeira versão do app, a da entrega do Projeto Integrador (FATEC Ferraz de Vasconcelos).
Quem joga encontra quadras particulares perto de si, vê **na hora** se cada uma está livre, em uso
ou fechada, consulta a agenda do dia e fala com o dono pelo WhatsApp ou pelo chat do próprio
Kolae. Usa a API v1 da produção (`https://kolae.online/api/v1`), compatível com o site e a API
**v1.7.0**. Distribuído só como APK para Android (decidido em 05/11).

### Adicionado

#### Conta
- **Telas de entrada:** login, cadastro e esqueci a senha com o topo da marca (linhas de quadra
  que se desenham ao abrir) e o formulário num cartão que sobe. O login mostra a proposta logo
  de cara: "Ache uma quadra livre agora.", com quadras de exemplo alternando entre "Disponível" e
  "Em uso".
- **Cadastro em duas etapas** ("Sobre você" e "Seu acesso"), com barra de progresso, regras da
  senha marcadas enquanto se digita, aceite dos Termos de Uso e da Política de Privacidade, e
  idade mínima de 18 anos conferida no app e na API.
- **Data de nascimento sem digitar:** roletas de Dia, Mês e Ano, com vibração leve a cada item e
  a data por extenso para conferir.
- **Login** com "Lembrar de mim" (desmarcado, a sessão some ao fechar o app), **esqueci a senha**
  por e-mail com reenvio, **perfil** com foto (da galeria), editar o nome e **alterar a
  senha**. Sessão de 30 dias; o app só desconecta quando o token deixa de valer.
- **Tutorial** no primeiro acesso e **Central de ajuda** com perguntas frequentes e contato.

#### Encontrar quadras
- **Pesquisar:** "Olá, <nome>!" e o resumo ao vivo **"N quadras livres agora"**; destaque
  **"Livre agora, pertinho de você"** com "Falar com o dono" direto; busca com **buscas
  recentes**; filtros rápidos (Livre agora, Grátis, Coberta, Com iluminação, Área de lazer) e por
  esporte; resultados em grade com a quantidade, a **ordem** (Mais perto, Menor preço, Nome) e
  **"Ver no mapa"**; seções "Perto de você", "Disponíveis agora" e **"Vistas recentemente"**.
- **Cards das quadras** com o **status** ("Disponível · até 19:00", "Em uso", "Fechada"), a
  **distância** e o preço, atualizados sozinhos quando o status muda.
- **Mapa** com um pino por quadra na cor do status, legenda, filtros (preço, piso, estrutura,
  distância), a posição da pessoa e tema escuro.
- **Convite para ligar a localização** quando ela está desligada.

#### A quadra
- **Detalhe da quadra:** fotos, esportes, piso, estrutura, preço ("Grátis" e "Preço não
  informado"), "Sobre a quadra", horário de funcionamento, endereço com **mapa** e o caminho no
  Google Maps, e a distância até a pessoa.
- **Status e agenda do dia:** a faixa "Disponível agora / Em uso agora / Fechada agora" e as
  faixas do dia (livres e ocupadas, sem mostrar quem alugou), com troca de dia.
- **"Falar com o dono"** pelo WhatsApp (some quando o dono não informou o número).
- **Redes sociais da quadra** (Instagram, TikTok, Facebook e site), cadastradas pelo dono no site.
- **Compartilhar** a quadra com o link da página pública no site (`kolae.online/quadra/<id>`),
  com prévia de foto e nome no WhatsApp.
- **Favoritos**, salvos no celular de cada pessoa, com a tela própria no Menu.

#### Chat com a quadra
- **Conversar com o dono pelo próprio Kolae:** no detalhe da quadra, "Conversar" abre a conversa;
  o dono responde pelo painel do site. Só texto, sem links, até 1000 caracteres.
- **Menu › Mensagens** com todas as conversas e as não lidas; mensagens novas chegam sozinhas a
  cada 5 segundos com a conversa aberta.
- Mensagem que não saiu fica "Não enviada" (tocar para tentar de novo ou apagar); conversa
  bloqueada pelo dono ou de quadra desativada fica só para leitura, com o aviso.

#### Aparência e acessibilidade
- **8 cores** (Kolae, Neutro, Verde, Vermelho, Rosa, Roxo, Orgulho e Alto contraste), cada uma
  com **modo claro, escuro ou automático**, todas com contraste AA.
- **Tamanho do texto**, **fonte para leitura fácil** (Atkinson Hyperlegible), **reduzir
  animações** (também segue o celular) e **vibração** com opção para desligar.
- **Leitor de tela** em todo o app: cards lidos como uma frase só, títulos marcados, erros e
  mensagens novas anunciados, áreas de toque de 44 px ou mais.
- **7 idiomas:** português, inglês, espanhol, italiano, japonês, chinês e hindi.
- **Animações** discretas: entrada em cascata, coração que "pula" ao favoritar, carregamento em
  esqueleto no formato do conteúdo e a abertura do app sem pisca.

#### Estados e conexão
- **Sem internet:** faixa de aviso e recarga sozinha ao reconectar; o app não consulta a API
  em segundo plano.
- **Erros e vazios** com o símbolo do Kolae, "Tentar de novo" e o caminho do suporte.

#### Vitrine (só visual, com o aviso "Prévia")
- **Comunidade** (feed, posts com foto, comentários e curtidas), **perfil de outras pessoas**,
  seguidores e vitórias no perfil, **avaliações** das quadras, **Planos**, duas etapas e alterar
  e-mail. Não falam com a API: mostram como o Kolae pode crescer.

### Notas
- **Chat real:** liga na API do chat (D66) da produção. Antes do APK final, testar a conversa de
  ponta a ponta pelo 4G (app → painel do site → app).
- **Fora desta versão:** entrar com Google (D65), pedidos de horário, anúncios "Patrocinado" e
  notificações no celular. As APIs de pedidos e anúncios já existem no backend v1.7.0; o app
  passa a usá-las numa versão futura.
- **Distribuição:** APK pelo EAS (perfil `preview`), com a chave própria do Google Maps para
  Android. Passo a passo em [`docs/apk.md`](docs/apk.md).

[Não lançado]: https://github.com/Thesatiru/kolae-mobile/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Thesatiru/kolae-mobile/releases/tag/v1.0.0
