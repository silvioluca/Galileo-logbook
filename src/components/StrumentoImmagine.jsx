import { useEffect, useState } from 'react';
import { otteniBlobFileOriginale } from '../services/fileOriginaleService';

// Le immagini nel repo sono percorsi statici; quelle caricate dal proprietario
// stanno in Firestore e si scaricano solo quando servono.
export default function StrumentoImmagine({ strumento }) {
  const file = strumento.immagineFile;
  const [caricata, setCaricata] = useState({ fileId: null, url: null });

  useEffect(() => {
    if (!file) return undefined;
    let attivo = true;
    let url = null;
    otteniBlobFileOriginale(file)
      .then((blob) => {
        if (!attivo) return;
        url = URL.createObjectURL(blob);
        setCaricata({ fileId: file.fileId, url });
      })
      .catch((err) => console.warn("Impossibile caricare l'immagine.", err));
    return () => {
      attivo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  const staticaUrl = strumento.immagine && `${import.meta.env.BASE_URL}${strumento.immagine}`;
  const src = file ? caricata.fileId === file.fileId && caricata.url : staticaUrl;

  if (src) return <img src={src} alt={strumento.nome} />;
  return (
    <span aria-hidden="true">{file ? 'Caricamento…' : 'Immagine non ancora disponibile'}</span>
  );
}
