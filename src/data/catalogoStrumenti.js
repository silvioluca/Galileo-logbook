import { STRUMENTI_WIKI } from './strumentiWiki';
import { INVENTARIO_NORBERTO_ROSA } from './inventarioNorbertoRosa';
import { esperimentiPredefiniti } from './esperimentiStrumenti';

export const CATALOGO_GENERALE = 'Catalogo generale';

// Gli id sono stabili e derivano dai dati nel codice: è a questi che si
// agganciano le modifiche salvate (vedi strumentiService.js).
const STRUMENTI_BASE = [
  ...STRUMENTI_WIKI.map((s) => ({
    ...s,
    id: `catalogo-${encodeURIComponent(s.nome)}`,
    scuola: CATALOGO_GENERALE,
  })),
  ...INVENTARIO_NORBERTO_ROSA.map((s) => ({ ...s, id: `inventario-${s.numero}` })),
];

// Vero se la voce ha dati da inventario da mostrare: quelle di una scuola
// sempre, quelle del catalogo solo se il proprietario li ha compilati.
export function isInventario(s) {
  return s.scuola !== CATALOGO_GENERALE || s.quantita != null || Boolean(s.armadio || s.inventario);
}

// Elenco finale: voci nel codice, con applicate le modifiche del proprietario,
// senza quelle eliminate e con in coda quelle aggiunte a mano o da CSV.
export function applicaModifiche(modifiche) {
  const perId = new Map(modifiche.map((m) => [m.id, m]));
  return [
    ...STRUMENTI_BASE.map((s) => ({ ...s, ...perId.get(s.id) })),
    ...modifiche.filter((m) => m.aggiunto),
  ]
    .filter((s) => !s.eliminato)
    .map((s) => ({ ...s, esperimenti: s.esperimenti ?? esperimentiPredefiniti(s.nome) }));
}
