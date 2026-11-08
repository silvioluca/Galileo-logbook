import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPencil } from '@tabler/icons-react';
import { apriInOverleaf } from '../utils/apriInOverleaf';
import { scaricaFileOriginale } from '../services/fileOriginaleService';

// Le librerie DOCX/PDF si scaricano solo al primo clic su un'esportazione.
async function esporta(formato, scheda) {
  const { scaricaDocx, scaricaPdf } = await import('../utils/exportScheda');
  return formato === 'docx' ? scaricaDocx(scheda) : scaricaPdf(scheda);
}

export default function SchedaRow({ scheda, templateContenuto, isOwner, onDelete, evidenziata }) {
  const { titolo, autore, durataMinuti, numeroEsperienze, difficolta } = scheda;
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
      <td className="col-autore">{autore || '—'}</td>
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
            {['docx', 'pdf'].map((formato) => (
              <button
                key={formato}
                type="button"
                className="scheda-export"
                disabled={azioneInCorso !== ''}
                onClick={() => eseguiAzione(formato, () => esporta(formato, scheda))}
              >
                {azioneInCorso === formato ? '…' : formato.toUpperCase()}
              </button>
            ))}
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
