// L'etichetta sostituisce il testo: la leggono gli screen reader e compare al passaggio del mouse.
export default function IconaPulsante({ etichetta, className = '', children, ...altri }) {
  return (
    <button
      type="button"
      className={`btn icona-btn ${className}`.trim()}
      title={etichetta}
      aria-label={etichetta}
      {...altri}
    >
      {children}
    </button>
  );
}
