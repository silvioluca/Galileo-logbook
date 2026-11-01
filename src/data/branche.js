export const BRANCHE = [
  'Misura',
  'Meccanica',
  'Termologia',
  'Acustica',
  'Ottica',
  'Elettromagnetismo',
  'Fluidodinamica',
];

// Macroargomenti in più usati solo dagli inventari degli strumenti: non sono
// branche di una scheda, quindi restano fuori da BRANCHE.
export const BRANCHE_STRUMENTI = [...BRANCHE, 'Fisica moderna', 'Astronomia', 'Materiale generico'];
