// Regras de conta iguais às da API, para o app avisar antes de enviar. Quem decide é a API (422).

export const PASSWORD_MIN_LENGTH = 8; // D08
export const MIN_AGE = 18;

/** Se quem nasceu em `isoBirthdate` ("YYYY-MM-DD") já tem MIN_AGE anos. */
export function isOldEnough(isoBirthdate: string, today = new Date()): boolean {
  const [year, month, day] = isoBirthdate.split('-').map(Number);
  // Quem nasceu em 29/02 faz aniversário em 01/03 nos anos comuns (o Date ajusta sozinho).
  const birthday = new Date(year + MIN_AGE, month - 1, day);
  return birthday <= today;
}
