import { convertiHtmlInLatex } from './htmlToLatex';

// Sostituisce i placeholder {{CAMPO}} di un template LaTeX (vedi templates/)
// con i dati di una scheda, facendo l'escape dei caratteri speciali LaTeX.
function escapeLatex(valore = '') {
  return String(valore)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([{}#$%&_])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\n/g, '\\\\\n');
}

export function renderTemplateLatex(contenutoTemplate, scheda) {
  const {
    titolo,
    branca,
    autore,
    esperienza,
    modello,
    durataMinuti,
    numeroEsperienze,
    difficolta,
    scopo,
    strumenti = [],
    procedimento,
  } = scheda;

  const materialeItems = strumenti.map((s) => `  \\item ${escapeLatex(s)}`).join('\n');
  const materialeInline = strumenti.map((s) => escapeLatex(s)).join(', ');

  const sostituzioni = {
    '{{TITOLO}}': escapeLatex(titolo),
    '{{BRANCA}}': escapeLatex(branca),
    '{{AUTORE}}': escapeLatex(autore),
    // Template salvati prima del campo autore: al posto dell'esperienza, non più richiesta.
    '{{ESPERIENZA}}': escapeLatex(esperienza || autore),
    '{{MODELLO}}': escapeLatex(modello),
    '{{DURATA}}': String(durataMinuti ?? ''),
    '{{NUMERO_ESPERIENZE}}': String(numeroEsperienze ?? ''),
    '{{DIFFICOLTA}}': escapeLatex(difficolta),
    '{{SCOPO}}': escapeLatex(scopo),
    '{{MATERIALE_ITEMS}}': materialeItems,
    '{{MATERIALE_INLINE}}': materialeInline,
    '{{PROCEDIMENTO}}': convertiHtmlInLatex(procedimento),
  };

  let risultato = contenutoTemplate;
  for (const [placeholder, valore] of Object.entries(sostituzioni)) {
    risultato = risultato.split(placeholder).join(valore);
  }
  return risultato;
}
