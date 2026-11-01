import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPencil } from '@tabler/icons-react';
import { scaricaDocx, scaricaPdf, apriInOverleaf } from '../utils/exportScheda';
import { scaricaFileOriginale } from '../services/fileOriginaleService';

function etichettaModello(modello) {
  if (!modello) return '—';
  const nome = modello.toLowerCase();
  if (nome.includes('importat')) return 'Modello importato';
  if (nome.includes('classico')) return 'Modello Classico';
  if (nome.includes('compatto')) return 'Modello Compatto';
  if (nome.includes('artistico')) return 'Modello Artistico';
  return modello;
}

export default function SchedaRow({ scheda, templateContenuto, isOwner, onDelete, evidenziata }) {
  const { titolo, modello, durataMinuti, numeroEsperienze, difficolta } = scheda;
  const fileOriginali = scheda.fileOriginali || (scheda.fileOriginale ? [scheda.fileOriginale] : []);
  const [azioneInCorso, setAzioneInCorso] = useState('');
  const riga = useRef(null);

  useEffect(() => {
    if (evidenziata) riga.current.scrollIntoView({ block: 'center' });
  }, [evidenziata]);

  const eseguiAzione = async (nome, azione) => {
    setAzioneInCorso(nome);
    try {
      await azione();
    } catch (err) {
      window.alert(err.message || 'Operazione non riuscita.');
      console.warn(err);
    } finally {
      setAzioneInCorso('');
    }
  };

  return (
    <tr ref={riga} className={`scheda-row${evidenziata ? ' scheda-evidenziata' : ''}`}>
      <td className="col-titolo">{titolo}</td>
      <td className="col-modello">{etichettaModello(modello)}</td>
      <td className="col-numero-esperienze">
        {numeroEsperienze} {numeroEsperienze === 1 ? 'esperienza' : 'esperienze'}
      </td>
      <td className="col-durata">{durataMinuti} min</td>
      <td className="col-difficolta">
        <span className={`difficolta difficolta-${(difficolta || '').toLowerCase()}`}>
          {difficolta || '—'}
        </span>
      </td>
      <td className="scheda-azioni">
        {fileOriginali.length > 0 ? (
          fileOriginali.map((f) => (
            <button
              key={f.fileId}
              type="button"
              className="scheda-export"
              disabled={azioneInCorso !== ''}
              onClick={() => eseguiAzione(f.fileId, () => scaricaFileOriginale(f))}
            >
              {azioneInCorso === f.fileId ? '…' : f.estensione.toUpperCase()}
            </button>
          ))
        ) : (
          <>
            <button type="button" className="scheda-export" onClick={() => scaricaDocx(scheda)}>
              DOCX
            </button>
            <button type="button" className="scheda-export" onClick={() => scaricaPdf(scheda)}>
              PDF
            </button>
            <button
              type="button"
              className="scheda-export"
              onClick={() => apriInOverleaf(scheda, templateContenuto)}
            >
              LaTeX
            </button>
          </>
        )}
        {isOwner && (
          <Link
            to={`/modifica-scheda/${scheda.id}`}
            className="scheda-delete"
            title="Modifica scheda"
            aria-label="Modifica scheda"
          >
            <IconPencil size={16} stroke={2} />
          </Link>
        )}
        {onDelete && (
          <button
            type="button"
            className="scheda-delete"
            title="Elimina scheda"
            aria-label="Elimina scheda"
            onClick={() => onDelete(scheda.id)}
          >
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}
