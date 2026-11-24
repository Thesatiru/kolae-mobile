# Notas para o changelog

Cada branch tem o seu arquivo aqui, com o nome da branch sem o prefixo
(`feat/auth-redesign` → `auth-redesign.md`). Assim as branches não brigam no merge.
Na hora de lançar uma versão, juntamos as notas no [`CHANGELOG.md`](../CHANGELOG.md) e apagamos
os arquivos (o passo a passo da versão está em [`docs/apk.md`](../docs/apk.md#versões-e-apks-novos)).

As 13 notas da v1.0.0 (de 04/11 a 09/11) entraram no CHANGELOG e saíram daqui; o texto completo
de cada uma, com as notas técnicas e os commits, continua no histórico do Git
(`git show 5cbdcee:changelog/<nome>.md`).

Formato de cada nota:

```md
# Título curto

Branch: `feat/...` · Período: dd/mm–dd/mm

## Para quem usa
O que muda no app, em linguagem simples (vai para o changelog público).

## Para quem desenvolve
Componentes novos, dependências, chaves de tradução, cuidados.

## Commits
- hash · mensagem
```
