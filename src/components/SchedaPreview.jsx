import { determinaSkin } from '../utils/templateSkin';

function ProcedimentoHtml({ html, className }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html || '' }} />;
}

export default function SchedaPreview({ scheda }) {
  const {
    titolo,
    branca,
    autore,
    modello,
    scopo,
    strumenti = [],
    durataMinuti,
    numeroEsperienze,
    difficolta,
    procedimento,
  } = scheda;

  const skin = determinaSkin(modello);
  const titoloVisibile = titolo || 'Titolo della scheda';
  const unisci = (...parti) => parti.filter(Boolean).join(' · ');
  const meta = unisci(branca, autore, `${durataMinuti} min`, `${numeroEsperienze} esperienze`, difficolta);

  if (skin === 'compatto') {
    return (
      <div className="scheda-preview-page skin-compatto">
        <div className="preview-riga-titolo">
          <h3>{titoloVisibile}</h3>
          <span className="preview-difficolta">{difficolta}</span>
        </div>
        <p className="preview-meta-piccola">
          {unisci(branca, autore, modello, `${durataMinuti} min`, `${numeroEsperienze} esperienze`)}
        </p>
        <hr />
        <p>
          <strong>Scopo. </strong>
          {scopo}
        </p>
        <p>
          <strong>Materiale. </strong>
          {strumenti.join(', ')}
        </p>
        <p>
          <strong>Procedimento.</strong>
        </p>
        <ProcedimentoHtml html={procedimento} className="procedimento-html" />
      </div>
    );
  }

  if (skin === 'artistico') {
    return (
      <div className="scheda-preview-page skin-artistico">
        <div className="preview-header-artistico">
          <h2>{titoloVisibile}</h2>
          <div className="preview-rule" />
          <p className="preview-meta-artistico">
            {unisci(branca, autore, modello)}
          </p>
          <p className="preview-meta-artistico">
            {durataMinuti} min · {numeroEsperienze} esperienze · Difficoltà: {difficolta}
          </p>
        </div>

        <h4>Scopo dell'esperienza</h4>
        <p className="preview-scopo-artistico">{scopo}</p>

        <div className="preview-ornamento">✦</div>

        <h4>Materiale utilizzato</h4>
        <ul>
          {strumenti.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <div className="preview-ornamento">✦</div>

        <h4>Procedimento</h4>
        <ProcedimentoHtml html={procedimento} className="procedimento-html" />
      </div>
    );
  }

  return (
    <div className="scheda-preview-page skin-classico">
      <h3>{titoloVisibile}</h3>
      <p className="preview-meta-classico">{meta}</p>

      <p className="preview-label">Scopo dell'esperienza</p>
      <p>{scopo}</p>

      <p className="preview-label">Materiale utilizzato</p>
      <ul>
        {strumenti.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <p className="preview-label">Procedimento</p>
      <ProcedimentoHtml html={procedimento} className="procedimento-html" />
    </div>
  );
}
