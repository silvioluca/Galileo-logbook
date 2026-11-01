import { useEffect, useMemo, useState } from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { BRANCHE_STRUMENTI } from '../data/branche';
import { normalizzaQuantita } from '../utils/parseStrumentiCsv';
import IconaPulsante from './IconaPulsante';
import StrumentoImmagine from './StrumentoImmagine';

const CAMPI_TESTO = [
  ['grandezza', 'Grandezza'],
  ['unita', 'Unità'],
  ['sensibilita', 'Sensibilità'],
  ['portata', 'Portata'],
  ['quantita', 'Quantità'],
  ['armadio', 'Armadio'],
  ['sezione', 'Sezione'],
  ['inventario', 'N. inventario'],
];

function ripulisciEsperimenti(esperimenti) {
  return esperimenti
    .map((e) => ({ nome: e.nome.trim(), schedaId: e.schedaId || null }))
    .filter((e) => e.nome);
}

export default function StrumentoForm({ strumento, scuole, schede, scuolaIniziale, inCorso, onSalva, onAnnulla }) {
  const iniziale = strumento || { nome: '', branca: '', scuola: scuolaIniziale };
  const [dati, setDati] = useState(iniziale);
  const [esperimenti, setEsperimenti] = useState(iniziale.esperimenti || []);
  const [nuovaImmagine, setNuovaImmagine] = useState(null);
  const [rimuoviImmagine, setRimuoviImmagine] = useState(false);

  const anteprima = useMemo(
    () => (nuovaImmagine ? URL.createObjectURL(nuovaImmagine) : null),
    [nuovaImmagine],
  );
  useEffect(() => {
    if (!anteprima) return undefined;
    return () => URL.revokeObjectURL(anteprima);
  }, [anteprima]);

  const haImmagine = !rimuoviImmagine && Boolean(iniziale.immagine || iniziale.immagineFile);

  const campo = (nome) => dati[nome] ?? '';
  const aggiorna = (nome) => (e) => setDati({ ...dati, [nome]: e.target.value });
  const testo = (nome) => String(campo(nome)).trim() || null;

  const scegliImmagine = (e) => {
    const file = e.target.files[0];
    // Azzerato, altrimenti riscegliere lo stesso file dopo "Rimuovi" non farebbe nulla.
    e.target.value = '';
    if (!file) return;
    setNuovaImmagine(file);
    setRimuoviImmagine(false);
  };

  const togliImmagine = () => {
    setNuovaImmagine(null);
    setRimuoviImmagine(true);
  };

  const aggiornaEsperimento = (indice, campi) =>
    setEsperimenti(esperimenti.map((e, i) => (i === indice ? { ...e, ...campi } : e)));

  const invia = (e) => {
    e.preventDefault();
    const elenco = ripulisciEsperimenti(esperimenti);
    // Salvato solo se cambiato: un elenco mai toccato continua a seguire quello proposto nel codice.
    const cambiati =
      JSON.stringify(elenco) !== JSON.stringify(ripulisciEsperimenti(iniziale.esperimenti || []));
    onSalva(
      {
        nome: testo('nome'),
        branca: dati.branca,
        scuola: testo('scuola'),
        grandezza: testo('grandezza'),
        unita: testo('unita'),
        sensibilita: testo('sensibilita'),
        portata: testo('portata'),
        quantita: normalizzaQuantita(dati.quantita),
        armadio: testo('armadio'),
        sezione: testo('sezione'),
        inventario: testo('inventario'),
        descrizione: testo('descrizione'),
        ...(cambiati && { esperimenti: elenco }),
      },
      { nuovaImmagine, rimuoviImmagine },
    );
  };

  return (
    <form className="form-grid" onSubmit={invia}>
      <div className="full strumenti-form-testa">
        <div>
          <input
            id="strumento-form-immagine"
            className="strumenti-form-file"
            type="file"
            accept="image/*"
            onChange={scegliImmagine}
          />
          <label
            htmlFor="strumento-form-immagine"
            className="strumento-modal-immagine strumenti-form-foto"
            aria-label={anteprima || haImmagine ? 'Cambia immagine' : 'Carica immagine'}
          >
            {anteprima && <img src={anteprima} alt="" />}
            {!anteprima && haImmagine && <StrumentoImmagine strumento={iniziale} />}
            {anteprima || haImmagine ? (
              <span className="strumenti-form-foto-azione">Cambia immagine</span>
            ) : (
              <span>Clicca per caricare un'immagine</span>
            )}
          </label>
          {(anteprima || haImmagine) && (
            <button type="button" className="strumenti-link" onClick={togliImmagine}>
              Rimuovi immagine
            </button>
          )}
        </div>
        <div className="strumenti-form-principali">
          <div>
            <label htmlFor="strumento-form-nome">Nome</label>
            <input id="strumento-form-nome" value={campo('nome')} onChange={aggiorna('nome')} required />
          </div>
          <div>
            <label htmlFor="strumento-form-branca">Branca</label>
            <select id="strumento-form-branca" value={campo('branca')} onChange={aggiorna('branca')} required>
              <option value="">Scegli…</option>
              {BRANCHE_STRUMENTI.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="strumento-form-scuola">Scuola</label>
            <input
              id="strumento-form-scuola"
              list="strumento-form-scuole"
              value={campo('scuola')}
              onChange={aggiorna('scuola')}
              required
            />
            <datalist id="strumento-form-scuole">
              {scuole.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>
      </div>
      {CAMPI_TESTO.map(([nome, etichetta]) => (
        <div key={nome}>
          <label htmlFor={`strumento-form-${nome}`}>{etichetta}</label>
          <input id={`strumento-form-${nome}`} value={campo(nome)} onChange={aggiorna(nome)} />
        </div>
      ))}
      <div className="full">
        <label htmlFor="strumento-form-descrizione">Descrizione</label>
        <textarea
          id="strumento-form-descrizione"
          rows={5}
          value={campo('descrizione')}
          onChange={aggiorna('descrizione')}
        />
      </div>
      <div className="full strumenti-form-esperimenti">
        <span className="strumenti-form-titolo">Esperimenti</span>
        {esperimenti.map((esperimento, i) => (
          <div className="strumenti-form-esperimento" key={i}>
            <input
              aria-label={`Nome esperimento ${i + 1}`}
              placeholder="Nome dell'esperimento"
              value={esperimento.nome}
              onChange={(e) => aggiornaEsperimento(i, { nome: e.target.value })}
            />
            <select
              aria-label={`Scheda collegata all'esperimento ${i + 1}`}
              value={esperimento.schedaId || ''}
              onChange={(e) => aggiornaEsperimento(i, { schedaId: e.target.value })}
            >
              <option value="">Nessuna scheda</option>
              {schede.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.modello ? `${s.titolo} (${s.modello})` : s.titolo}
                </option>
              ))}
            </select>
            <IconaPulsante
              etichetta={`Rimuovi esperimento ${i + 1}`}
              onClick={() => setEsperimenti(esperimenti.filter((_, indice) => indice !== i))}
            >
              <IconX size={18} stroke={1.75} />
            </IconaPulsante>
          </div>
        ))}
        <button
          type="button"
          className="strumenti-link strumenti-form-aggiungi"
          onClick={() => setEsperimenti([...esperimenti, { nome: '', schedaId: null }])}
        >
          <IconPlus size={16} stroke={2} />
          Aggiungi esperimento
        </button>
      </div>
      <div className="full strumenti-form-azioni">
        <button type="button" className="btn" onClick={onAnnulla}>
          Annulla
        </button>
        <button type="submit" className="btn primary" disabled={inCorso}>
          {inCorso ? 'Salvataggio…' : 'Salva'}
        </button>
      </div>
    </form>
  );
}
