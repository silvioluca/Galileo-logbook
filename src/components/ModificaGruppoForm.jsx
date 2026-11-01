import { useState } from 'react';
import { BRANCHE_STRUMENTI } from '../data/branche';

export default function ModificaGruppoForm({ numero, scuole, inCorso, onSalva, onAnnulla }) {
  const [dati, setDati] = useState({ branca: '', scuola: '', armadio: '', sezione: '' });
  const [errore, setErrore] = useState('');

  const aggiorna = (nome) => (e) => setDati({ ...dati, [nome]: e.target.value });

  const invia = (e) => {
    e.preventDefault();
    // I campi lasciati vuoti non cambiano.
    const campi = Object.fromEntries(
      Object.entries(dati)
        .map(([nome, valore]) => [nome, valore.trim()])
        .filter(([, valore]) => valore),
    );
    if (Object.keys(campi).length === 0) setErrore('Compila almeno un campo.');
    else onSalva(campi);
  };

  return (
    <form className="form-grid" onSubmit={invia}>
      <p className="full strumento-meta">
        Modifichi {numero} {numero === 1 ? 'strumento' : 'strumenti'}. I campi vuoti restano invariati.
      </p>
      <div>
        <label htmlFor="gruppo-branca">Branca</label>
        <select id="gruppo-branca" value={dati.branca} onChange={aggiorna('branca')}>
          <option value="">Non cambiare</option>
          {BRANCHE_STRUMENTI.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="gruppo-scuola">Scuola</label>
        <input id="gruppo-scuola" list="gruppo-scuole" value={dati.scuola} onChange={aggiorna('scuola')} />
        <datalist id="gruppo-scuole">
          {scuole.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <div>
        <label htmlFor="gruppo-armadio">Armadio</label>
        <input id="gruppo-armadio" value={dati.armadio} onChange={aggiorna('armadio')} />
      </div>
      <div>
        <label htmlFor="gruppo-sezione">Sezione</label>
        <input id="gruppo-sezione" value={dati.sezione} onChange={aggiorna('sezione')} />
      </div>
      {errore && <p className="full strumenti-errore">{errore}</p>}
      <div className="full strumenti-form-azioni">
        <button type="button" className="btn" onClick={onAnnulla}>
          Annulla
        </button>
        <button type="submit" className="btn primary" disabled={inCorso}>
          Applica
        </button>
      </div>
    </form>
  );
}
