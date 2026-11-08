import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IconFileText, IconTrash, IconUpload } from '@tabler/icons-react';
import { BRANCHE } from '../data/branche';
import { DIFFICOLTA } from '../data/difficolta';
import { addScheda, aggiornaScheda, getSchedaById, aggiungiFileOriginale, rimuoviFileOriginale } from '../services/schedeService';
import { parseSchedaTesto } from '../utils/parseSchedaFile';
import { estraiTestoDaFile, estensioneSupportata, ESTENSIONI_SUPPORTATE } from '../utils/extractText';
import { caricaFileOriginale, eliminaFileOriginale } from '../services/fileOriginaleService';
import { useAuth } from '../context/AuthContext';
import ChipInput from '../components/ChipInput';
import FileOriginalePreview from '../components/FileOriginalePreview';
import IconaPulsante from '../components/IconaPulsante';

const FORM_INIZIALE = {
  titolo: '',
  autore: null,
  branca: BRANCHE[0],
  scopo: '',
  strumenti: [],
  grandezze: [],
  durataMinuti: 60,
  numeroEsperienze: 1,
  difficolta: DIFFICOLTA[0],
};

// Le schede si creano solo importando i file: ogni formato resta scaricabile
// così com'è. Le schede nate da un template conservano le esportazioni
// generate finché non ricevono un file.
export default function CreaScheda() {
  const { id } = useParams();
  const modoModifica = Boolean(id);
  const { user, isOwner, loading: authLoading, signIn } = useAuth();
  const [form, setForm] = useState(FORM_INIZIALE);
  const [caricamentoIniziale, setCaricamentoIniziale] = useState(modoModifica);
  const [nonTrovata, setNonTrovata] = useState(false);
  const [salvataggio, setSalvataggio] = useState(false);
  const [erroreSalvataggio, setErroreSalvataggio] = useState('');
  const [importoNotice, setImportoNotice] = useState('');
  const [fileOriginali, setFileOriginali] = useState([]);
  // File scelti in questa sessione, per l'anteprima senza riscaricarli.
  const [fileLocali, setFileLocali] = useState({});
  const [anteprimaId, setAnteprimaId] = useState(null);
  const [caricamentoFile, setCaricamentoFile] = useState(false);
  const [trascinamento, setTrascinamento] = useState(false);
  const navigate = useNavigate();
  // Finché non si scrive nel campo, una scheda nuova ha come autore l'account.
  const autore = form.autore ?? (modoModifica ? '' : user?.displayName || '');

  // In modalità modifica, carica la scheda esistente e precompila il form.
  useEffect(() => {
    if (!modoModifica) return;
    let attivo = true;
    getSchedaById(id).then((s) => {
      if (!attivo) return;
      if (!s) {
        setNonTrovata(true);
        setCaricamentoIniziale(false);
        return;
      }
      setForm({
        titolo: s.titolo || '',
        autore: s.autore || '',
        branca: s.branca || BRANCHE[0],
        scopo: s.scopo || '',
        strumenti: s.strumenti || [],
        grandezze: s.grandezze || [],
        durataMinuti: s.durataMinuti ?? 60,
        numeroEsperienze: s.numeroEsperienze ?? 1,
        difficolta: s.difficolta || DIFFICOLTA[0],
      });
      setFileOriginali(s.fileOriginali || (s.fileOriginale ? [s.fileOriginale] : []));
      setCaricamentoIniziale(false);
    });
    return () => {
      attivo = false;
    };
  }, [id, modoModifica]);

  const setCampo = (campo, valore) => setForm((f) => ({ ...f, [campo]: valore }));

  const formatiMancanti = ESTENSIONI_SUPPORTATE.filter((e) => !fileOriginali.some((f) => f.estensione === e));

  // Ogni formato si carica subito. Solo il primo file di una scheda nuova
  // precompila i campi; gli altri sono versioni dello stesso contenuto. In
  // modifica il file si aggiunge subito alla scheda.
  const aggiungiFile = async (file) => {
    if (!file) return;
    const estensione = file.name.split('.').pop()?.toLowerCase();
    if (!estensioneSupportata(estensione)) {
      setImportoNotice(`Formato ".${estensione}" non supportato: usa ${ESTENSIONI_SUPPORTATE.map((e) => `.${e}`).join(', ')}.`);
      return;
    }
    if (!formatiMancanti.includes(estensione)) {
      setImportoNotice(`C'è già un file .${estensione}: eliminalo prima di caricarne un altro.`);
      return;
    }

    const precompila = !modoModifica && fileOriginali.length === 0;
    setCaricamentoFile(true);
    setImportoNotice(`Caricamento di "${file.name}"…`);
    try {
      const [caricato, testo] = await Promise.all([
        caricaFileOriginale(file),
        precompila ? estraiTestoDaFile(file) : null,
      ]);
      if (modoModifica) await aggiungiFileOriginale(id, caricato);
      if (precompila) {
        const estratti = parseSchedaTesto(testo);
        setForm((f) => ({
          ...f,
          titolo: estratti.titolo || f.titolo,
          scopo: estratti.scopo || f.scopo,
          strumenti: estratti.materiale.length > 0 ? estratti.materiale : f.strumenti,
        }));
      }
      setFileOriginali((prev) => [...prev, caricato]);
      setFileLocali((prev) => ({ ...prev, [caricato.fileId]: file }));
      setAnteprimaId(caricato.fileId);
      setImportoNotice(precompila ? 'Campi precompilati dal file: verificali e correggili se serve.' : '');
    } catch (err) {
      setImportoNotice(err.message || `Non è stato possibile caricare "${file.name}".`);
      console.warn(err);
    } finally {
      setCaricamentoFile(false);
    }
  };

  const handleSceltaFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    aggiungiFile(file);
  };

  const handleRilascio = (e) => {
    e.preventDefault();
    setTrascinamento(false);
    if (!caricamentoFile) aggiungiFile(e.dataTransfer.files?.[0]);
  };

  const handleRimuoviFormato = async (file) => {
    if (!window.confirm(`Eliminare il file "${file.nomeFile}"? L'operazione non è reversibile.`)) return;
    try {
      if (modoModifica) await rimuoviFileOriginale(id, file);
      eliminaFileOriginale(file.fileId);
      setFileOriginali((prev) => prev.filter((f) => f.fileId !== file.fileId));
    } catch (err) {
      window.alert(err.message || 'Eliminazione non riuscita: devi essere autenticato come proprietario.');
      console.warn(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modoModifica && fileOriginali.length === 0) {
      setErroreSalvataggio('Carica almeno un file della scheda prima di salvarla.');
      return;
    }
    setSalvataggio(true);
    setErroreSalvataggio('');

    const scheda = {
      ...form,
      autore: autore.trim(),
      durataMinuti: Number(form.durataMinuti),
      numeroEsperienze: Number(form.numeroEsperienze),
      // Una scheda da template senza file tiene modello e template.
      ...(fileOriginali.length > 0 && { modello: 'Modello importato', templateId: null }),
    };

    try {
      if (modoModifica) {
        await aggiornaScheda(id, scheda);
      } else {
        await addScheda({ ...scheda, fileOriginali });
      }
      navigate('/schede');
    } catch (err) {
      setErroreSalvataggio('Salvataggio non riuscito: devi essere autenticato come proprietario.');
      console.warn(err);
    } finally {
      setSalvataggio(false);
    }
  };

  const fileInAnteprima = fileOriginali.find((f) => f.fileId === anteprimaId) || fileOriginali[0];

  if (authLoading || caricamentoIniziale) {
    return (
      <div className="page">
        <div className="container">
          <p>Verifica accesso…</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="page">
        <div className="container">
          <h1>{modoModifica ? 'Modifica Scheda' : 'Crea Scheda'}</h1>
          <div className="etched-frame accesso-negato">
            <p>Solo il proprietario del catalogo può creare o modificare schede.</p>
            <button type="button" className="btn primary" onClick={signIn}>
              Accedi con Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (nonTrovata) {
    return (
      <div className="page">
        <div className="container">
          <h1>Scheda non trovata</h1>
          <p>
            La scheda che vuoi modificare non esiste o è stata eliminata. <Link to="/schede">Torna alle schede</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1>{modoModifica ? 'Modifica Scheda' : 'Crea Scheda'}</h1>
        <p>
          {modoModifica
            ? 'Aggiorna i dettagli della scheda e i formati scaricabili.'
            : 'Carica il file della scheda: titolo, scopo e materiale si precompilano. Puoi aggiungere gli altri formati dello stesso file.'}
        </p>

        <div className="crea-scheda-layout">
          <form className="form-card etched-frame" onSubmit={handleSubmit}>
            <div className="importa-scheda">
              <label>File della scheda</label>
              {fileOriginali.length > 0 && (
                <ul className="lista-file">
                  {fileOriginali.map((f) => (
                    <li key={f.fileId} className={f.fileId === fileInAnteprima?.fileId ? 'attivo' : undefined}>
                      <button
                        type="button"
                        className="file-nome"
                        title="Mostra nell'anteprima"
                        onClick={() => setAnteprimaId(f.fileId)}
                      >
                        <IconFileText size={18} stroke={1.75} aria-hidden="true" />
                        <span>{f.nomeFile}</span>
                      </button>
                      <span className={`pill-formato pill-${f.estensione}`}>{f.estensione.toUpperCase()}</span>
                      <IconaPulsante etichetta={`Elimina ${f.nomeFile}`} onClick={() => handleRimuoviFormato(f)}>
                        <IconTrash size={16} stroke={2} />
                      </IconaPulsante>
                    </li>
                  ))}
                </ul>
              )}
              {formatiMancanti.length > 0 && (
                <label
                  className={`importa-dropzone${trascinamento ? ' attiva' : ''}${caricamentoFile ? ' occupata' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setTrascinamento(true);
                  }}
                  onDragLeave={() => setTrascinamento(false)}
                  onDrop={handleRilascio}
                >
                  <IconUpload size={22} stroke={1.75} aria-hidden="true" />
                  <strong>
                    {caricamentoFile
                      ? 'Caricamento…'
                      : fileOriginali.length === 0
                        ? 'Scegli il file della scheda'
                        : 'Aggiungi un altro formato'}
                  </strong>
                  <span>Clicca o trascina qui un file {formatiMancanti.map((e) => `.${e}`).join(', ')}</span>
                  <input
                    type="file"
                    accept={formatiMancanti.map((e) => `.${e}`).join(',')}
                    onChange={handleSceltaFile}
                    disabled={caricamentoFile}
                    hidden
                  />
                </label>
              )}
              {modoModifica && fileOriginali.length === 0 && (
                <p className="form-notice">
                  Nessun file caricato: verranno offerti i formati generati automaticamente (DOCX/PDF/LaTeX).
                </p>
              )}
              {importoNotice && <p className="form-notice">{importoNotice}</p>}
            </div>

            <div className="ornament-divider">✦</div>

            <div className="form-grid">
              <div className="full">
                <label htmlFor="titolo">Titolo della scheda</label>
                <input
                  id="titolo"
                  required
                  value={form.titolo}
                  onChange={(e) => setCampo('titolo', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="autore">Autore</label>
                <input
                  id="autore"
                  placeholder="es. Mario Rossi"
                  value={autore}
                  onChange={(e) => setCampo('autore', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="branca">Branca della fisica</label>
                <select id="branca" value={form.branca} onChange={(e) => setCampo('branca', e.target.value)}>
                  {BRANCHE.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficolta">Difficoltà</label>
                <select
                  id="difficolta"
                  value={form.difficolta}
                  onChange={(e) => setCampo('difficolta', e.target.value)}
                >
                  {DIFFICOLTA.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="durata">Durata (minuti)</label>
                <input
                  id="durata"
                  type="number"
                  min="0"
                  value={form.durataMinuti}
                  onChange={(e) => setCampo('durataMinuti', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="numero-esperienze">Numero di esperienze nella scheda</label>
                <input
                  id="numero-esperienze"
                  type="number"
                  min="1"
                  value={form.numeroEsperienze}
                  onChange={(e) => setCampo('numeroEsperienze', e.target.value)}
                />
              </div>

              <div className="full">
                <label htmlFor="scopo">Scopo dell'esperienza</label>
                <textarea
                  id="scopo"
                  rows={2}
                  value={form.scopo}
                  onChange={(e) => setCampo('scopo', e.target.value)}
                />
              </div>

              <div className="full">
                <ChipInput
                  id="materiale"
                  label="Materiale utilizzato (strumenti): scrivi e premi Invio"
                  placeholder="es. Cronometro"
                  values={form.strumenti}
                  onChange={(v) => setCampo('strumenti', v)}
                />
              </div>

              <div className="full">
                <ChipInput
                  id="grandezze"
                  label="Grandezze fisiche misurate: scrivi e premi Invio"
                  placeholder="es. Tempo"
                  values={form.grandezze}
                  onChange={(v) => setCampo('grandezze', v)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn primary" type="submit" disabled={salvataggio || caricamentoFile}>
                {salvataggio ? 'Salvataggio…' : modoModifica ? 'Salva modifiche' : 'Salva scheda'}
              </button>
            </div>
            {erroreSalvataggio && <p className="form-notice form-error">{erroreSalvataggio}</p>}
          </form>

          <aside className="crea-scheda-preview">
            <div className="anteprima-intestazione">
              <h2>Anteprima</h2>
              {fileOriginali.length > 1 && (
                <div className="anteprima-formati" role="group" aria-label="Formato in anteprima">
                  {fileOriginali.map((f) => (
                    <button
                      key={f.fileId}
                      type="button"
                      className={`pill-formato pill-${f.estensione}`}
                      aria-pressed={f.fileId === fileInAnteprima.fileId}
                      onClick={() => setAnteprimaId(f.fileId)}
                    >
                      {f.estensione.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {fileInAnteprima ? (
              <FileOriginalePreview
                key={fileInAnteprima.fileId}
                file={fileLocali[fileInAnteprima.fileId]}
                fileOriginale={fileLocali[fileInAnteprima.fileId] ? undefined : fileInAnteprima}
              />
            ) : (
              <p className="anteprima-vuota">L'anteprima del file comparirà qui dopo il caricamento.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
