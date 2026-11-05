# Gerar e testar o APK

Passo a passo do APK de teste e do APK final, pelo EAS (perfil `preview`). A v1 sai **só como
APK** (decidido em 05/11): sem Play Store nem App Store.

O projeto pertence à conta Expo **`satiru`** (`owner` no `app.config.ts`). Quem roda o build
precisa estar logado nessa conta (ou ser membro dela, se virar organização).

## O que já está pronto no projeto

- `eas.json`, perfil `preview`: gera **APK** (não AAB), distribuição interna e aponta para a
  produção (`https://kolae.online/api/v1`, mocks desligados).
- `app.config.ts`: pacote **`br.com.kolae.app`**; a chave do Maps vem da variável
  **`GOOGLE_MAPS_ANDROID_API_KEY`**, que **nunca** fica escrita no repositório.
- R8 desligado (`expo-build-properties`): com ele, o APK fechava ao abrir (removia o Room do
  WorkManager).
- A produção é `https://`, então não precisa liberar tráfego HTTP.

## 1. Chave do Google Maps para Android (uma vez só)

Sem ela, **o mapa do APK fica cinza** (no Expo Go funciona, porque usa a chave do próprio Expo
Go). A chave do site (`kolae.online`) é outra e não serve aqui.

1. No [Google Cloud Console](https://console.cloud.google.com/), no projeto do Kolae (ou num
   novo), ative a API **Maps SDK for Android**. O Google pede uma conta de faturamento ativa no
   projeto.
2. Em **APIs e serviços › Credenciais › Criar credenciais › Chave de API**.
3. Restrinja a chave:
   - **Restrições de aplicativo:** Apps Android. Adicione o pacote `br.com.kolae.app` e o
     **SHA-1** do certificado do EAS (próximo item).
   - **Restrições de API:** só **Maps SDK for Android**.
4. Para pegar o SHA-1 do EAS:
   ```
   npx eas-cli@latest credentials -p android
   ```
   Escolha o perfil `preview`, depois **Keystore**. Ele mostra o **SHA1 Fingerprint**. Também
   aparece no expo.dev, em *Projeto › Credentials › Android*. Se ainda não existir keystore,
   o primeiro build cria uma; depois é só voltar e copiar o SHA-1.

## 2. Guardar a chave no EAS (uma vez só)

```
npx eas-cli@latest env:create --name GOOGLE_MAPS_ANDROID_API_KEY --value "<a chave>" --environment preview --visibility sensitive
```

Ou pelo expo.dev: *Projeto › Environment variables*, no environment **preview**. Confira com:

```
npx eas-cli@latest env:list --environment preview
```

## 3. Gerar o APK

```
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

O build roda na nuvem do Expo (o plano gratuito tem 15 builds de Android por mês) e leva de 10
a 30 minutos na fila gratuita. No fim aparece um **link e um QR code**. Abra no celular, baixe
e instale (o Android pede para permitir "instalar apps desconhecidos" do navegador).

- Antes de cada build, rode `npx tsc --noEmit` e `npx expo lint`.
- No Windows, use o **PowerShell**, não o WSL. Se o PowerShell bloquear scripts, troque `npx`
  por `npx.cmd`. Se o login pelo navegador falhar, entre com usuário e senha no terminal.

## 4. Testar pelo 4G (Wi-Fi desligado)

Desligue o Wi-Fi para garantir que nada depende da rede de casa.

- [ ] Abre sem fechar sozinho; a splash some com fade, sem pisca.
- [ ] Cadastro (as duas etapas e a roleta de data), sair, login, "Lembrar de mim".
- [ ] Esqueci a senha: o e-mail chega.
- [ ] Pesquisar: resumo "quadras livres agora", filtros, busca, resultados, "Ver no mapa".
- [ ] **Mapa com o mapa de fundo (não cinza)**, pinos com status e a posição da pessoa.
- [ ] Detalhe da quadra, fotos, "Agendar" (agenda do dia) e **"Falar com o dono"** abrindo o
      WhatsApp.
- [ ] Favoritar e ver em Favoritos; trocar a foto do perfil (câmera e galeria).
- [ ] Configurações: tema escuro, Alto contraste, texto grande, outro idioma.
- [ ] Sem internet (modo avião): a faixa "sem conexão" aparece e o app volta sozinho.

## Se der problema

| Sintoma | Causa provável |
| :---- | :---- |
| Mapa cinza, só com os pinos | Chave ausente no environment `preview`, SHA-1 ou pacote errados na restrição, ou a API Maps SDK for Android não está ativa |
| App fecha ao abrir | Erro nativo; ver o log com `adb logcat *:E` com o celular no cabo. Se citar R8 ou Room, conferir o `expo-build-properties` |
| Login dá erro de rede | Conferir a URL no `eas.json` (`https://kolae.online/api/v1`) |
| Localização nunca aparece | Permissão negada ao Kolae (Ajustes › Apps › Kolae › Permissões) ou GPS desligado |

## APK final (S6)

Mesmo comando. Antes, suba `version` no `app.config.ts` (ex.: `1.0.0` para `1.0.1`) para
diferenciar os APKs, e anote no changelog qual build foi para a entrega.
