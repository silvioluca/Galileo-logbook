import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { esperimentiConSchede } from '../utils/esperimentiConSchede';

const PER_PAGINA = 5;

export default function EsperimentiStrumento({ strumento, schede }) {
  const [visibili, setVisibili] = useState(PER_PAGINA);
  const voci = useMemo(() => esperimentiConSchede(strumento, schede), [strumento, schede]);
  const restanti = voci.length - visibili;

  return (
    <section className="strumento-esperimenti">
      <h3>Esperimenti{voci.length > 0 && ` (${voci.length})`}</h3>
      {voci.length === 0 ? (
        <p className="strumento-meta">Nessun esperimento indicato per questo strumento.</p>
      ) : (
        <ul>
          {voci.slice(0, visibili).map((v) => (
            <li key={v.nome}>
              <span>{v.nome}</span>
              {v.schede.map((s) => (
                <Link key={s.id} className="strumento-esperimento-scheda" to={`/schede?evidenzia=${s.id}`}>
                  {s.modello ? `Scheda: ${s.modello}` : 'Scheda'}
                </Link>
              ))}
            </li>
          ))}
        </ul>
      )}
      {restanti > 0 && (
        <button
          type="button"
          className="strumenti-link"
          onClick={() => setVisibili(visibili + PER_PAGINA)}
        >
          Carica altri ({restanti})
        </button>
      )}
    </section>
  );
}
