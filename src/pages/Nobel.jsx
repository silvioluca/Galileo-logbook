import { useMemo, useState } from 'react';
import { NOBEL_FISICA } from '../data/nobelFisica';
import Modal from '../components/Modal';
import VistaToggle from '../components/VistaToggle';
import { formattaData, estraiPaeseNascita } from '../utils/nobelUtils';

function decennio(anno) {
  const inizio = Math.floor(anno / 10) * 10;
  return `${inizio}–${inizio + 9}`;
}

function contaOccorrenze(lista, estraiChiave) {
  const conteggio = new Map();
  for (const el of lista) {
    const chiave = estraiChiave(el);
    if (!chiave) continue;
    conteggio.set(chiave, (conteggio.get(chiave) || 0) + 1);
  }
  return conteggio;
}

// Le date/luoghi di nascita e morte sono già nella bio estesa di Wikipedia:
// qui si riportano solo i fatti specifici del premio, per non ripetersi.
function infoPremio(laureato, condivisoCon) {
  let testo = `Premio Nobel per la Fisica ${laureato.anno}`;
  if (condivisoCon.length === 1) testo += `, condiviso con ${condivisoCon[0]}`;
  else if (condivisoCon.length > 1) {
    testo += `, condiviso con ${condivisoCon.slice(0, -1).join(', ')} e ${condivisoCon[condivisoCon.length - 1]}`;
  }
  testo += ` — "${laureato.motivazione}"`;
  return testo;
}

const GENERE_LABEL = { male: 'Uomini', female: 'Donne' };

