/**
 * Generuje slug z imienia i nazwiska agenta
 * @example
 * generateAgentSlug('Jakub', 'Pruszyński') => 'jakub-pruszynski'
 */
export function generateAgentSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // usuwa polskie znaki
    .replace(/ł/g, 'l')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Generuje ścieżkę do zdjęcia agenta
 * @example
 * getAgentImagePath('Jakub', 'Pruszyński') => '/agents/full/Jakub_Pruszyński.jpg'
 */
export function getAgentImagePath(firstName: string, lastName: string): string {
  return `/agents/full/${firstName}_${lastName}.jpg`;
}

/**
 * Normalizuje imię i nazwisko do porównania
 * @example
 * normalizeAgentName('Jakub', 'Pruszyński') => 'jakub pruszynski'
 */
export function normalizeAgentName(
  firstName: string,
  lastName: string
): string {
  return `${firstName} ${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim();
}
