import { renderTemplateLatex } from './renderTemplate';

// Separato da exportScheda.js: deve partire subito al clic (apre una nuova
// scheda) senza attendere le librerie DOCX/PDF, caricate solo quando servono.
// Apre Overleaf con il sorgente LaTeX pre-caricato (POST "snip", il meccanismo
// ufficiale di Overleaf per aprire contenuto generato al volo senza doverlo
// ospitare su un URL pubblico).
export function apriInOverleaf(scheda, contenutoTemplate) {
  const testoLatex = renderTemplateLatex(contenutoTemplate, scheda);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.overleaf.com/docs';
  form.target = '_blank';
  form.style.display = 'none';

  const campo = document.createElement('input');
  campo.type = 'hidden';
  campo.name = 'snip';
  campo.value = testoLatex;
  form.appendChild(campo);

  document.body.appendChild(form);
  form.submit();
  form.remove();
}
