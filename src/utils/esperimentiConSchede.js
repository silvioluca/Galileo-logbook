const normalizza = (testo) => (testo || '').trim().toLowerCase();

function stessoNome(nomeEsperimento, scheda) {
  const nome = normalizza(nomeEsperimento);
  return nome === normalizza(scheda.titolo) || nome === normalizza(scheda.esperienza);
}

// Le schede scelgono da un elenco breve ("Calibro"), l'inventario ha varianti e
// plurali ("Calibri", "Multimetri analogici"): basta il nome senza l'ultima lettera.
function usaStrumento(scheda, nomeStrumento) {
  const nome = normalizza(nomeStrumento);
  return (scheda.strumenti || []).some((s) => nome.startsWith(normalizza(s).slice(0, -1)));
}

// Elenco da mostrare: gli esperimenti dello strumento, ciascuno con le sue schede
// (scelta a mano o stesso nome), più le schede che dichiarano di usare lo
// strumento senza corrispondere a nessun esperimento. Prima quelle con una scheda.
export function esperimentiConSchede(strumento, schede) {
  const usate = new Set();
  const voci = (strumento.esperimenti || []).map((e) => {
    const collegate = schede.filter((s) => s.id === e.schedaId || stessoNome(e.nome, s));
    collegate.forEach((s) => usate.add(s.id));
    return { nome: e.nome, schede: collegate };
  });

  const perTitolo = new Map();
  for (const s of schede) {
    if (usate.has(s.id) || !usaStrumento(s, strumento.nome)) continue;
    perTitolo.set(s.titolo, [...(perTitolo.get(s.titolo) || []), s]);
  }
  const daSchede = [...perTitolo].map(([nome, collegate]) => ({ nome, schede: collegate }));

  return [...voci, ...daSchede].sort((a, b) => (b.schede.length > 0) - (a.schede.length > 0));
}
