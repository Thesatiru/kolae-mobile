# Notas para o changelog

Cada branch tem o seu arquivo aqui, com o nome da branch sem o prefixo
(`feat/auth-redesign` → `auth-redesign.md`). Assim as branches não brigam no merge.
Na hora de lançar uma versão, juntamos as notas no `CHANGELOG.md` e apagamos os arquivos.

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
