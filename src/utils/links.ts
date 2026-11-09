// Sem links no que a pessoa escreve (posts, respostas e chat; a API tem a mesma regra):
// http(s)://, www. ou domínio.tld.
// O domínio só conta em minúsculas, para não pegar frase sem espaço depois do ponto
// ("fim de jogo.Com chuva").
const PROTOCOL = /(https?:\/\/|www\.)\S+/i;
const DOMAIN = /\b[a-z0-9-]+\.(com|net|org|br|io|app|gg|me|co|info|xyz|site|online)(\.[a-z]{2})?\b/;
export const hasLink = (text: string) => PROTOCOL.test(text) || DOMAIN.test(text);
