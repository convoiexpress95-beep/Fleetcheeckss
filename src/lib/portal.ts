// Retourne un conteneur STABLE pour les portails: le body du document.
// Cela évite les erreurs NotFoundError (removeChild/insertBefore) liées
// aux démontages/rémontages où un portail ciblerait un nœud remplacé.
export function getPortalContainer(): HTMLElement {
  if (typeof document === 'undefined') {
    // En SSR ou environnements sans DOM, expose un stub minimal.
    return ({} as HTMLElement);
  }
  return document.body;
}
