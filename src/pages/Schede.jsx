import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSchede, deleteScheda } from '../services/schedeService';
import { getTemplates } from '../services/templatesService';
import { eliminaFileOriginale } from '../services/fileOriginaleService';
import { BRANCHE } from '../data/branche';
import { TEMPLATES_PREDEFINITI } from '../data/templatesSeed';
import { useAuth } from '../context/AuthContext';
import FiltriBar from '../components/FiltriBar';
import SchedaRow from '../components/SchedaRow';
import DistribuzioneChart from '../components/DistribuzioneChart';

const FILTRI_INIZIALI = { branca: '', grandezza: '', strumento: '', durata: 'tutte' };

function rientraNellaDurata(durataMinuti, bucket) {
  switch (bucket) {
    case 'lt30':
      return durataMinuti < 30;
    case '30-60':
      return durataMinuti >= 30 && durataMinuti <= 60;
    case '60-90':
      return durataMinuti > 60 && durataMinuti <= 90;
    case 'gt90':
      return durataMinuti > 90;
    default:
      return true;
  }
}

function raggruppaPerBranca(schede) {
  const perBranca = new Map();
  for (const branca of BRANCHE) perBranca.set(branca, []);

  for (const s of schede) {
    if (!perBranca.has(s.branca)) perBranca.set(s.branca, []);
    perBranca.get(s.branca).push(s);
  }

  return perBranca;
}

export default function Schede() {
  const { isOwner } = useAuth();
  const [parametri] = useSearchParams();
  const evidenzia = parametri.get('evidenzia');
  const [schede, setSchede] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtri, setFiltri] = useState(FILTRI_INIZIALI);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    let attivo = true;
    getSchede().then((dati) => {
      if (attivo) {
        setSchede(dati);
        setLoading(false);
      }
    });
    getTemplates().then((dati) => {
      if (attivo) setTemplates(dati);
    });
    return () => {
      attivo = false;
    };
  }, []);

  // Contenuto del template LaTeX associato a una scheda: se non ne ha uno
  // (es. creata importando un file esistente), si usa il Classico come
  // ripiego, così il pulsante "LaTeX" funziona comunque.
  const contenutoTemplatePer = (scheda) => {
    const trovato = templates.find((t) => t.id === scheda.templateId);
    if (trovato) return trovato.contenuto;
    return TEMPLATES_PREDEFINITI.find((t) => t.nome === 'Classico')?.contenuto || '';
  };

  const schedeFiltrate = useMemo(() => {
    return schede.filter((s) => {
      if (filtri.branca && s.branca !== filtri.branca) return false;
      if (filtri.grandezza && !(s.grandezze || []).includes(filtri.grandezza)) return false;
      if (filtri.strumento && !(s.strumenti || []).includes(filtri.strumento)) return false;
      if (!rientraNellaDurata(s.durataMinuti, filtri.durata)) return false;
      return true;
    });
  }, [schede, filtri]);

  const gruppi = useMemo(() => raggruppaPerBranca(schedeFiltrate), [schedeFiltrate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questa scheda? L\'operazione non è reversibile.')) return;
    const scheda = schede.find((s) => s.id === id);
    try {
      await deleteScheda(id);
      const fileDaRimuovere = scheda?.fileOriginali || (scheda?.fileOriginale ? [scheda.fileOriginale] : []);
      fileDaRimuovere.forEach((f) => f.fileId && eliminaFileOriginale(f.fileId));
      setSchede((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      window.alert('Eliminazione non riuscita: devi essere autenticato come proprietario.');
      console.warn(err);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1>Schede di Laboratorio</h1>
        <p>Consulta l'archivio delle schede, suddivise per branca della fisica.</p>

        <div className="schede-toolbar">
          <FiltriBar filtri={filtri} onChange={setFiltri} />
          {isOwner && (
            <Link to="/crea-scheda" className="btn primary schede-toolbar-crea">
              + Crea Scheda
            </Link>
          )}
        </div>

        {loading ? (
          <p>Caricamento delle schede…</p>
        ) : schedeFiltrate.length === 0 ? (
          <p className="empty-state">Nessuna scheda corrisponde ai filtri selezionati.</p>
        ) : (
          <table className="scheda-table">
            <colgroup>
              <col style={{ width: '26%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '26%' }} />
            </colgroup>
            {[...gruppi.entries()]
              .filter(([, schedeBranca]) => schedeBranca.length > 0)
              .map(([branca, schedeBranca]) => (
                <tbody key={branca}>
                  <tr className="riga-branca">
                    <th colSpan={6}>{branca}</th>
                  </tr>
                  {schedeBranca.map((s) => (
                    <SchedaRow
                      key={s.id}
                      scheda={s}
                      templateContenuto={contenutoTemplatePer(s)}
                      isOwner={isOwner}
                      onDelete={isOwner ? handleDelete : undefined}
                      evidenziata={s.id === evidenzia}
                    />
                  ))}
                </tbody>
              ))}
          </table>
        )}

        <DistribuzioneChart schede={schede} />
      </div>
    </div>
  );
}
