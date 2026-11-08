import { lazy, Suspense } from 'react';
import { Link, Routes, Route, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import './App.css';

// Ogni pagina si scarica quando serve: le librerie pesanti (lettura di PDF e
// DOCX, esportazioni, grafici) non rallentano l'apertura del sito.
const Schede = lazy(() => import('./pages/Schede'));
const CreaScheda = lazy(() => import('./pages/CreaScheda'));
const StrumentiWiki = lazy(() => import('./pages/StrumentiWiki'));
const Nobel = lazy(() => import('./pages/Nobel'));
const UnitaMisura = lazy(() => import('./pages/UnitaMisura'));
const Esperimenti = lazy(() => import('./pages/Esperimenti'));
const Storia = lazy(() => import('./pages/Storia'));

// Crea e Modifica sono la stessa pagina: la chiave la fa ripartire da zero
// quando cambia la scheda, invece di tenere i campi della precedente.
function PaginaScheda() {
  const { id } = useParams();
  return <CreaScheda key={id || 'nuova'} />;
}

function PaginaNonTrovata() {
  return (
    <div className="page">
      <div className="container">
        <h1>Pagina non trovata</h1>
        <p>
          L'indirizzo non corrisponde a nessuna pagina del sito. <Link to="/">Torna alla home</Link>.
        </p>
      </div>
    </div>
  );
}

function Caricamento() {
  return (
    <div className="page">
      <div className="container">
        <p>Caricamento…</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Suspense fallback={<Caricamento />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schede" element={<Schede />} />
          <Route path="/strumenti" element={<StrumentiWiki />} />
          <Route path="/nobel" element={<Nobel />} />
          <Route path="/unita-di-misura" element={<UnitaMisura />} />
          <Route path="/esperimenti" element={<Esperimenti />} />
          <Route path="/storia" element={<Storia />} />
          <Route path="/crea-scheda" element={<PaginaScheda />} />
          <Route path="/modifica-scheda/:id" element={<PaginaScheda />} />
          <Route path="*" element={<PaginaNonTrovata />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
