import { useMemo, useState } from 'react';
import {
  MODELLO_CSV,
  decodificaCsv,
  interpretaRigheCsv,
  leggiRigheCsv,
} from '../utils/parseStrumentiCsv';

const MAX_ERRORI_MOSTRATI = 8;

function scaricaModello() {
  // Il BOM fa riconoscere a Excel la codifica UTF-8 (lettere accentate).
  const url = URL.createObjectURL(new Blob([`﻿${MODELLO_CSV}`], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modello-strumenti.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function ImportaStrumentiCsv({ strumenti, scuole, inCorso, onImporta, onAnnulla }) {
  const [righe, setRighe] = useState(null);
  const [scuolaPredefinita, setScuolaPredefinita] = useState('');

  const risultato = useMemo(
    () => righe && interpretaRigheCsv(righe, { scuolaPredefinita, strumenti }),
    [righe, scuolaPredefinita, strumenti],
  );

  const scegliFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRighe(leggiRigheCsv(decodificaCsv(await file.arrayBuffer())));
  };

  return (
    <div className="form-grid">
      <p className="full strumento-meta">
        Colonne: Nome, Branca, Scuola, Quantità, Armadio, Sezione, N. Inventario, Grandezza, Unità,
        Sensibilità, Portata, Descrizione. Sono obbligatorie le prime tre; la Scuola può anche essere
        indicata qui sotto per tutto il file. Le immagini si aggiungono poi dalla modifica.{' '}
        <button type="button" className="strumenti-link" onClick={scaricaModello}>
          Scarica il modello
        </button>
      </p>
      <div>
        <label htmlFor="importa-file">File CSV</label>
        <input id="importa-file" type="file" accept=".csv,text/csv" onChange={scegliFile} />
      </div>
      <div>
        <label htmlFor="importa-scuola">Scuola per le righe senza scuola</label>
        <input
          id="importa-scuola"
          list="importa-scuole"
          value={scuolaPredefinita}
          onChange={(e) => setScuolaPredefinita(e.target.value)}
        />
        <datalist id="importa-scuole">
          {scuole.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      {risultato?.intestazioneMancante && (
        <p className="full strumenti-errore">
          Nel file manca la colonna con il nome dello strumento (Descrizione, Nome o Strumento).
        </p>
      )}
      {risultato && !risultato.intestazioneMancante && (
        <div className="full strumenti-esito">
          <p>
            <strong>{risultato.voci.length}</strong> da importare · {risultato.duplicati} già presenti, saltati ·{' '}
            {risultato.errori.length} con errori, saltati
          </p>
          {risultato.errori.length > 0 && (
            <ul className="strumenti-errore">
              {risultato.errori.slice(0, MAX_ERRORI_MOSTRATI).map(({ riga, messaggio }) => (
                <li key={riga}>
                  Riga {riga}: {messaggio}
                </li>
              ))}
              {risultato.errori.length > MAX_ERRORI_MOSTRATI && (
                <li>…e altri {risultato.errori.length - MAX_ERRORI_MOSTRATI}</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="full strumenti-form-azioni">
        <button type="button" className="btn" onClick={onAnnulla}>
          Annulla
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={inCorso || !risultato?.voci.length}
          onClick={() => onImporta(risultato.voci)}
        >
          Importa
        </button>
      </div>
    </div>
  );
}
