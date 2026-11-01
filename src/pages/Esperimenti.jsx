import { useMemo, useState } from 'react';
import { ESPERIMENTI } from '../data/esperimenti';
import Modal from '../components/Modal';
import VistaToggle from '../components/VistaToggle';

const CATEGORIE_ORDINE = [
  'Meccanica classica',
  'Elettromagnetismo',
  'Ottica e relatività',
  'Fisica atomica e nucleare',
  'Meccanica quantistica',
  'Astrofisica e cosmologia',
];

export default function Esperimenti() {
  const [ricerca, setRicerca] = useState('');
  const [categoriaScelta, setCategoriaScelta] = useState('');
  const [vista, setVista] = useState('griglia');
  const [selezionato, setSelezionato] = useState(null);

  const conteggioCategoria = useMemo(() => {
    const m = new Map();
    for (const e of ESPERIMENTI) m.set(e.categoria, (m.get(e.categoria) || 0) + 1);
    return m;
  }, []);

  const filtrati = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();
    return ESPERIMENTI.filter((e) => {
      if (categoriaScelta && e.categoria !== categoriaScelta) return false;
      if (
        testo &&
        !e.nome.toLowerCase().includes(testo) &&
        !e.scienziato.toLowerCase().includes(testo)
      ) {
        return false;
      }
      return true;
    });
  }, [ricerca, categoriaScelta]);

  const gruppi = useMemo(() => {
    const m = new Map();
    for (const cat of CATEGORIE_ORDINE) m.set(cat, []);
    for (const e of filtrati) {
      if (!m.has(e.categoria)) m.set(e.categoria, []);
      m.get(e.categoria).push(e);
    }
    return m;
  }, [filtrati]);

  const ordinati = useMemo(
    () => [...filtrati].sort((a, b) => a.nome.localeCompare(b.nome, 'it')),
    [filtrati],
  );

  const apriConTastiera = (e) => (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') setSelezionato(e);
  };

  return (
    <div className="page">
      <div className="container">
        <h1>Esperimenti</h1>
        <p>I più celebri esperimenti della storia della fisica: chi li ha compiuti, come e cosa hanno dimostrato.</p>

        <div className="schede-toolbar">
          <div className="filtro-field">
            <label htmlFor="esperimento-ricerca">Cerca</label>
            <input
              id="esperimento-ricerca"
              type="text"
              placeholder="es. Michelson, doppia fenditura"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
          </div>
          <div className="filtro-field">
            <label htmlFor="esperimento-categoria">Categoria</label>
            <select
              id="esperimento-categoria"
              value={categoriaScelta}
              onChange={(e) => setCategoriaScelta(e.target.value)}
            >
              <option value="">Tutte le categorie ({ESPERIMENTI.length})</option>
              {CATEGORIE_ORDINE.map((c) => (
                <option key={c} value={c}>
                  {c} ({conteggioCategoria.get(c) || 0})
                </option>
              ))}
            </select>
          </div>
          <VistaToggle vista={vista} onCambia={setVista} etichetta="Vista degli esperimenti" />
        </div>

        {filtrati.length === 0 && (
          <p className="empty-state">Nessun esperimento corrisponde alla ricerca.</p>
        )}

        {filtrati.length > 0 && vista === 'griglia' &&
          [...gruppi.entries()]
            .filter(([, elenco]) => elenco.length > 0)
            .map(([categoria, elenco]) => (
              <section key={categoria} className="strumenti-sezione">
                <h2>{categoria}</h2>
                <div className="strumenti-grid">
                  {elenco.map((e) => (
                    <article
                      className="etched-frame strumento-card"
                      key={e.nome}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelezionato(e)}
                      onKeyDown={apriConTastiera(e)}
                    >
                      <h3>{e.nome}</h3>
                      <p className="strumento-meta">
                        {e.scienziato} · {e.anno}
                      </p>
                      <p className="strumento-descrizione">{e.descrizione}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}

        {filtrati.length > 0 && vista === 'elenco' && (
          <div className="unita-table-wrap etched-frame">
            <table className="scheda-table unita-table strumenti-table">
              <colgroup>
                <col style={{ width: '38%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '24%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Esperimento</th>
                  <th scope="col">Scienziato</th>
                  <th scope="col">Anno</th>
                  <th scope="col">Categoria</th>
                </tr>
              </thead>
              <tbody>
                {ordinati.map((e) => (
                  <tr
                    className="scheda-row unita-row"
                    key={e.nome}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelezionato(e)}
                    onKeyDown={apriConTastiera(e)}
                  >
                    <td className="col-titolo" data-label="Esperimento">{e.nome}</td>
                    <td data-label="Scienziato">{e.scienziato}</td>
                    <td data-label="Anno">{e.anno}</td>
                    <td data-label="Categoria">{e.categoria}</td>
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
          className="esperimento-modal"
        >
          {selezionato && (
            <div className="esperimento-modal-corpo">
              <p className="strumento-meta">
                {selezionato.scienziato} · {selezionato.anno}
              </p>
              <p className="esperimento-tesi">{selezionato.cosaDimostra}</p>
              {selezionato.immagine ? (
                <figure className="esperimento-figura">
                  <img
                    src={`${import.meta.env.BASE_URL}${selezionato.immagine}`}
                    alt={selezionato.nome}
                  />
                </figure>
              ) : (
                <figure className="esperimento-figura esperimento-figura-vuota" aria-hidden="true">
                  <span>Immagine non ancora disponibile</span>
                </figure>
              )}
              <p className="strumento-descrizione">{selezionato.dettagli}</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
