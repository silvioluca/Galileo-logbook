import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { BRANCHE_STRUMENTI } from '../data/branche';

// Il colore segue la branca, non la sua posizione: filtrando per scuola le
// fette restanti non cambiano tinta. L'ordine è quello validato per
// distinguere le fette vicine anche con daltonismo; oltre 7 tinte la torta non
// sarebbe leggibile, quindi le branche minori si sommano in "Altre" (la tabella
// le riporta comunque una per una).
const COLORI_BRANCA = {
  Meccanica: '#2f6f9f',
  Elettromagnetismo: '#b5532a',
  'Materiale generico': '#0b9070',
  Misura: '#c98a12',
  Ottica: '#a8527f',
  Termologia: '#5c7a1f',
  Fluidodinamica: '#5a4fa3',
};
const COLORE_ALTRE = '#8a7d6b';
const COLORE_SFONDO = '#ece1c8';

const conColore = Object.keys(COLORI_BRANCA);
const ORDINE = [...conColore, ...BRANCHE_STRUMENTI.filter((b) => !conColore.includes(b))];

export default function StrumentiBrancaChart({ strumenti, scuola }) {
  const totale = strumenti.length;
  if (totale === 0) return null;

  const percentuale = (valore) => `${((valore / totale) * 100).toFixed(1).replace('.', ',')}%`;

  const righe = ORDINE.map((branca) => ({
    branca,
    numero: strumenti.filter((s) => s.branca === branca).length,
    colore: COLORI_BRANCA[branca] || COLORE_ALTRE,
  })).filter((r) => r.numero > 0);

  const altre = righe.filter((r) => !COLORI_BRANCA[r.branca]);
  const fette = righe.filter((r) => COLORI_BRANCA[r.branca]);
  if (altre.length > 0) {
    fette.push({
      branca: altre.length === 1 ? altre[0].branca : 'Altre',
      numero: altre.reduce((somma, r) => somma + r.numero, 0),
      colore: COLORE_ALTRE,
    });
  }

  return (
    <section className="distribuzione-section etched-frame">
      <h2>Strumenti per branca{scuola ? ` · ${scuola}` : ''}</h2>
      <div className="strumenti-torta">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={fette}
              dataKey="numero"
              nameKey="branca"
              outerRadius="92%"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {fette.map((f) => (
                <Cell key={f.branca} fill={f.colore} stroke={COLORE_SFONDO} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(valore, nome) => [`${valore} (${percentuale(valore)})`, nome]}
              contentStyle={{ background: '#ece1c8', border: '1px solid rgba(43,29,15,0.35)' }}
              itemStyle={{ color: '#2b1d0f' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <table className="strumenti-torta-tabella">
          <thead>
            <tr>
              <th scope="col">Branca</th>
              <th scope="col">Strumenti</th>
              <th scope="col">%</th>
            </tr>
          </thead>
          <tbody>
            {righe.map((r) => (
              <tr key={r.branca}>
                <td>
                  <span className="strumenti-torta-colore" style={{ background: r.colore }} aria-hidden="true" />
                  {r.branca}
                </td>
                <td>{r.numero}</td>
                <td>{percentuale(r.numero)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Totale</th>
              <td>{totale}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
