import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { pdfjsLib } from '../utils/extractText';
import { otteniBlobFileOriginale } from '../services/fileOriginaleService';

// Anteprima del file reale di una scheda importata: usata sia in creazione
// (blob locale, non ancora servito da Firestore) sia in modifica (fileOriginale
// già caricato, va recuperato dai chunk). Non rigenera nulla: il PDF è
// disegnato pagina per pagina, il DOCX impaginato come in Word e ridotto alla
// larghezza del riquadro, .tex e .txt mostrano il testo del file.
async function disegnaPdf(blob, contenitore, attivo) {
  const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
  const larghezza = contenitore.clientWidth;
  const densita = window.devicePixelRatio || 1;
  for (let i = 1; i <= pdf.numPages && attivo(); i++) {
    const pagina = await pdf.getPage(i);
    const viewport = pagina.getViewport({ scale: (larghezza / pagina.getViewport({ scale: 1 }).width) * densita });
    const canvas = document.createElement('canvas');
    canvas.className = 'anteprima-pdf-pagina';
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pagina.render({ canvas, viewport }).promise;
    if (attivo()) contenitore.append(canvas);
  }
}

// Un'interruzione di pagina seguita dal segno con cui Word ricorda dove aveva
// già interrotto la pagina diventa, in docx-preview, una pagina vuota che
// Word non mostra: si tolgono le pagine senza testo né contenuti grafici.
function togliPagineVuote(destinazione) {
  const pagine = [...destinazione.querySelectorAll('section.docx')];
  const vuote = pagine.filter((pagina) => {
    const corpo = pagina.querySelector('article');
    return corpo && !corpo.textContent.trim() && !corpo.querySelector('img, svg, canvas, table, math, object');
  });
  if (vuote.length < pagine.length) vuote.forEach((pagina) => pagina.remove());
}

function adattaDocx(contenitore) {
  const involucro = contenitore.querySelector('.docx-wrapper');
  const pagina = involucro?.querySelector('section');
  if (!pagina) return;
  involucro.style.zoom = '';
  const stile = getComputedStyle(involucro);
  const necessaria = pagina.offsetWidth + parseFloat(stile.paddingLeft) + parseFloat(stile.paddingRight);
  involucro.style.zoom = String(Math.min(1, contenitore.clientWidth / necessaria));
}

// Chi la usa cambia `key` a ogni file, così lo stato riparte da zero.
export default function FileOriginalePreview({ file, fileOriginale }) {
  const contenitore = useRef(null);
  const [stato, setStato] = useState('caricamento'); // 'caricamento' | 'pronto' | 'errore'
  const [testo, setTesto] = useState(null);
  const estensione = (fileOriginale?.estensione || file?.name.split('.').pop() || '').toLowerCase();

  useEffect(() => {
    let attivo = true;
    const eAttivo = () => attivo;
    const nodo = contenitore.current;
    let osservatore = null;

    async function carica() {
      try {
        const blob = file || (await otteniBlobFileOriginale(fileOriginale));
        if (!attivo) return;
        if (estensione === 'pdf') {
          await disegnaPdf(blob, nodo, eAttivo);
        } else if (estensione === 'docx') {
          // Le sezioni continue (es. colonne di Google Docs) restano sulla stessa
          // pagina; le interruzioni seguono quelle salvate da Word nel file.
          // Si disegna a parte e si inserisce solo se il caricamento è ancora
          // valido: un rendering lento già annullato non deve finire nel riquadro.
          const destinazione = document.createElement('div');
          await renderAsync(blob, destinazione, undefined, {
            className: 'docx',
            inWrapper: true,
            breakPages: true,
            ignoreLastRenderedPageBreak: false,
          });
          if (!attivo) return;
          togliPagineVuote(destinazione);
          nodo.append(destinazione);
          adattaDocx(nodo);
          osservatore = new ResizeObserver(() => adattaDocx(nodo));
          osservatore.observe(nodo);
        } else {
          const contenuto = await blob.text();
          if (attivo) setTesto(contenuto);
        }
        if (attivo) setStato('pronto');
      } catch (err) {
        console.warn('Anteprima file originale non disponibile.', err);
        if (attivo) setStato('errore');
      }
    }

    carica();

    return () => {
      attivo = false;
      osservatore?.disconnect();
      nodo.replaceChildren();
    };
  }, [file, fileOriginale, estensione]);

  return (
    <>
      {stato === 'caricamento' && <p className="form-notice">Caricamento anteprima…</p>}
      {stato === 'errore' && <p className="form-notice">Anteprima non disponibile per questo file.</p>}
      <div
        ref={contenitore}
        className={`anteprima-file anteprima-file-${estensione}`}
        hidden={stato === 'errore' || testo !== null}
      />
      {testo !== null && <pre className="anteprima-file-testo">{testo}</pre>}
    </>
  );
}
