import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import IconaPulsante from './IconaPulsante';

const VISTE = [
  ['griglia', 'Griglia', IconLayoutGrid],
  ['elenco', 'Elenco', IconList],
];

export default function VistaToggle({ vista, onCambia, etichetta }) {
  return (
    <div className="strumenti-vista" role="group" aria-label={etichetta}>
      {VISTE.map(([valore, nome, Icona]) => (
        <IconaPulsante
          key={valore}
          etichetta={nome}
          className={vista === valore ? 'primary' : ''}
          aria-pressed={vista === valore}
          onClick={() => onCambia(valore)}
        >
          <Icona size={20} stroke={1.75} />
        </IconaPulsante>
      ))}
    </div>
  );
}
