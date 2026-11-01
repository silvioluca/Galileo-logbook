import { useEffect, useMemo, useState } from 'react';
import { IconCheck, IconPencil, IconSelectAll, IconTrash } from '@tabler/icons-react';
import { BRANCHE_STRUMENTI } from '../data/branche';
import { applicaModifiche, isInventario } from '../data/catalogoStrumenti';
import { useAuth } from '../context/AuthContext';
import { caricaFileOriginale, eliminaFileOriginale } from '../services/fileOriginaleService';
import {
  aggiungiStrumenti,
  eliminaStrumenti,
  getModificheStrumenti,
  salvaStrumenti,
} from '../services/strumentiService';
import { getSchede } from '../services/schedeService';
import { ridimensionaImmagine } from '../utils/ridimensionaImmagine';
import EsperimentiStrumento from '../components/EsperimentiStrumento';
import IconaPulsante from '../components/IconaPulsante';
import ImportaStrumentiCsv from '../components/ImportaStrumentiCsv';
import Modal from '../components/Modal';
import ModificaGruppoForm from '../components/ModificaGruppoForm';
import StrumentiBrancaChart from '../components/StrumentiBrancaChart';
import StrumentoForm from '../components/StrumentoForm';
import StrumentoImmagine from '../components/StrumentoImmagine';
import VistaToggle from '../components/VistaToggle';

function raggruppaPerBranca(strumenti) {
  const perBranca = new Map();
  for (const branca of BRANCHE_STRUMENTI) perBranca.set(branca, []);
  for (const s of strumenti) {
    if (!perBranca.has(s.branca)) perBranca.set(s.branca, []);
    perBranca.get(s.branca).push(s);
  }
  return perBranca;
}

// L'armadio può essere un numero oppure un luogo ("nel laboratorio").
function collocazione(s) {
  if (!s.armadio) return 'Collocazione non indicata';
  if (!/^\d/.test(s.armadio)) return s.armadio;
  return s.sezione ? `Armadio ${s.armadio}, sezione ${s.sezione}` : `Armadio ${s.armadio}`;
}

function metaGrandezza(s) {
  return [s.grandezza, s.unita].filter(Boolean).join(' · ');
}

function metaInventario(s) {
  if (!isInventario(s)) return '';
  return s.quantita != null ? `Quantità: ${s.quantita} · ${collocazione(s)}` : collocazione(s);
}

function messaggioErrore(err) {
  if (err.code === 'permission-denied') {
    return 'Firestore ha rifiutato il salvataggio: controlla di aver aggiunto la regola per la collezione "strumenti" e di aver effettuato l\'accesso.';
  }
  return err.message || 'Operazione non riuscita.';
}

