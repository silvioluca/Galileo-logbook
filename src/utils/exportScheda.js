import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle } from 'docx';
import { jsPDF } from 'jspdf';
import { determinaSkin } from './templateSkin';
import { convertiHtmlInDocx } from './htmlToDocx';
import { disegnaHtmlInPdf } from './htmlToPdf';
import { registraFontUnicode } from './pdfFont';

function haContenutoHtml(html) {
  return Boolean(html && html.replace(/<[^>]*>/g, '').trim());
}

function nomeFile(scheda, estensione) {
  const base = (scheda.titolo || 'scheda')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'scheda'}.${estensione}`;
}

function scaricaBlob(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function metaTesto(scheda) {
  const { branca, autore, modello, durataMinuti, numeroEsperienze, difficolta } = scheda;
  return [branca, autore, modello, `${durataMinuti || 0} min`, `${numeroEsperienze || 0} esperienze`, `Difficoltà: ${difficolta || ''}`]
    .filter(Boolean)
    .join(' · ');
}

// ---------- DOCX ----------

const FONT_CLASSICO = 'Cambria';
const FONT_COMPATTO = 'Arial';
const FONT_ARTISTICO = 'Garamond';

function docxClassico(scheda) {
  const { titolo, scopo, strumenti = [], procedimento } = scheda;
  const f = (opzioni) => new TextRun({ font: FONT_CLASSICO, ...opzioni });
  return [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [f({ text: titolo || 'Scheda di laboratorio' })],
    }),
    new Paragraph({ children: [f({ text: metaTesto(scheda), italics: true })] }),
    new Paragraph({ text: '' }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [f({ text: "Scopo dell'esperienza" })],
    }),
    new Paragraph({ children: [f({ text: scopo || '' })] }),
    new Paragraph({ text: '' }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [f({ text: 'Materiale utilizzato' })],
    }),
    ...strumenti.map((s) => new Paragraph({ children: [f({ text: s })], bullet: { level: 0 } })),
    new Paragraph({ text: '' }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [f({ text: 'Procedimento' })],
    }),
    ...(haContenutoHtml(procedimento) ? convertiHtmlInDocx(procedimento) : [new Paragraph({ children: [f({ text: '—' })] })]),
  ];
}

function docxCompatto(scheda) {
  const { titolo, scopo, strumenti = [], procedimento, difficolta } = scheda;
  const f = (opzioni) => new TextRun({ font: FONT_COMPATTO, ...opzioni });
  return [
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 4 } },
      children: [
        f({ text: titolo || 'Scheda di laboratorio', bold: true, size: 26 }),
        f({ text: `   Difficoltà: ${difficolta || ''}`, italics: true, size: 16 }),
      ],
    }),
    new Paragraph({ children: [f({ text: metaTesto(scheda), size: 15 })] }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [f({ text: 'SCOPO ', bold: true, size: 18 }), f({ text: scopo || '', size: 18 })],
    }),
    new Paragraph({
      children: [
        f({ text: 'MATERIALE ', bold: true, size: 18 }),
        f({ text: strumenti.join(', '), size: 18 }),
      ],
    }),
    new Paragraph({ children: [f({ text: 'PROCEDIMENTO', bold: true, size: 18 })] }),
    ...(haContenutoHtml(procedimento) ? convertiHtmlInDocx(procedimento) : [new Paragraph({ children: [f({ text: '—', size: 18 })] })]),
  ];
}

function docxArtistico(scheda) {
  const { titolo, scopo, strumenti = [], procedimento } = scheda;
  const f = (opzioni) => new TextRun({ font: FONT_ARTISTICO, ...opzioni });
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [f({ text: (titolo || 'Scheda di laboratorio').toUpperCase(), bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [f({ text: metaTesto(scheda), italics: true, size: 18 })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [f({ text: '❦', size: 24 })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [f({ text: "SCOPO DELL'ESPERIENZA", bold: true })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [f({ text: scopo || '', italics: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [f({ text: '✦' })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [f({ text: 'MATERIALE UTILIZZATO', bold: true })],
    }),
    ...strumenti.map((s) => new Paragraph({ alignment: AlignmentType.CENTER, children: [f({ text: s })] })),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [f({ text: '✦' })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [f({ text: 'PROCEDIMENTO', bold: true })],
    }),
    ...(haContenutoHtml(procedimento) ? convertiHtmlInDocx(procedimento) : [new Paragraph({ alignment: AlignmentType.CENTER, children: [f({ text: '—' })] })]),
  ];
}

export async function scaricaDocx(scheda) {
  const skin = determinaSkin(scheda.modello);
  const costruttori = { classico: docxClassico, compatto: docxCompatto, artistico: docxArtistico };
  const children = costruttori[skin](scheda);

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  scaricaBlob(blob, nomeFile(scheda, 'docx'));
}

// ---------- PDF ----------

function creaScrittore(doc, margine, larghezza, altezzaPagina, famiglia = 'DejaVu') {
  let y = margine;
  return {
    scrivi(testo, { dimensione = 11, stile = 'normal', interlinea = 14, spazioSopra = 0, centrato = false, colore = null } = {}) {
      y += spazioSopra;
      doc.setFont(famiglia, stile);
      doc.setFontSize(dimensione);
      doc.setTextColor(...(colore || [0, 0, 0]));
      const righe = doc.splitTextToSize(testo || '', larghezza);
      righe.forEach((riga) => {
        if (y > altezzaPagina - margine) {
          doc.addPage();
          y = margine;
        }
        if (centrato) {
          doc.text(riga, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        } else {
          doc.text(riga, margine, y);
        }
        y += interlinea;
      });
    },
    // Come scrivi(), ma con rientro a bandiera: il prefisso (punto o numero)
    // resta nel margine, e tutte le righe del testo, comprese quelle andate
    // a capo, si allineano sotto la prima parola invece che tornare al
    // margine della pagina.
    scriviVoceElenco(testoVoce, prefisso, { dimensione = 11, stile = 'normal', interlinea = 14, colore = null } = {}) {
      doc.setFont(famiglia, stile);
      doc.setFontSize(dimensione);
      doc.setTextColor(...(colore || [0, 0, 0]));
      const rientro = doc.getTextWidth(`${prefisso}  `);
      const righe = doc.splitTextToSize(testoVoce || '', larghezza - rientro);
      righe.forEach((riga, indice) => {
        if (y > altezzaPagina - margine) {
          doc.addPage();
          y = margine;
        }
        if (indice === 0) doc.text(prefisso, margine, y);
        doc.text(riga, margine + rientro, y);
        y += interlinea;
      });
    },
    get y() {
      return y;
    },
    set y(valore) {
      y = valore;
    },
    famiglia,
  };
}

function pdfClassico(doc, margine, larghezza, altezzaPagina, scheda) {
  const { titolo, scopo, strumenti = [], procedimento } = scheda;
  const w = creaScrittore(doc, margine, larghezza, altezzaPagina, 'DejaVu');

  w.scrivi(titolo || 'Scheda di laboratorio', { dimensione: 18, stile: 'bold', interlinea: 22 });
  w.scrivi(metaTesto(scheda), { dimensione: 10, stile: 'italic', interlinea: 14 });

  w.scrivi("Scopo dell'esperienza", { dimensione: 13, stile: 'bold', interlinea: 16, spazioSopra: 12 });
  w.scrivi(scopo || '—');

  w.scrivi('Materiale utilizzato', { dimensione: 13, stile: 'bold', interlinea: 16, spazioSopra: 10 });
  if (strumenti.length === 0) w.scrivi('—');
  else strumenti.forEach((s) => w.scriviVoceElenco(s, '•'));

  w.scrivi('Procedimento', { dimensione: 13, stile: 'bold', interlinea: 16, spazioSopra: 10 });
  if (haContenutoHtml(procedimento)) {
    disegnaHtmlInPdf({ doc, scrittore: w, margine, larghezza, altezzaPagina, html: procedimento, opzioniTesto: { dimensione: 11, interlinea: 14 } });
  } else {
    w.scrivi('—');
  }
}

function pdfCompatto(doc, margine, larghezza, altezzaPagina, scheda) {
  const { titolo, scopo, strumenti = [], procedimento, difficolta } = scheda;
  const w = creaScrittore(doc, margine, larghezza, altezzaPagina, 'DejaVu');

  w.scrivi(`${titolo || 'Scheda di laboratorio'}   —   Difficoltà: ${difficolta || ''}`, {
    dimensione: 14,
    stile: 'bold',
    interlinea: 17,
  });
  doc.setDrawColor(0, 0, 0);
  doc.line(margine, w.y - 11, margine + larghezza, w.y - 11);
  w.scrivi(metaTesto(scheda), { dimensione: 8, stile: 'italic', interlinea: 11 });
  w.scrivi(`SCOPO. ${scopo || ''}`, { dimensione: 9.5, interlinea: 12, spazioSopra: 6 });
  w.scrivi(`MATERIALE. ${strumenti.join(', ')}`, { dimensione: 9.5, interlinea: 12, spazioSopra: 4 });
  w.scrivi('PROCEDIMENTO.', { dimensione: 9.5, stile: 'bold', interlinea: 12, spazioSopra: 4 });
  if (haContenutoHtml(procedimento)) {
    disegnaHtmlInPdf({ doc, scrittore: w, margine, larghezza, altezzaPagina, html: procedimento, opzioniTesto: { dimensione: 9.5, interlinea: 12 } });
  } else {
    w.scrivi('—', { dimensione: 9.5, interlinea: 12 });
  }
}

function pdfArtistico(doc, margine, larghezza, altezzaPagina, scheda) {
  const { titolo, scopo, strumenti = [], procedimento } = scheda;
  const w = creaScrittore(doc, margine, larghezza, altezzaPagina, 'DejaVu');

  w.scrivi((titolo || 'Scheda di laboratorio').toUpperCase(), {
    dimensione: 20,
    stile: 'bold',
    interlinea: 24,
    centrato: true,
  });
  w.scrivi(metaTesto(scheda), { dimensione: 9, stile: 'italic', interlinea: 13, centrato: true });
  w.scrivi('❦', { dimensione: 14, interlinea: 18, spazioSopra: 4, centrato: true });

  w.scrivi("SCOPO DELL'ESPERIENZA", { dimensione: 12, stile: 'bold', interlinea: 15, spazioSopra: 10, centrato: true });
  w.scrivi(scopo || '—', { stile: 'italic', centrato: true });

  w.scrivi('✦', { interlinea: 16, spazioSopra: 6, centrato: true });

  w.scrivi('MATERIALE UTILIZZATO', { dimensione: 12, stile: 'bold', interlinea: 15, spazioSopra: 6, centrato: true });
  if (strumenti.length === 0) w.scrivi('—', { centrato: true });
  else strumenti.forEach((s) => w.scrivi(s, { centrato: true }));

  w.scrivi('✦', { interlinea: 16, spazioSopra: 6, centrato: true });

  w.scrivi('PROCEDIMENTO', { dimensione: 12, stile: 'bold', interlinea: 15, spazioSopra: 6, centrato: true });
  if (haContenutoHtml(procedimento)) {
    disegnaHtmlInPdf({ doc, scrittore: w, margine, larghezza, altezzaPagina, html: procedimento, opzioniTesto: { dimensione: 11, interlinea: 14 } });
  } else {
    w.scrivi('—', { centrato: true });
  }
}

export async function scaricaPdf(scheda) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  await registraFontUnicode(doc);
  doc.setTextColor(0, 0, 0);
  const margine = 56;
  const larghezza = doc.internal.pageSize.getWidth() - margine * 2;
  const altezzaPagina = doc.internal.pageSize.getHeight();

  const skin = determinaSkin(scheda.modello);
  const costruttori = { classico: pdfClassico, compatto: pdfCompatto, artistico: pdfArtistico };
  costruttori[skin](doc, margine, larghezza, altezzaPagina, scheda);

  doc.save(nomeFile(scheda, 'pdf'));
}

