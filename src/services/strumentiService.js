import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db, firebaseReady } from './firebase';

// La collezione non contiene il catalogo, solo le differenze rispetto ai dati
// nel codice: voci modificate, eliminate ({ eliminato: true }) o aggiunte
// ({ aggiunto: true }). Vedi applicaModifiche in catalogoStrumenti.js.
const COLLECTION = 'strumenti';
const LOCAL_KEY = 'galileo-logbook-strumenti';
const MAX_SCRITTURE_BATCH = 500;

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(modifiche) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(modifiche));
  } catch {
    // storage non disponibile: la sessione corrente resta comunque funzionante
  }
}

function fondiLocale(modifiche, id, dati) {
  const esistente = modifiche.find((m) => m.id === id);
  return [...modifiche.filter((m) => m.id !== id), { ...esistente, ...dati, id }];
}

async function eseguiABlocchi(elementi, scrivi) {
  for (let i = 0; i < elementi.length; i += MAX_SCRITTURE_BATCH) {
    const batch = writeBatch(db);
    for (const elemento of elementi.slice(i, i + MAX_SCRITTURE_BATCH)) scrivi(batch, elemento);
    await batch.commit();
  }
}

// Lettura pubblica (Firestore rules: allow read: if true): se fallisce il
// catalogo resta comunque consultabile, senza le modifiche.
export async function getModificheStrumenti() {
  if (firebaseReady) {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (err) {
      console.warn('Firestore non raggiungibile, uso i dati locali.', err);
    }
  }
  return loadLocal();
}

// Scritture riservate al proprietario (Firestore rules): un errore di permessi
// deve arrivare a chi chiama, non essere nascosto scrivendo in locale.
export async function salvaStrumenti(voci) {
  if (firebaseReady) {
    await eseguiABlocchi(voci, (batch, { id, dati }) =>
      batch.set(doc(db, COLLECTION, id), dati, { merge: true }),
    );
    return;
  }
  saveLocal(voci.reduce((modifiche, { id, dati }) => fondiLocale(modifiche, id, dati), loadLocal()));
}

export async function aggiungiStrumenti(strumenti) {
  const nuovi = strumenti.map((s) => ({ ...s, aggiunto: true }));
  if (firebaseReady) {
    await eseguiABlocchi(nuovi, (batch, s) => batch.set(doc(collection(db, COLLECTION)), s));
    return;
  }
  saveLocal([...loadLocal(), ...nuovi.map((s) => ({ ...s, id: crypto.randomUUID() }))]);
}

// Le voci aggiunte si cancellano davvero; quelle nel codice restano marcate
// come eliminate, altrimenti ricomparirebbero al caricamento successivo.
export async function eliminaStrumenti(strumenti) {
  if (firebaseReady) {
    await eseguiABlocchi(strumenti, (batch, s) => {
      const ref = doc(db, COLLECTION, s.id);
      if (s.aggiunto) batch.delete(ref);
      else batch.set(ref, { eliminato: true }, { merge: true });
    });
    return;
  }
  saveLocal(
    strumenti.reduce(
      (modifiche, s) =>
        s.aggiunto
          ? modifiche.filter((m) => m.id !== s.id)
          : fondiLocale(modifiche, s.id, { eliminato: true }),
      loadLocal(),
    ),
  );
}