// Il rettangolo seleziona con il mouse; questa casella invisibile dà lo stesso
// gesto a tastiera e screen reader. Il suo clic non deve risalire alla voce,
// che altrimenti cambierebbe stato una seconda volta.
function SelezioneNascosta({ nome, selezionato, onCambia }) {
  return (
    <input
      className="strumento-selezione"
      type="checkbox"
      checked={selezionato}
      onChange={onCambia}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Seleziona ${nome}`}
    />
  );
}

function NomeApribile({ nome, onApri }) {
  return (
    <button
      type="button"
      className="strumento-nome"
      onClick={(e) => {
        e.stopPropagation();
        onApri();
      }}
    >
      {nome}
    </button>
  );
}

export default function StrumentiWiki() {
  const { isOwner } = useAuth();
  const [modifiche, setModifiche] = useState([]);
  const [schede, setSchede] = useState([]);
  const [ricerca, setRicerca] = useState('');
  const [scuola, setScuola] = useState('');
  const [branca, setBranca] = useState('');
  const [vista, setVista] = useState('griglia');
  const [selezionato, setSelezionato] = useState(null);
  const [spuntati, setSpuntati] = useState(new Set());
  // null oppure { tipo: 'nuovo' | 'modifica' | 'gruppo' | 'importa', strumento? }
  const [gestione, setGestione] = useState(null);
  const [inCorso, setInCorso] = useState(false);

  useEffect(() => {
    let attivo = true;
    getModificheStrumenti().then((dati) => {
      if (attivo) setModifiche(dati);
    });
    getSchede().then((dati) => {
      if (attivo) setSchede(dati);
    });
    return () => {
      attivo = false;
    };
  }, []);

  const strumenti = useMemo(() => applicaModifiche(modifiche), [modifiche]);

  const conteggioScuola = useMemo(() => {
    const m = new Map();
    for (const s of strumenti) m.set(s.scuola, (m.get(s.scuola) || 0) + 1);
    return m;
  }, [strumenti]);

  const scuole = useMemo(() => [...conteggioScuola.keys()], [conteggioScuola]);

  const strumentiScuola = useMemo(
    () => (scuola ? strumenti.filter((s) => s.scuola === scuola) : strumenti),
    [scuola, strumenti],
  );

  const conteggioBranca = useMemo(() => {
    const m = new Map();
    for (const s of strumentiScuola) m.set(s.branca, (m.get(s.branca) || 0) + 1);
    return m;
  }, [strumentiScuola]);

  const filtrati = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();
    return strumentiScuola.filter((s) => {
      if (branca && s.branca !== branca) return false;
      if (testo && !s.nome.toLowerCase().includes(testo)) return false;
      return true;
    });
  }, [ricerca, branca, strumentiScuola]);

  const gruppi = useMemo(() => raggruppaPerBranca(filtrati), [filtrati]);

  const ordinati = useMemo(
    () => [...filtrati].sort((a, b) => a.nome.localeCompare(b.nome, 'it')),
    [filtrati],
  );

  // Le azioni di gruppo valgono solo per ciò che si vede: una voce spuntata e
  // poi nascosta da un filtro non deve essere toccata di nascosto.
  const selezione = useMemo(() => filtrati.filter((s) => spuntati.has(s.id)), [filtrati, spuntati]);

  const tuttiSelezionati = selezione.length === filtrati.length;

  const cambiaSpunta = (id) => {
    const nuovi = new Set(spuntati);
    if (!nuovi.delete(id)) nuovi.add(id);
    setSpuntati(nuovi);
  };

  // Per il proprietario il clic sulla voce seleziona e si apre dal nome; per
  // tutti gli altri la voce intera apre il dettaglio.
  const azioniVoce = (s) =>
    isOwner
      ? { onClick: () => cambiaSpunta(s.id) }
      : {
          role: 'button',
          tabIndex: 0,
          onClick: () => setSelezionato(s),
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') setSelezionato(s);
          },
        };

  const esegui = async (azione) => {
    setInCorso(true);
    try {
      await azione();
      setModifiche(await getModificheStrumenti());
      setGestione(null);
      return true;
    } catch (err) {
      window.alert(messaggioErrore(err));
      console.warn(err);
      return false;
    } finally {
      setInCorso(false);
    }
  };

  const salvaForm = (dati, { nuovaImmagine, rimuoviImmagine }) =>
    esegui(async () => {
      const originale = gestione.strumento;
      let immagine = {};
      if (nuovaImmagine) {
        const file = await ridimensionaImmagine(nuovaImmagine);
        immagine = { immagineFile: await caricaFileOriginale(file), immagine: null };
      } else if (rimuoviImmagine) {
        immagine = { immagineFile: null, immagine: null };
      }

      const completi = { ...dati, ...immagine };
      if (originale) await salvaStrumenti([{ id: originale.id, dati: completi }]);
      else await aggiungiStrumenti([completi]);

      if (originale?.immagineFile && (nuovaImmagine || rimuoviImmagine)) {
        await eliminaFileOriginale(originale.immagineFile.fileId);
      }
    });

  const salvaGruppo = async (campi) => {
    const voci = selezione.map((s) => ({ id: s.id, dati: campi }));
    if (await esegui(() => salvaStrumenti(voci))) setSpuntati(new Set());
  };

  const elimina = async (daEliminare) => {
    const descrizione =
      daEliminare.length === 1 ? `"${daEliminare[0].nome}"` : `${daEliminare.length} strumenti`;
    if (!window.confirm(`Eliminare ${descrizione}? Spariranno dalla pagina per tutti.`)) return;
    const eliminate = await esegui(async () => {
      await eliminaStrumenti(daEliminare);
      // Le voci aggiunte non sono ripristinabili: la loro immagine resterebbe orfana.
      const immagini = daEliminare.filter((s) => s.aggiunto && s.immagineFile);
      await Promise.all(immagini.map((s) => eliminaFileOriginale(s.immagineFile.fileId)));
    });
    if (eliminate) {
      setSpuntati(new Set());
      setSelezionato(null);
    }
  };

  return (
    <div className={`page${selezione.length > 0 ? ' strumenti-con-barra' : ''}`}>
      <div className="container">
        <h1>Strumenti di Misura</h1>
        <p>
          Una wiki degli strumenti di laboratorio più usati in fisica, con l'inventario dei materiali
          disponibili nelle scuole.
        </p>

        {isOwner && (
          <div className="strumenti-gestione">
            <button type="button" className="btn" onClick={() => setGestione({ tipo: 'nuovo' })}>
              Nuovo strumento
            </button>
            <button type="button" className="btn" onClick={() => setGestione({ tipo: 'importa' })}>
              Importa CSV
            </button>
          </div>
        )}

        <div className="schede-toolbar">
          <div className="filtro-field">
            <label htmlFor="strumento-scuola">Scuola</label>
            <select id="strumento-scuola" value={scuola} onChange={(e) => setScuola(e.target.value)}>
              <option value="">Tutte le scuole ({strumenti.length})</option>
              {scuole.map((nome) => (
                <option key={nome} value={nome}>
                  {nome} ({conteggioScuola.get(nome)})
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-field">
            <label htmlFor="strumento-branca">Branca</label>
            <select id="strumento-branca" value={branca} onChange={(e) => setBranca(e.target.value)}>
              <option value="">Tutte le branche ({strumentiScuola.length})</option>
              {BRANCHE_STRUMENTI.map((b) => (
                <option key={b} value={b}>
                  {b} ({conteggioBranca.get(b) || 0})
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-field">
            <label htmlFor="strumento-ricerca">Cerca</label>
            <input
              id="strumento-ricerca"
              type="text"
              placeholder="es. Calibro"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
          </div>
          <VistaToggle vista={vista} onCambia={setVista} etichetta="Vista degli strumenti" />
        </div>

        {filtrati.length === 0 && (
          <p className="empty-state">Nessuno strumento corrisponde alla ricerca.</p>
        )}

        {filtrati.length > 0 && vista === 'griglia' &&
          [...gruppi.entries()]
            .filter(([, elenco]) => elenco.length > 0)
            .map(([nomeBranca, elenco]) => (
              <section key={nomeBranca} className="strumenti-sezione">
                <h2>{nomeBranca}</h2>
                <div className="strumenti-grid">
                  {elenco.map((s) => (
                    <article
                      className={`etched-frame strumento-card${isOwner ? ' strumento-card-owner' : ''}${spuntati.has(s.id) ? ' strumento-spuntato' : ''}`}
                      key={s.id}
                      {...azioniVoce(s)}
                    >
                      {isOwner && (
                        <SelezioneNascosta
                          nome={s.nome}
                          selezionato={spuntati.has(s.id)}
                          onCambia={() => cambiaSpunta(s.id)}
                        />
                      )}
                      {spuntati.has(s.id) && <IconCheck className="strumento-spunta" size={20} stroke={2.5} />}
                      <h3>
                        {isOwner ? <NomeApribile nome={s.nome} onApri={() => setSelezionato(s)} /> : s.nome}
                      </h3>
                      {metaGrandezza(s) && <p className="strumento-meta">{metaGrandezza(s)}</p>}
                      {metaInventario(s) && <p className="strumento-meta">{metaInventario(s)}</p>}
                    </article>
                  ))}
                </div>
              </section>
            ))}

        {filtrati.length > 0 && vista === 'elenco' && (
          <div className="unita-table-wrap etched-frame">
            <table className="scheda-table unita-table strumenti-table">
              <colgroup>
                <col style={{ width: '34%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Strumento</th>
                  <th scope="col">Branca</th>
                  <th scope="col">Scuola</th>
                  <th scope="col">Quantità</th>
                  <th scope="col">Armadio</th>
                  <th scope="col">Sez.</th>
                  <th scope="col">N. inv.</th>
                </tr>
              </thead>
              <tbody>
                {ordinati.map((s) => (
                  <tr
                    className={`scheda-row unita-row${spuntati.has(s.id) ? ' strumento-spuntato' : ''}`}
                    key={s.id}
                    {...azioniVoce(s)}
                  >
                    <td className="col-titolo" data-label="Strumento">
                      {isOwner ? (
                        <span>
                          <SelezioneNascosta
                            nome={s.nome}
                            selezionato={spuntati.has(s.id)}
                            onCambia={() => cambiaSpunta(s.id)}
                          />
                          <NomeApribile nome={s.nome} onApri={() => setSelezionato(s)} />
                          {spuntati.has(s.id) && <IconCheck className="strumento-spunta-riga" size={16} stroke={2.5} />}
                        </span>
                      ) : (
                        s.nome
                      )}
                    </td>
                    <td data-label="Branca">{s.branca}</td>
                    <td data-label="Scuola">{s.scuola}</td>
                    <td data-label="Quantità">{s.quantita ?? '—'}</td>
                    <td data-label="Armadio">{s.armadio ?? '—'}</td>
                    <td data-label="Sezione">{s.sezione ?? '—'}</td>
                    <td data-label="N. inventario">{s.inventario ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <StrumentiBrancaChart strumenti={strumentiScuola} scuola={scuola} />

        <Modal
          open={Boolean(selezionato)}
          onClose={() => setSelezionato(null)}
          title={selezionato?.nome}
          className="strumento-modal"
        >
          {selezionato && (
            <>
              <div className="strumento-modal-layout">
                <div className="strumento-modal-immagine">
                  <StrumentoImmagine strumento={selezionato} />
                </div>
                <div className="strumento-modal-testo">
                  <p className="strumento-meta">
                    {selezionato.scuola} · {selezionato.branca}
                  </p>
                  {metaGrandezza(selezionato) && (
                    <p className="strumento-meta">{metaGrandezza(selezionato)}</p>
                  )}
                  {selezionato.sensibilita && (
                    <p className="strumento-sensibilita">Sensibilità: {selezionato.sensibilita}</p>
                  )}
                  {selezionato.portata && (
                    <p className="strumento-sensibilita">Portata: {selezionato.portata}</p>
                  )}
                  {selezionato.descrizione && (
                    <p className="strumento-descrizione">{selezionato.descrizione}</p>
                  )}
                  {isInventario(selezionato) && (
                    <div className="strumento-modal-inventario">
                      <p className="strumento-descrizione">Quantità: {selezionato.quantita ?? 'non indicata'}</p>
                      <p className="strumento-descrizione">{collocazione(selezionato)}</p>
                      <p className="strumento-descrizione">
                        N. inventario: {selezionato.inventario ?? 'non indicato'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <EsperimentiStrumento key={selezionato.id} strumento={selezionato} schede={schede} />
              {isOwner && (
                <div className="strumenti-form-azioni">
                  <IconaPulsante etichetta="Elimina" disabled={inCorso} onClick={() => elimina([selezionato])}>
                    <IconTrash size={20} stroke={1.75} />
                  </IconaPulsante>
                  <IconaPulsante
                    etichetta="Modifica"
                    className="primary"
                    onClick={() => {
                      setGestione({ tipo: 'modifica', strumento: selezionato });
                      setSelezionato(null);
                    }}
                  >
                    <IconPencil size={20} stroke={1.75} />
                  </IconaPulsante>
                </div>
              )}
            </>
          )}
        </Modal>

        <Modal
          open={gestione?.tipo === 'nuovo' || gestione?.tipo === 'modifica'}
          onClose={() => setGestione(null)}
          title={gestione?.strumento ? 'Modifica strumento' : 'Nuovo strumento'}
          className="strumento-modal"
        >
          <StrumentoForm
            key={gestione?.strumento?.id}
            strumento={gestione?.strumento}
            scuole={scuole}
            schede={schede}
            scuolaIniziale={scuola}
            inCorso={inCorso}
            onSalva={salvaForm}
            onAnnulla={() => setGestione(null)}
          />
        </Modal>

        <Modal
          open={gestione?.tipo === 'gruppo'}
          onClose={() => setGestione(null)}
          title="Modifica di gruppo"
          className="strumento-modal"
        >
          <ModificaGruppoForm
            numero={selezione.length}
            scuole={scuole}
            inCorso={inCorso}
            onSalva={salvaGruppo}
            onAnnulla={() => setGestione(null)}
          />
        </Modal>

        <Modal
          open={gestione?.tipo === 'importa'}
          onClose={() => setGestione(null)}
          title="Importa strumenti da CSV"
          className="strumento-modal"
        >
          <ImportaStrumentiCsv
            strumenti={strumenti}
            scuole={scuole}
            inCorso={inCorso}
            onImporta={(voci) => esegui(() => aggiungiStrumenti(voci))}
            onAnnulla={() => setGestione(null)}
          />
        </Modal>

        {isOwner && selezione.length > 0 && (
          <div className="strumenti-barra" role="toolbar" aria-label="Azioni sugli strumenti selezionati">
            <span className="strumenti-barra-conteggio">
              {selezione.length} di {filtrati.length}
            </span>
            <IconaPulsante
              etichetta={tuttiSelezionati ? 'Deseleziona tutti' : `Seleziona tutti (${filtrati.length})`}
              aria-pressed={tuttiSelezionati}
              onClick={() => setSpuntati(new Set(tuttiSelezionati ? [] : filtrati.map((s) => s.id)))}
            >
              <IconSelectAll size={20} stroke={1.75} />
            </IconaPulsante>
            <IconaPulsante etichetta="Modifica i selezionati" onClick={() => setGestione({ tipo: 'gruppo' })}>
              <IconPencil size={20} stroke={1.75} />
            </IconaPulsante>
            <IconaPulsante
              etichetta="Elimina i selezionati"
              className="primary"
              disabled={inCorso}
              onClick={() => elimina(selezione)}
            >
              <IconTrash size={20} stroke={1.75} />
            </IconaPulsante>
          </div>
        )}
      </div>
    </div>
  );
}
