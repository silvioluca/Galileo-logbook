const LATO_MASSIMO = 1000;
const QUALITA_JPEG = 0.82;

// Le foto restano in Firestore (vedi fileOriginaleService.js): riducendole
// prima del caricamento uno scatto da telefono passa da qualche MB a pochi KB.
export async function ridimensionaImmagine(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Formato non supportato per "${file.name}": usa un'immagine JPG, PNG o WebP.`);
  }

  const scala = Math.min(1, LATO_MASSIMO / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scala);
  canvas.height = Math.round(bitmap.height * scala);

  const ctx = canvas.getContext('2d');
  // Il JPEG non ha trasparenza: senza sfondo le zone trasparenti diventano nere.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITA_JPEG));
  if (!blob) throw new Error(`Impossibile elaborare "${file.name}".`);
  return new File([blob], `${file.name.replace(/\.[^.]*$/, '')}.jpg`, { type: 'image/jpeg' });
}