export default function Nobel() {
  const [ricerca, setRicerca] = useState('');
  const [decennioScelto, setDecennioScelto] = useState('');
  const [nazionalitaScelta, setNazionalitaScelta] = useState('');
  const [genereScelto, setGenereScelto] = useState('');
  const [vista, setVista] = useState('griglia');
  const [selezionato, setSelezionato] = useState(null);

  const decenni = useMemo(() => {
    const insieme = new Set(NOBEL_FISICA.map((l) => decennio(l.anno)));
    return [...insieme].sort();
  }, []);
  const conteggioDecenni = useMemo(() => contaOccorrenze(NOBEL_FISICA, (l) => decennio(l.anno)), []);

  const nazionalita = useMemo(() => {
    const insieme = new Set(
      NOBEL_FISICA.map((l) => estraiPaeseNascita(l.luogoNascita)).filter(Boolean),
    );
    return [...insieme].sort((a, b) => a.localeCompare(b, 'it'));
  }, []);
  const conteggioNazionalita = useMemo(
    () => contaOccorrenze(NOBEL_FISICA, (l) => estraiPaeseNascita(l.luogoNascita)),
    [],
  );

  const conteggioGenere = useMemo(() => contaOccorrenze(NOBEL_FISICA, (l) => l.genere), []);

  const filtrati = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();
    return NOBEL_FISICA.filter((l) => {
      if (decennioScelto && decennio(l.anno) !== decennioScelto) return false;
      if (nazionalitaScelta && estraiPaeseNascita(l.luogoNascita) !== nazionalitaScelta) return false;
      if (genereScelto && l.genere !== genereScelto) return false;
      if (testo && !l.nome.toLowerCase().includes(testo)) return false;
      return true;
    });
  }, [ricerca, decennioScelto, nazionalitaScelta, genereScelto]);

  const condivisoCon = useMemo(() => {
    if (!selezionato) return [];
    return NOBEL_FISICA.filter((l) => l.anno === selezionato.anno && l.nome !== selezionato.nome).map(
      (l) => l.nome,
    );
  }, [selezionato]);

  const apriConTastiera = (l) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') setSelezionato(l);
  };

  return (
    <div className="page">
      <div className="container">
        <h1>Premi Nobel per la Fisica</h1>
        <p>L'albo completo dei vincitori del Premio Nobel per la Fisica, dal 1901 a oggi.</p>

        <div className="schede-toolbar">
          <div className="filtro-field">
            <label htmlFor="nobel-ricerca">Cerca</label>
            <input
              id="nobel-ricerca"
              type="text"
              placeholder="es. Curie"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
          </div>
          <div className="filtro-field">
            <label htmlFor="nobel-decennio">Decennio</label>
            <select
              id="nobel-decennio"
              value={decennioScelto}
              onChange={(e) => setDecennioScelto(e.target.value)}
            >
              <option value="">Tutti i decenni ({NOBEL_FISICA.length})</option>
              {decenni.map((d) => (
                <option key={d} value={d}>
                  {d} ({conteggioDecenni.get(d) || 0})
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-field">
            <label htmlFor="nobel-nazionalita">Nazionalità</label>
            <select
              id="nobel-nazionalita"
              value={nazionalitaScelta}
              onChange={(e) => setNazionalitaScelta(e.target.value)}
            >
              <option value="">Tutte le nazionalità ({NOBEL_FISICA.length})</option>
              {nazionalita.map((n) => (
                <option key={n} value={n}>
                  {n} ({conteggioNazionalita.get(n) || 0})
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-field">
            <label htmlFor="nobel-genere">Genere</label>
            <select id="nobel-genere" value={genereScelto} onChange={(e) => setGenereScelto(e.target.value)}>
              <option value="">Tutti ({NOBEL_FISICA.length})</option>
              {Object.entries(GENERE_LABEL).map(([valore, etichetta]) => (
                <option key={valore} value={valore}>
                  {etichetta} ({conteggioGenere.get(valore) || 0})
                </option>
              ))}
            </select>
          </div>
          <VistaToggle vista={vista} onCambia={setVista} etichetta="Vista dei vincitori" />
        </div>

        {filtrati.length === 0 && (
          <p className="empty-state">Nessun vincitore corrisponde alla ricerca.</p>
        )}

        {filtrati.length > 0 && vista === 'griglia' && (
          <div className="strumenti-grid">
            {filtrati.map((l) => (
              <article
                className="etched-frame strumento-card nobel-card"
                key={`${l.anno}-${l.nome}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelezionato(l)}
                onKeyDown={apriConTastiera(l)}
              >
                <div className="nobel-card-foto">
                  {l.immagine ? (
                    <img
                      src={`${import.meta.env.BASE_URL}${l.immagine}`}
                      alt={l.nome}
                      loading="lazy"
                    />
                  ) : (
                    <div className="nobel-card-foto-placeholder" aria-hidden="true" />
                  )}
                </div>
                <h3>{l.nome}</h3>
                <p className="strumento-meta">
                  ({formattaData(l.nascita)} – {formattaData(l.morte) || 'vivente'})
                </p>
                <p className="nobel-anno">Premio Nobel {l.anno}</p>
                <p className="nobel-motivazione">{l.motivazione}</p>
              </article>
            ))}
          </div>
        )}

        {filtrati.length > 0 && vista === 'elenco' && (
          <div className="unita-table-wrap etched-frame">
            <table className="scheda-table unita-table strumenti-table">
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '26%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '50%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Anno</th>
                  <th scope="col">Vincitore</th>
                  <th scope="col">Nazionalità</th>
                  <th scope="col">Motivazione</th>
                </tr>
              </thead>
              <tbody>
                {filtrati.map((l) => (
                  <tr
                    className="scheda-row unita-row"
                    key={`${l.anno}-${l.nome}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelezionato(l)}
                    onKeyDown={apriConTastiera(l)}
                  >
                    <td data-label="Anno">{l.anno}</td>
                    <td className="col-titolo" data-label="Vincitore">{l.nome}</td>
                    <td data-label="Nazionalità">{estraiPaeseNascita(l.luogoNascita) || '—'}</td>
                    <td data-label="Motivazione">{l.motivazione}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          open={Boolean(selezionato)}
          onClose={() => setSelezionato(null)}
          title={selezionato?.nome}
          className="nobel-modal"
        >
          {selezionato && (
            <div className="strumento-modal-layout">
              <div className="strumento-modal-immagine">
                {selezionato.immagine ? (
                  <img
                    src={`${import.meta.env.BASE_URL}${selezionato.immagine}`}
                    alt={selezionato.nome}
                  />
                ) : (
                  <span aria-hidden="true">Immagine non disponibile</span>
                )}
              </div>
              <div className="nobel-modal-testo">
                <p className="strumento-meta">
                  ({formattaData(selezionato.nascita)} – {formattaData(selezionato.morte) || 'vivente'})
                </p>
                <p className="nobel-anno">{infoPremio(selezionato, condivisoCon)}</p>
                {selezionato.bioEstesa && <p className="nobel-bio-estesa">{selezionato.bioEstesa}</p>}
                {selezionato.wikipedia && (
                  <p>
                    <a href={selezionato.wikipedia} target="_blank" rel="noreferrer">
                      Approfondisci su Wikipedia (in inglese) ↗
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
