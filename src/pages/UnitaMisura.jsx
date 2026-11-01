import { useMemo, useState } from 'react';
import { UNITA_MISURA } from '../data/unitaMisura';
import Modal from '../components/Modal';

const CATEGORIE_ORDINE = ['Fondamentali SI', 'Derivate SI', 'Sistema imperiale', 'Misure antiche'];

export default function UnitaMisura() {
  const [ricerca, setRicerca] = useState('');
  const [categoriaScelta, setCategoriaScelta] = useState('');
  const [selezionata, setSelezionata] = useState(null);

  const conteggioCategoria = useMemo(() => {
    const m = new Map();
    for (const u of UNITA_MISURA) m.set(u.categoria, (m.get(u.categoria) || 0) + 1);
    return m;
  }, []);

  const filtrate = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();
    return UNITA_MISURA.filter((u) => {
      if (categoriaScelta && u.categoria !== categoriaScelta) return false;
      if (
        testo &&
        !u.grandezza.toLowerCase().includes(testo) &&
        !u.unita.toLowerCase().includes(testo)
      ) {
        return false;
      }
      return true;
    });
  }, [ricerca, categoriaScelta]);

  const gruppi = useMemo(() => {
    const m = new Map();
    for (const cat of CATEGORIE_ORDINE) m.set(cat, []);
    for (const u of filtrate) {
      if (!m.has(u.categoria)) m.set(u.categoria, []);
      m.get(u.categoria).push(u);
    }
    return m;
  }, [filtrate]);

  return (
    <div className="page">
      <div className="container">
        <h1>Unità di Misura</h1>
        <p>
          Le unità fondamentali e derivate del Sistema Internazionale, le unità del sistema imperiale e
          le misure storiche di varie civiltà, con grandezza, simboli e formula dimensionale.
        </p>

        <div className="schede-toolbar">
          <div className="filtro-field">
            <label htmlFor="unita-ricerca">Cerca</label>
            <input
              id="unita-ricerca"
              type="text"
              placeholder="es. Forza, newton"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
          </div>
          <div className="filtro-field">
            <label htmlFor="unita-categoria">Categoria</label>
            <select
              id="unita-categoria"
              value={categoriaScelta}
              onChange={(e) => setCategoriaScelta(e.target.value)}
            >
              <option value="">Tutte le categorie ({UNITA_MISURA.length})</option>
              {CATEGORIE_ORDINE.map((c) => (
                <option key={c} value={c}>
                  {c} ({conteggioCategoria.get(c) || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtrate.length === 0 ? (
          <p className="empty-state">Nessuna unità corrisponde alla ricerca.</p>
        ) : (
          [...gruppi.entries()]
            .filter(([, elenco]) => elenco.length > 0)
            .map(([categoria, elenco]) => (
              <section key={categoria} className="unita-sezione">
                <h2>
                  {categoria} <span className="unita-sezione-conteggio">({elenco.length})</span>
                </h2>
                <div className="unita-table-wrap etched-frame">
                  <table className="scheda-table unita-table">
                    <colgroup>
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '14%' }} />
                    </colgroup>
                    <thead>
                      <tr className="unita-intestazione">
                        <th>Grandezza</th>
                        <th>Simbolo</th>
                        <th>Unità di misura</th>
                        <th>Simbolo</th>
                        <th>Formula dimensionale</th>
                        <th>Branca</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elenco.map((u) => (
                        <tr
                          key={`${u.categoria}-${u.grandezza}-${u.unita}`}
                          className="scheda-row unita-row"
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelezionata(u)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelezionata(u);
                          }}
                        >
                          <td data-label="Grandezza">
                            <span>{u.grandezza}</span>
                          </td>
                          <td data-label="Simbolo">
                            <span>{u.simboloGrandezza}</span>
                          </td>
                          <td data-label="Unità di misura">
                            <span>{u.unita}</span>
                          </td>
                          <td data-label="Simbolo">
                            <span>{u.simboloUnita}</span>
                          </td>
                          <td data-label="Formula dimensionale">
                            <span>{u.formulaDimensionale}</span>
                          </td>
                          <td data-label="Branca">
                            <span>{u.branca}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
        )}

        <Modal open={Boolean(selezionata)} onClose={() => setSelezionata(null)} title={selezionata?.unita}>
          {selezionata && (
            <div>
              <p className="strumento-meta">
                {selezionata.categoria} · {selezionata.branca}
              </p>
              <table className="unita-modal-tabella">
                <tbody>
                  <tr>
                    <th>Grandezza</th>
                    <td>
                      {selezionata.grandezza} ({selezionata.simboloGrandezza})
                    </td>
                  </tr>
                  <tr>
                    <th>Unità di misura</th>
                    <td>
                      {selezionata.unita} ({selezionata.simboloUnita})
                    </td>
                  </tr>
                  <tr>
                    <th>Formula dimensionale</th>
                    <td>{selezionata.formulaDimensionale}</td>
                  </tr>
                </tbody>
              </table>
              <p className="strumento-descrizione">{selezionata.definizione}</p>
              <div className="ornament-divider">✦</div>
              <p className="strumento-descrizione">{selezionata.storia}</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
