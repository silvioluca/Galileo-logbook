import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BRANCHE } from '../data/branche';
import { DIFFICOLTA } from '../data/difficolta';
import { TEMPLATES_PREDEFINITI } from '../data/templatesSeed';
import { addScheda, aggiornaScheda, getSchedaById, aggiungiFileOriginale, rimuoviFileOriginale } from '../services/schedeService';
import { getTemplates, addTemplate, setTemplateById, deleteTemplate } from '../services/templatesService';
import { parseSchedaTesto } from '../utils/parseSchedaFile';
import { estraiTestoDaFile, estensioneSupportata } from '../utils/extractText';
import { caricaFileOriginale, eliminaFileOriginale } from '../services/fileOriginaleService';
import { useAuth } from '../context/AuthContext';
import ChipInput from '../components/ChipInput';
import SchedaPreview from '../components/SchedaPreview';
import FileOriginalePreview from '../components/FileOriginalePreview';
import Modal from '../components/Modal';
import RichTextEditor from '../components/RichTextEditor';
import { testoAHtml } from '../utils/testoAHtml';

const NUOVO_TEMPLATE = '__nuovo_template__';

const FORM_INIZIALE = {
  titolo: '',
  branca: BRANCHE[0],
  esperienza: '',
  scopo: '',
  procedimento: '',
  strumenti: [],
  grandezze: [],
  durataMinuti: 60,
  numeroEsperienze: 1,
  difficolta: DIFFICOLTA[0],
};

