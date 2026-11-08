import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// Con il worker già configurato: serve anche all'anteprima dei PDF.
export { pdfjsLib };

async function estraiDaPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let testo = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const pagina = await pdf.getPage(i);
    const contenuto = await pagina.getTextContent();
    contenuto.items.forEach((item) => {
      testo += item.str + (item.hasEOL ? '\n' : ' ');
    });
    testo += '\n';
  }
  return testo;
}

async function estraiDaDocx(file) {
  const buffer = await file.arrayBuffer();
  const risultato = await mammoth.extractRawText({ arrayBuffer: buffer });
  return risultato.value;
}

export const ESTENSIONI_SUPPORTATE = ['tex', 'txt', 'pdf', 'docx'];

export function estensioneSupportata(estensione) {
  return ESTENSIONI_SUPPORTATE.includes(estensione);
}

export async function estraiTestoDaFile(file) {
  const estensione = file.name.split('.').pop()?.toLowerCase();

  if (estensione === 'pdf') return estraiDaPdf(file);
  if (estensione === 'docx') return estraiDaDocx(file);
  return file.text();
}
