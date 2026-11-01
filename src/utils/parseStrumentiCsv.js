import { BRANCHE_STRUMENTI } from '../data/branche';

export const MODELLO_CSV = [
  'Nome;Branca;Scuola;Quantità;Armadio;Sezione;N. Inventario;Grandezza;Unità;Sensibilità;Portata;Descrizione',
  'Calibro a nonio;Meccanica;Norberto Rosa (Bussoleno);3;1;A;512;Lunghezza;mm;0,05 mm;150 mm;Misura lunghezze e diametri',
].join('\r\n');

// Più nomi per colonna, così va bene anche l'intestazione dell'inventario
// originale ("Descrizione", "Macroargomento (branca fisica)", "N. Inventario").
// Lì "Descrizione" è il nome dello strumento: vale come testo descrittivo solo
// se il file ha già una colonna Nome o Strumento (vedi interpretaRigheCsv).
const COLONNE = {
  descrizione: 'nome',
  nome: 'nome',
  strumento: 'nome',
  branca: 'branca',
  macroargomento: 'branca',
  macroargomentobrancafisica: 'branca',
  scuola: 'scuola',
  quantita: 'quantita',
  qta: 'quantita',
  armadio: 'armadio',
  sezione: 'sezione',
  sez: 'sezione',
  ninventario: 'inventario',
  ninv: 'inventario',
  inventario: 'inventario',
  numeroinventario: 'inventario',
  grandezza: 'grandezza',
  unita: 'unita',
  unitadimisura: 'unita',
  sensibilita: 'sensibilita',
  portata: 'portata',
};

const ALIAS_BRANCA = { 'meccanica dei fluidi': 'Fluidodinamica' };

function normalizza(testo) {
  return testo.normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

// Excel in italiano salva i CSV in Windows-1252: leggendoli come UTF-8 le
// lettere accentate si rovinerebbero.
export function decodificaCsv(buffer) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1252').decode(buffer);
  }
}

function separatore(testo) {
  const primaRiga = testo.split(/\r?\n/, 1)[0];
  const conteggio = (s) => primaRiga.split(s).length;
  return [';', '\t', ','].reduce((a, b) => (conteggio(b) > conteggio(a) ? b : a));
}

// Righe del file come array di celle. Gestisce virgolette, separatori e a capo
// dentro le celle.
export function leggiRigheCsv(testo) {
  const pulito = testo.replace(/^﻿/, '');
  const sep = separatore(pulito);
  const righe = [];
  let riga = [];
  let cella = '';
  let traVirgolette = false;

  for (let i = 0; i < pulito.length; i += 1) {
    const c = pulito[i];
    if (traVirgolette) {
      if (c === '"' && pulito[i + 1] === '"') {
        cella += '"';
        i += 1;
      } else if (c === '"') {
        traVirgolette = false;
      } else {
        cella += c;
      }
    } else if (c === '"') {
      traVirgolette = true;
    } else if (c === sep) {
      riga.push(cella);
      cella = '';
    } else if (c === '\n') {
      righe.push([...riga, cella.replace(/\r$/, '')]);
      riga = [];
      cella = '';
    } else {
      cella += c;
    }
  }
  if (cella || riga.length > 0) righe.push([...riga, cella]);
  return righe;
}

export function normalizzaQuantita(valore) {
  const testo = String(valore ?? '').trim();
  if (!testo) return null;
  return /^\d+$/.test(testo) ? Number(testo) : testo;
}

export function chiaveStrumento({ nome, scuola, inventario }) {
  return [scuola, nome, inventario || ''].join('|').toLowerCase();
}

function trovaBranca(testo) {
  const cercata = testo.toLowerCase();
  return (
    ALIAS_BRANCA[cercata] || BRANCHE_STRUMENTI.find((b) => b.toLowerCase() === cercata) || null
  );
}

// Trasforma le righe in strumenti. Le righe valide e quelle con errori vengono
// separate, così un file con poche righe sbagliate resta importabile.
export function interpretaRigheCsv(righe, { scuolaPredefinita, strumenti }) {
  // L'intestazione può non essere in prima riga: gli export dell'inventario
  // hanno sopra il titolo e l'anno scolastico.
  const indiceIntestazione = righe
    .slice(0, 10)
    .findIndex((r) => r.some((c) => COLONNE[normalizza(c)] === 'nome'));
  if (indiceIntestazione === -1) {
    return { voci: [], errori: [], duplicati: 0, intestazioneMancante: true };
  }

  const intestazioni = righe[indiceIntestazione].map(normalizza);
  const haNome = intestazioni.some((c) => c !== 'descrizione' && COLONNE[c] === 'nome');
  const campi = intestazioni.map((c) => (c === 'descrizione' && haNome ? 'descrizione' : COLONNE[c]));
  const scuole = [...new Set(strumenti.map((s) => s.scuola))];
  const presenti = new Set(strumenti.map(chiaveStrumento));
  const voci = [];
  const errori = [];
  let duplicati = 0;

  righe.slice(indiceIntestazione + 1).forEach((celle, i) => {
    if (celle.every((c) => !c.trim())) return;
    const numeroRiga = indiceIntestazione + i + 2;
    const valori = {};
    campi.forEach((campo, colonna) => {
      if (campo) valori[campo] = (celle[colonna] || '').trim();
    });

    const scuolaTesto = valori.scuola || scuolaPredefinita.trim();
    const scuola =
      scuole.find((s) => s.toLowerCase() === scuolaTesto.toLowerCase()) || scuolaTesto;
    const branca = trovaBranca(valori.branca || '');

    let errore = null;
    if (!valori.nome) errore = 'manca il nome dello strumento';
    else if (!valori.branca) errore = 'manca la branca';
    else if (!branca) errore = `branca "${valori.branca}" non riconosciuta`;
    else if (!scuola) errore = 'manca la scuola';
    if (errore) {
      errori.push({ riga: numeroRiga, messaggio: errore });
      return;
    }

    const voce = {
      nome: valori.nome,
      branca,
      scuola,
      quantita: normalizzaQuantita(valori.quantita),
      armadio: valori.armadio || null,
      sezione: valori.sezione || null,
      inventario: valori.inventario || null,
      grandezza: valori.grandezza || null,
      unita: valori.unita || null,
      sensibilita: valori.sensibilita || null,
      portata: valori.portata || null,
      descrizione: valori.descrizione || null,
    };
    const chiave = chiaveStrumento(voce);
    if (presenti.has(chiave)) {
      duplicati += 1;
      return;
    }
    presenti.add(chiave);
    voci.push(voce);
  });

  return { voci, errori, duplicati, intestazioneMancante: false };
}