export default function CreaScheda() {
  const { id } = useParams();
  const modoModifica = Boolean(id);
  const { isOwner, loading: authLoading, signIn } = useAuth();
  const [form, setForm] = useState(FORM_INIZIALE);
  const [caricamentoIniziale, setCaricamentoIniziale] = useState(modoModifica);
  const [salvataggio, setSalvataggio] = useState(false);
  const [erroreSalvataggio, setErroreSalvataggio] = useState('');
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [origine, setOrigine] = useState('template'); // 'template' | 'importa'
  const [importoNotice, setImportoNotice] = useState('');
  const [modaleTemplateAperta, setModaleTemplateAperta] = useState(false);
  const [modaleImportaAperta, setModaleImportaAperta] = useState(false);
  const [fileOriginale, setFileOriginale] = useState(null);
  const [fileOriginaleRaw, setFileOriginaleRaw] = useState(null);
  const [fileOriginali, setFileOriginali] = useState([]);
  const navigate = useNavigate();

  // In modalità modifica, carica la scheda esistente e precompila il form.
  useEffect(() => {
    if (!modoModifica) return;
    let attivo = true;
    getSchedaById(id).then((s) => {
      if (!attivo) return;
      if (!s) {
        setCaricamentoIniziale(false);
        return;
      }
      setForm({
        titolo: s.titolo || '',
        branca: s.branca || BRANCHE[0],
        esperienza: s.esperienza || '',
        scopo: s.scopo || '',
        procedimento: s.procedimento || '',
        strumenti: s.strumenti || [],
        grandezze: s.grandezze || [],
        durataMinuti: s.durataMinuti ?? 60,
        numeroEsperienze: s.numeroEsperienze ?? 1,
        difficolta: s.difficolta || DIFFICOLTA[0],
      });
      setTemplateId(s.templateId || '');
      setOrigine(s.templateId ? 'template' : 'importa');
      setFileOriginali(s.fileOriginali || (s.fileOriginale ? [s.fileOriginale] : []));
      setCaricamentoIniziale(false);
    });
    return () => {
      attivo = false;
    };
  }, [id, modoModifica]);

  useEffect(() => {
    getTemplates().then(async (esistenti) => {
      if (!isOwner) {
        setTemplates(esistenti);
        return;
      }

      let elenco = esistenti;

      // Ripulisce eventuali doppioni dei template predefiniti (residuo di un
      // vecchio bug di seeding che poteva crearne più copie con id casuali):
      // per ogni nome duplicato tiene quello con id fisso "predefinito-*" se
      // presente, altrimenti il primo, ed elimina gli altri.
      const perNome = new Map();
      for (const t of esistenti) {
        if (!perNome.has(t.nome)) perNome.set(t.nome, []);
        perNome.get(t.nome).push(t);
      }
      const daEliminare = [];
      const senzaDoppioni = [];
      for (const gruppo of perNome.values()) {
        if (gruppo.length <= 1) {
          senzaDoppioni.push(...gruppo);
          continue;
        }
        const preferito = gruppo.find((t) => t.id.startsWith('predefinito-')) || gruppo[0];
        senzaDoppioni.push(preferito);
        daEliminare.push(...gruppo.filter((t) => t.id !== preferito.id));
      }

      if (daEliminare.length > 0) {
        try {
          await Promise.all(daEliminare.map((t) => deleteTemplate(t.id)));
          elenco = senzaDoppioni;
        } catch (err) {
          console.warn('Impossibile eliminare i template duplicati.', err);
        }
      }

      // Semina i template predefiniti mancanti. Usa id fissi (setTemplateById)
      // così ricaricare la pagina non crea doppioni.
      const nomiPresenti = new Set(elenco.map((t) => t.nome));
      const mancanti = TEMPLATES_PREDEFINITI.filter((t) => !nomiPresenti.has(t.nome));
      if (mancanti.length > 0) {
        try {
          const seminati = [];
          for (const { id, ...t } of mancanti) {
            seminati.push(await setTemplateById(id, t));
          }
          elenco = [...elenco, ...seminati];
        } catch (err) {
          console.warn('Impossibile seminare i template predefiniti.', err);
        }
      }

      setTemplates(elenco);
    });
  }, [isOwner]);

  const setCampo = (campo, valore) => setForm((f) => ({ ...f, [campo]: valore }));

  const handleImportaScheda = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const estensione = file.name.split('.').pop()?.toLowerCase();
    if (!estensioneSupportata(estensione)) {
      setImportoNotice(
        `Formato ".${estensione}" non supportato (usa .tex, .txt, .pdf o .docx). Compila i campi manualmente.`,
      );
      return;
    }

    setImportoNotice('Lettura e caricamento del file in corso…');
    try {
      const [testo, caricato] = await Promise.all([estraiTestoDaFile(file), caricaFileOriginale(file)]);
      const estratti = parseSchedaTesto(testo);
      setForm((f) => ({
        ...f,
        titolo: estratti.titolo || f.titolo,
        scopo: estratti.scopo || f.scopo,
        procedimento: estratti.procedimento ? testoAHtml(estratti.procedimento) : f.procedimento,
        strumenti: estratti.materiale.length > 0 ? estratti.materiale : f.strumenti,
      }));
      setFileOriginale(caricato);
      setFileOriginaleRaw(file);
      setImportoNotice(
        `File "${file.name}" caricato e conservato così com'è (verrà offerto in download originale, non rigenerato). Campi precompilati automaticamente: verifica e correggi se necessario.`,
      );
      setModaleImportaAperta(false);
    } catch (err) {
      setImportoNotice(err.message || `Non è stato possibile leggere/caricare "${file.name}". Compila i campi manualmente.`);
      console.warn(err);
    }
  };

  const handleCaricaTemplate = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const estensione = file.name.split('.').pop()?.toLowerCase();
    if (estensione !== 'tex') {
      window.alert('Il template deve essere un file .tex');
      return;
    }

    const contenuto = await file.text();
    try {
      const nuovo = await addTemplate({ nome: file.name.replace(/\.tex$/i, ''), contenuto });
      setTemplates((t) => [nuovo, ...t]);
      setTemplateId(nuovo.id);
      setModaleTemplateAperta(false);
    } catch (err) {
      window.alert('Non è stato possibile salvare il template: devi essere autenticato come proprietario.');
      console.warn(err);
    }
  };

  const handleSelezionaTemplate = (e) => {
    if (e.target.value === NUOVO_TEMPLATE) {
      setModaleTemplateAperta(true);
      return;
    }
    setTemplateId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvataggio(true);
    setErroreSalvataggio('');

    const templateScelto = templates.find((t) => t.id === templateId);

    const scheda = {
      ...form,
      durataMinuti: Number(form.durataMinuti),
      numeroEsperienze: Number(form.numeroEsperienze),
      modello:
        origine === 'template'
          ? templateScelto
            ? `Modello ${templateScelto.nome}`
            : ''
          : 'Modello importato',
      templateId: origine === 'template' ? templateId || null : null,
    };

    if (!modoModifica) {
      scheda.fileOriginali = origine === 'importa' && fileOriginale ? [fileOriginale] : [];
    }

    try {
      if (modoModifica) {
        await aggiornaScheda(id, scheda);
      } else {
        await addScheda(scheda);
      }
      navigate('/schede');
    } catch (err) {
      setErroreSalvataggio('Salvataggio non riuscito: devi essere autenticato come proprietario.');
      console.warn(err);
    } finally {
      setSalvataggio(false);
    }
  };

  const handleAggiungiFormato = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const caricato = await caricaFileOriginale(file);
      await aggiungiFileOriginale(id, caricato);
      setFileOriginali((prev) => [...prev, caricato]);
    } catch (err) {
      window.alert(err.message || 'Caricamento non riuscito: devi essere autenticato come proprietario.');
      console.warn(err);
    }
  };

  const handleRimuoviFormato = async (file) => {
    if (!window.confirm(`Eliminare il file "${file.nomeFile}"? L'operazione non è reversibile.`)) return;
    try {
      await rimuoviFileOriginale(id, file);
      eliminaFileOriginale(file.fileId);
      setFileOriginali((prev) => prev.filter((f) => f.fileId !== file.fileId));
    } catch (err) {
      window.alert(err.message || 'Eliminazione non riuscita: devi essere autenticato come proprietario.');
      console.warn(err);
    }
  };

  const anteprimaScheda = {
    ...form,
    modello:
      origine === 'template'
        ? (() => {
            const t = templates.find((x) => x.id === templateId);
            return t ? `Modello ${t.nome}` : '';
          })()
        : fileOriginale || fileOriginali.length > 0
          ? 'Modello importato'
          : '',
  };

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

  return (
    <div className="page">
      <div className="container">
        <h1>{modoModifica ? 'Modifica Scheda' : 'Crea Scheda'}</h1>
        <p>
          {modoModifica
            ? "Aggiorna i dettagli dell'esperienza. Se la scheda è importata, i file scaricabili si gestiscono in fondo."
            : "Compila i dettagli dell'esperienza. Scegli in fondo se generarla da un template o importarla da un file esistente."}
        </p>

        <div className="crea-scheda-layout">
          <form className="form-card etched-frame" onSubmit={handleSubmit}>
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
                <label htmlFor="esperienza">Nome esperienza</label>
                <input
                  id="esperienza"
                  placeholder="es. Pendolo semplice"
                  required
                  value={form.esperienza}
                  onChange={(e) => setCampo('esperienza', e.target.value)}
                />
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

              <div className="full">
                <label htmlFor="procedimento">Procedimento</label>
                <RichTextEditor value={form.procedimento} onChange={(html) => setCampo('procedimento', html)} />
              </div>
            </div>

            {/* In modifica, una scheda già importata non ha bisogno di questi
                controlli: il suo contenuto reale si gestisce nella sezione
                "File scaricabili" in fondo, non riscegliendo un template o
                ri-importando. Per una scheda da template restano utili
                (si può cambiare template). In creazione servono sempre. */}
            {!(modoModifica && origine === 'importa') && (
              <>
                <div className="ornament-divider">✦</div>

                <div className="origine-scheda">
                  <div className="origine-toggle" role="radiogroup" aria-label="Origine della scheda">
                    <button
                      type="button"
                      className={`btn${origine === 'template' ? ' primary' : ''}`}
                      aria-pressed={origine === 'template'}
                      onClick={() => setOrigine('template')}
                    >
                      Usa un template
                    </button>
                    <button
                      type="button"
                      className={`btn${origine === 'importa' ? ' primary' : ''}`}
                      aria-pressed={origine === 'importa'}
                      onClick={() => {
                        setOrigine('importa');
                        setModaleImportaAperta(true);
                      }}
                    >
                      Importa scheda
                    </button>
                  </div>

                  {origine === 'template' ? (
                    <div className="template-row">
                      <select id="template" value={templateId} onChange={handleSelezionaTemplate}>
                        <option value="">Nessun template selezionato</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nome}
                          </option>
                        ))}
                        <option value={NUOVO_TEMPLATE}>+ Carica nuovo template…</option>
                      </select>
                    </div>
                  ) : (
                    importoNotice && (
                      <div className="import-row">
                        <p className="form-notice">{importoNotice}</p>
                      </div>
                    )
                  )}
                </div>
              </>
            )}

            <Modal
              open={modaleTemplateAperta}
              onClose={() => setModaleTemplateAperta(false)}
              title="Carica nuovo template"
            >
              <p>Seleziona un file .tex da aggiungere ai template disponibili.</p>
              <input type="file" accept=".tex" onChange={handleCaricaTemplate} />
            </Modal>

            <Modal
              open={modaleImportaAperta}
              onClose={() => setModaleImportaAperta(false)}
              title="Importa scheda"
            >
              <p>Seleziona un file .tex, .txt, .pdf o .docx: titolo, scopo, materiale e procedimento verranno precompilati automaticamente (estrazione automatica, da verificare).</p>
              <input type="file" accept=".tex,.txt,.pdf,.docx" onChange={handleImportaScheda} />
              {importoNotice && <p className="form-notice">{importoNotice}</p>}
            </Modal>

            {modoModifica && origine === 'importa' && (
              <>
                <div className="ornament-divider">✦</div>
                <div className="gestione-file">
                  <label>File scaricabili</label>
                  {fileOriginali.length === 0 ? (
                    <p className="form-notice">
                      Nessun file caricato: verranno offerti i formati generati automaticamente
                      (DOCX/PDF/LaTeX).
                    </p>
                  ) : (
                    <ul className="lista-file">
                      {fileOriginali.map((f) => (
                        <li key={f.fileId}>
                          <span>
                            {f.nomeFile} <span className="tag">.{f.estensione}</span>
                          </span>
                          <button
                            type="button"
                            className="scheda-delete"
                            title="Elimina questo file"
                            aria-label="Elimina questo file"
                            onClick={() => handleRimuoviFormato(f)}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <label htmlFor="aggiungi-formato" className="btn">
                    + Carica un formato
                  </label>
                  <input
                    id="aggiungi-formato"
                    type="file"
                    accept=".tex,.txt,.pdf,.docx"
                    onChange={handleAggiungiFormato}
                    hidden
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button className="btn primary" type="submit" disabled={salvataggio}>
                {salvataggio ? 'Salvataggio…' : modoModifica ? 'Salva modifiche' : 'Salva scheda'}
              </button>
            </div>
            {erroreSalvataggio && <p className="form-notice form-error">{erroreSalvataggio}</p>}
          </form>

          <aside className="crea-scheda-preview">
            <h2>Anteprima</h2>
            {origine === 'importa' && fileOriginaleRaw ? (
              <FileOriginalePreview file={fileOriginaleRaw} />
            ) : origine === 'importa' && fileOriginali[0] ? (
              <FileOriginalePreview fileOriginale={fileOriginali[0]} />
            ) : (
              <SchedaPreview scheda={anteprimaScheda} />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
