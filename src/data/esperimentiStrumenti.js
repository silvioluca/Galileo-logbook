// Esperimenti proposti per ogni strumento. L'inventario ha nomi liberi e molte
// varianti ("Multimetri analogici", "Multimetro digitale portatile"), quindi si
// riconoscono dal nome invece di elencarli voce per voce. Una voce che soddisfa
// più regole le somma tutte. Il proprietario può sovrascrivere l'elenco di un
// singolo strumento: quello salvato ha la precedenza (vedi applicaModifiche).
// Gli accessori di montaggio (aste, morsetti, cavi) riportano gli esperimenti
// in cui servono di solito.
const OHM = 'Legge di Ohm';
const SECONDA_OHM = 'Seconda legge di Ohm';
const RESISTIVITA = 'Resistività di un filo metallico';
const SERIE_PARALLELO = 'Resistenze in serie e in parallelo';
const KIRCHHOFF = 'Leggi di Kirchhoff';
const PARTITORE = 'Partitore di tensione';
const PILA = 'Resistenza interna di una pila';
const FEM = 'Forza elettromotrice di una pila';
const PILA_FRUTTA = 'Pila a frutta';
const JOULE = 'Effetto Joule';
const LAMPADINA = 'Caratteristica di una lampadina';
const DIODO = 'Caratteristica di un diodo';
const ELETTROLISI = 'Elettrolisi e leggi di Faraday';
const CONDENSATORE = 'Carica e scarica di un condensatore';
const RLC = 'Risonanza in un circuito RLC';
const FILTRI_RC = 'Filtri RC';
const SFASAMENTO = 'Sfasamento in un circuito RC';
const LISSAJOUS = 'Figure di Lissajous';
const FREQUENZA_SEGNALE = 'Frequenza e periodo di un segnale';
const INDUZIONE = 'Induzione elettromagnetica';
const FARADAY = 'Legge di Faraday-Neumann';
const LENZ = 'Legge di Lenz';
const TRASFORMATORE = 'Trasformatore';
const AUTOINDUZIONE = 'Autoinduzione';
const OERSTED = 'Esperienza di Oersted';
const LINEE_CAMPO = 'Linee di campo magnetico';
const LINEE_ELETTRICHE = 'Linee di campo elettrico';
const SOLENOIDE = 'Campo magnetico di un solenoide';
const CAMPO_TERRESTRE = 'Campo magnetico terrestre';
const FORZA_MAGNETI = 'Forza fra magneti';
const FORZA_CONDUTTORE = 'Forza su un conduttore percorso da corrente';
const CORRENTI_FOUCAULT = 'Correnti di Foucault';
const MOTORE = 'Motore elettrico in corrente continua';
const CORRENTE_ALTERNATA = 'Produzione di corrente alternata';
const STROFINIO = 'Elettrizzazione per strofinio, contatto e induzione';
const INDUZIONE_ELETTROSTATICA = 'Induzione elettrostatica';
const CONDUTTORI_ISOLANTI = 'Conduttori e isolanti';
const CORPI_CARICHI = 'Attrazione e repulsione fra corpi carichi';
const SCARICA_GAS = 'Scarica nei gas a bassa pressione';
const RAGGI_CATODICI = 'Raggi catodici';
const CARICA_MASSA = "Rapporto carica/massa dell'elettrone";
const PENDOLO = 'Misura del periodo del pendolo semplice';
const G_PENDOLO = 'Misura di g con il pendolo';
const G_CADUTA = 'Misura di g in caduta libera';
const CADUTA = 'Caduta di un grave';
const ISOCRONISMO = 'Isocronismo delle piccole oscillazioni';
const PERIODO_MASSA = 'Indipendenza del periodo dalla massa';
const INCLINATO = 'Piano inclinato e accelerazione di gravità';
const HOOKE = 'Legge di Hooke';
const MASSA_MOLLA = 'Oscillazioni di un sistema massa-molla';
const FORZE = 'Composizione e scomposizione delle forze';
const ATTRITO = 'Forza di attrito statico e dinamico';
const ARCHIMEDE = 'Spinta di Archimede';
const LEVE = 'Equilibrio delle leve';
const MOMENTO = 'Momento di una forza';
const BARICENTRO = 'Baricentro di un corpo esteso';
const MASSA_PESO = 'Proporzionalità fra massa e peso';
const MRU = 'Moto rettilineo uniforme';
const MRUA = 'Moto uniformemente accelerato';
const PROIETTILE = 'Moto del proiettile';
const DINAMICA = 'Secondo principio della dinamica';
const ATWOOD = 'Macchina di Atwood';
const URTI = 'Conservazione della quantità di moto negli urti';
const URTI_TIPI = 'Urti elastici e anelastici';
const ENERGIA = "Conservazione dell'energia meccanica";
const DENSITA = 'Densità di solidi e liquidi';
const VOLUME = 'Volume di un solido irregolare';
const ERRORI = 'Propagazione degli errori di misura';
const CALIBRO_MICROMETRO = 'Confronto fra calibro e micrometro';
const TRIANGOLAZIONE = 'Misura di angoli per triangolazione';
const STOKES = 'Viscosità di un liquido con la legge di Stokes';
const SUONO = 'Velocità del suono in aria';
const BATTIMENTI = 'Battimenti';
const STAZIONARIE = 'Onde stazionarie';
const INTERVALLI = 'Intervalli musicali e rapporti di frequenza';
const DILATAZIONE = 'Dilatazione termica lineare';
const CALORE_SPECIFICO = 'Calore specifico di un metallo';
const LATENTE = 'Calore latente di fusione del ghiaccio';
const EQUILIBRIO_TERMICO = 'Temperatura di equilibrio di una miscela';
const RISCALDAMENTO = 'Curva di riscaldamento e cambiamenti di stato';
const RAFFREDDAMENTO = 'Legge di raffreddamento di Newton';
const CONDUCIBILITA = 'Conducibilità termica di materiali diversi';
const CONVEZIONE = 'Convezione in un liquido';
const GAY_LUSSAC = 'Legge di Gay-Lussac';
const BOYLE = 'Legge di Boyle';
const STEVINO = 'Legge di Stevino';
const PASCAL = 'Principio di Pascal';
const PRESSIONE_ATMOSFERICA = 'Misura della pressione atmosferica';
const BERNOULLI = 'Equazione di Bernoulli';
const RIFLESSIONE = 'Legge della riflessione';
const RIFRAZIONE = 'Indice di rifrazione di un mezzo';
const RIFLESSIONE_TOTALE = 'Riflessione totale';
const PUNTI_CONIUGATI = 'Legge dei punti coniugati';
const FOCALE = 'Distanza focale di una lente';
const SPECCHI = 'Immagini negli specchi sferici';
const INGRANDIMENTO = 'Ingrandimento di un sistema di lenti';
const DISPERSIONE = 'Dispersione della luce bianca';
const SPETTRO = 'Spettro della luce visibile';
const SPETTRI_GAS = 'Spettri di emissione dei gas';
const LASER = "Lunghezza d'onda di un laser";
const POLARIZZAZIONE = 'Polarizzazione della luce';
const MALUS = 'Legge di Malus';
const VUOTO = 'Suono e pressione nel vuoto';
const BASSA_PRESSIONE = 'Ebollizione a bassa pressione';

const MONTAGGIO_MECCANICO = [PENDOLO, HOOKE, MASSA_MOLLA, LEVE, FORZE];
const MONTAGGIO_ELETTRICO = [OHM, SERIE_PARALLELO, KIRCHHOFF, PARTITORE];

const REGOLE = [
  [/^(?!micrometro).*(calibr|nonio)/, ['Diametro interno ed esterno di un cilindro', 'Volume di un solido geometrico', DENSITA, ERRORI, PENDOLO, DILATAZIONE, CALIBRO_MICROMETRO, 'Profondità di un foro']],
  [/micrometr/, ['Diametro di un filo sottile', 'Spessore di un foglio di carta', RESISTIVITA, CALIBRO_MICROMETRO, ERRORI, STOKES]],
  [/comparatore/, ['Misura di piccoli spostamenti', DILATAZIONE, 'Flessione di una trave', 'Modulo di Young di un filo']],
  [/catetometr/, ['Dislivello fra due punti', HOOKE, STEVINO, BOYLE, 'Innalzamento capillare']],
  [/aste metriche|metro a nastro|listello graduato|righe e squadre/, ["Misura di lunghezze e stima dell'incertezza", PENDOLO, HOOKE, "Altezza di un edificio con le ombre", MRU, INCLINATO]],
  [/^bilanci(?!a di torsione)/, [MASSA_PESO, DENSITA, 'Conservazione della massa', CALORE_SPECIFICO, ARCHIMEDE, LATENTE, 'Concentrazione di una soluzione salina', 'Statistica di misure ripetute']],
  [/masse con intaglio|piattello porta masse|pesetti/, [HOOKE, LEVE, FORZE, DINAMICA, ATWOOD, MASSA_MOLLA, ATTRITO, MOMENTO]],
  [/astine di precisione/, [HOOKE, LEVE, MOMENTO]],
  [/bilancia di montaggio|piatto con innesto/, [MASSA_PESO, ARCHIMEDE, LEVE]],
  [/cronometr/, [PENDOLO, INCLINATO, MRU, MRUA, 'Tempo di reazione', CADUTA, MASSA_MOLLA, ATWOOD, G_PENDOLO, RAFFREDDAMENTO, 'Statistica di misure ripetute']],
  [/goniometr/, [RIFLESSIONE, RIFRAZIONE, INCLINATO, FORZE, TRIANGOLAZIONE, ATTRITO, RIFLESSIONE_TOTALE, ISOCRONISMO]],
  [/dinamometr/, [HOOKE, ATTRITO, FORZE, ARCHIMEDE, INCLINATO, MASSA_PESO, LEVE, MOMENTO, DINAMICA, FORZA_MAGNETI]],
  [/rotaia|guidovia|multitimer/, [MRU, MRUA, DINAMICA, URTI, ENERGIA, URTI_TIPI, INCLINATO, MASSA_MOLLA, "Teorema dell'impulso", 'Lavoro ed energia cinetica']],
  [/fotocellula|porte fotoelettrica/, [G_PENDOLO, CADUTA, MRUA, 'Tempo di passaggio e velocità istantanea', G_CADUTA, MRU, INCLINATO, URTI]],
  [/asta pendolare|da pendolo|masse pendolari|orologio a pendolo/, [PENDOLO, G_PENDOLO, ISOCRONISMO, 'Pendolo fisico', PERIODO_MASSA, 'Periodo e lunghezza del pendolo', ENERGIA, 'Smorzamento di un pendolo']],
  [/waltenhofen/, [CORRENTI_FOUCAULT, 'Smorzamento elettromagnetico di un pendolo']],
  [/pendolo di newton/, [URTI, ENERGIA, URTI_TIPI, "Trasmissione dell'impulso in una fila di sfere"]],
  [/piano inclinato/, [INCLINATO, ATTRITO, 'Discesa dei gravi di Galileo', MRUA, ENERGIA, FORZE, 'Rotolamento di una sfera']],
  [/atwood/, [ATWOOD, DINAMICA, 'Misura di g con la macchina di Atwood', MRUA, ENERGIA, 'Tensione del filo']],
  [/foucault/, ['Rotazione terrestre con il pendolo', G_PENDOLO, 'Latitudine dalla rotazione del piano di oscillazione', 'Forza di Coriolis']],
  [/bilancia di torsione/, ['Misura della costante di gravitazione G', 'Legge di Coulomb', 'Costante di torsione di un filo', 'Periodo di un pendolo di torsione']],
  [/giroscop|gyroscope/, ['Conservazione del momento angolare', 'Precessione di un giroscopio', 'Nutazione di un giroscopio', "Stabilità dell'asse di rotazione"]],
  [/dispositivo girevole/, [CORPI_CARICHI, STROFINIO, FORZA_MAGNETI]],
  [/aste per leve/, [LEVE, FORZE, MOMENTO, BARICENTRO]],
  [/cassetta meccanica 1/, [LEVE, FORZE, ARCHIMEDE, HOOKE, STEVINO, MOMENTO, BARICENTRO, 'Carrucole e paranchi']],
  [/cassetta meccanica 2/, [MRU, MRUA, PROIETTILE, DINAMICA, ENERGIA, PENDOLO, MASSA_MOLLA, STAZIONARIE]],
  [/^molle/, [HOOKE, MASSA_MOLLA, 'Molle in serie e in parallelo', 'Propagazione di onde longitudinali', 'Energia potenziale elastica', STAZIONARIE]],
  [/^asta (filettata|da )|^aste (a tubo|da stativo)|cassetta: stativi|^morsetto|giunto a snodo|tavolino|supporto radiale/, MONTAGGIO_MECCANICO],
  [/^bolla/, ['Messa in piano di un banco o di una rotaia', INCLINATO]],
  [/diapason/, [SUONO, BATTIMENTI, 'Risonanza fra due diapason', FREQUENZA_SEGNALE, 'Effetto della cassa di risonanza']],
  [/monocordo/, ['Leggi delle corde vibranti', STAZIONARIE, BATTIMENTI, 'Armonici di una corda', INTERVALLI]],
  [/sirena/, ['Frequenza di un suono e altezza della nota', 'Frequenza, numero di fori e velocità di rotazione', INTERVALLI]],
  [/tubo di kundt/, [SUONO, STAZIONARIE, 'Velocità del suono in un solido', "Risonanza di una colonna d'aria"]],
  [/generatore di suoni/, [SUONO, BATTIMENTI, 'Soglia di udibilità', "Risonanza di una colonna d'aria", 'Intensità del suono e distanza']],
  [/fonografo/, ['Registrazione e riproduzione del suono', 'Vibrazione di una membrana', 'Altezza del suono e velocità di rotazione']],
  [/termometr/, [DILATAZIONE, EQUILIBRIO_TERMICO, RISCALDAMENTO, RAFFREDDAMENTO, CALORE_SPECIFICO, LATENTE, 'Taratura di un termometro', 'Confronto fra scale termometriche', 'Raffreddamento per evaporazione', CONDUCIBILITA]],
  [/calorimetr|dewar/, ['Equivalente in acqua del calorimetro', CALORE_SPECIFICO, LATENTE, EQUILIBRIO_TERMICO, 'Equivalente meccanico del calore', JOULE, 'Calore latente di vaporizzazione', 'Calore di soluzione']],
  [/cassette termologia/, [CALORE_SPECIFICO, EQUILIBRIO_TERMICO, DILATAZIONE, RISCALDAMENTO, RAFFREDDAMENTO, CONDUCIBILITA]],
  [/termoscop/, ["Dilatazione termica dell'aria", 'Confronto qualitativo di temperature', GAY_LUSSAC]],
  [/gravesande|dilatoscopio/, ['Dilatazione volumica dei solidi', 'Sfera e anello a temperature diverse', 'Contrazione nel raffreddamento']],
  [/radiometro/, ['Effetto della radiazione su superfici chiare e scure', 'Velocità di rotazione e distanza dalla sorgente', 'Assorbimento della radiazione infrarossa']],
  [/becchi bunsen|piastra elettrica/, [RISCALDAMENTO, DILATAZIONE, LATENTE, CALORE_SPECIFICO, CONVEZIONE, CONDUCIBILITA]],
  [/crogiuolo|crogioli|reticella|provette/, [RISCALDAMENTO, 'Fusione e solidificazione di una sostanza', CONVEZIONE]],
  [/barometr/, [PRESSIONE_ATMOSFERICA, 'Variazione della pressione con la quota', BOYLE, 'Altezza di un edificio con il barometro', 'Pressione e previsioni del tempo']],
  [/baroscopio/, ["Spinta di Archimede nell'aria", 'Massa dell\'aria', VUOTO]],
  [/manometr/, [STEVINO, BOYLE, PASCAL, GAY_LUSSAC, 'Pressione e profondità in un liquido', 'Pressione di un gas chiuso']],
  [/apparecchio di pascal/, [STEVINO, PASCAL, 'Pressione e profondità in un liquido', 'Paradosso idrostatico']],
  [/siringa/, [BOYLE, PASCAL, BASSA_PRESSIONE, 'Torchio idraulico']],
  [/macchina pneumatica|pompa a vuoto|campana di vetro|campanello elettrico per pompa|vacuometro/, [VUOTO, BASSA_PRESSIONE, 'Palloncino sotto la campana a vuoto', 'Emisferi di Magdeburgo', 'Caduta dei gravi nel vuoto', "Massa dell'aria"]],
  [/tubo di newton/, ['Caduta dei gravi nel vuoto', "Resistenza dell'aria"]],
  [/tubo di venturi/, [BERNOULLI, 'Portata di un fluido', 'Effetto Venturi', 'Velocità e sezione di un condotto']],
  [/mariotte/, ['Legge di Torricelli', 'Efflusso a portata costante', "Gittata di un getto d'acqua", 'Portata e altezza del liquido']],
  [/fontana di erone/, [STEVINO, "Conservazione dell'energia nei fluidi", PASCAL, "Pressione dell'aria compressa"]],
  [/vas[oi] comunicant/, ['Principio dei vasi comunicanti', 'Densità di liquidi non miscibili', STEVINO, 'Capillarità nei tubi sottili']],
  [/areometro/, [DENSITA, 'Galleggiamento e principio di Archimede', 'Densità di soluzioni saline', 'Gradazione alcolica di una miscela']],
  [/igrometro/, ["Umidità relativa dell'aria", 'Punto di rugiada', 'Andamento di umidità e temperatura nel tempo']],
  [/cilindri graduati|becher|beuta|matraccio/, [VOLUME, DENSITA, ARCHIMEDE, 'Taratura di un recipiente', 'Errore di parallasse nella lettura']],
  [/banco ottico|cassetta ottica|pentalaser/, [RIFLESSIONE, RIFRAZIONE, PUNTI_CONIUGATI, FOCALE, RIFLESSIONE_TOTALE, SPECCHI, INGRANDIMENTO, 'Difetti della vista e lenti correttive']],
  [/cassetta ottica [23]/, [DISPERSIONE, POLARIZZAZIONE, MALUS]],
  [/cassetta ottica 3/, ['Fotoelasticità', 'Diffrazione da una fenditura', 'Interferenza da doppia fenditura']],
  [/prisma/, [DISPERSIONE, RIFRAZIONE, 'Angolo di deviazione minima', RIFLESSIONE_TOTALE, 'Ricomposizione della luce bianca']],
  [/reticolo/, [LASER, SPETTRO, 'Passo di un reticolo', SPETTRI_GAS]],
  [/spettroscop/, [SPETTRI_GAS, DISPERSIONE, 'Righe di assorbimento', 'Spettro continuo e spettro a righe']],
  [/interferometro/, [LASER, "Indice di rifrazione dell'aria", 'Frange di interferenza', 'Spessore di una lamina sottile']],
  [/cannocchiale|telescopio/, [INGRANDIMENTO, 'Osservazione della Luna', FOCALE, 'Satelliti di Giove', 'Fasi di Venere']],
  [/specchio ustorio/, ['Fuoco di uno specchio concavo', SPECCHI, RIFLESSIONE, "Concentrazione dell'energia solare"]],
  [/camera oscura/, ['Formazione delle immagini senza lenti', 'Propagazione rettilinea della luce', 'Nitidezza e dimensione del foro', 'Dimensione della figura e distanza']],
  [/kit fibre ottiche/, [RIFLESSIONE_TOTALE, 'Trasmissione di un segnale luminoso', RIFRAZIONE, 'Attenuazione del segnale']],
  [/kit luce|proiettori led|disco a settori/, ['Sintesi additiva dei colori', 'Ombre e penombre', 'Sintesi sottrattiva con filtri colorati', 'Persistenza retinica e illusioni ottiche']],
  [/lampada alogena/, [SPETTRO, LAMPADINA, DISPERSIONE, 'Illuminamento e distanza dalla sorgente']],
  [/solar kit/, ["Conversione fotovoltaica dell'energia", 'Potenza e rendimento di una cella solare', 'Cella solare e angolo di incidenza']],
  [/effetto fotoelettrico|^planck/, ['Effetto fotoelettrico', 'Costante di Planck', 'Potenziale di arresto', 'Frequenza di soglia e lavoro di estrazione', 'Fotocorrente e intensità della luce']],
  [/multimetr|strumento universale/, [OHM, SERIE_PARALLELO, KIRCHHOFF, PARTITORE, PILA, CONDENSATORE, DIODO, JOULE, SECONDA_OHM, LAMPADINA, PILA_FRUTTA, TRASFORMATORE]],
  [/voltmetr|scale per misure di tensione|portascale/, [OHM, PARTITORE, PILA, KIRCHHOFF, FEM, 'Resistenza interna di un voltmetro']],
  [/amperometr|scale per misure di intensit/, [OHM, KIRCHHOFF, SERIE_PARALLELO, JOULE, LAMPADINA, 'Resistenza interna di un amperometro']],
  [/oscilloscopio/, [FREQUENZA_SEGNALE, CONDENSATORE, RLC, LISSAJOUS, SUONO, BATTIMENTI, SFASAMENTO, FILTRI_RC, TRASFORMATORE, INDUZIONE, 'Raddrizzatore a diodi']],
  [/generatore di funzioni/, [FILTRI_RC, RLC, LISSAJOUS, STAZIONARIE, SFASAMENTO, BATTIMENTI, FREQUENZA_SEGNALE]],
  [/^alimentatore(?! at| phywe)/, [OHM, JOULE, CONDENSATORE, SOLENOIDE, KIRCHHOFF, LAMPADINA, ELETTROLISI, OERSTED]],
  [/^alimentatore (at|phywe)/, [RAGGI_CATODICI, CARICA_MASSA, SCARICA_GAS, SPETTRI_GAS, 'Campo elettrico fra due piastre']],
  [/reostato|resistenza lineare|conduttori metallici|piastra di base|scheda per componenti|cassetta elettrologia 1|portalampada/, [OHM, SERIE_PARALLELO, SECONDA_OHM, PARTITORE, KIRCHHOFF, JOULE]],
  [/fili per misure|^filo di/, [OHM, SECONDA_OHM, RESISTIVITA, SERIE_PARALLELO, 'Resistenza e temperatura']],
  [/portalampada/, [LAMPADINA]],
  [/cassetta elettrologia 1/, [ELETTROLISI, PILA_FRUTTA, FEM, LAMPADINA]],
  [/cassetta elettrologia 2/, [OERSTED, LINEE_CAMPO, INDUZIONE, MOTORE, STROFINIO, FORZA_MAGNETI, FORZA_CONDUTTORE, SOLENOIDE]],
  [/cassetta elettrologia 3|electronics fun kit/, [DIODO, 'Circuiti con transistor', 'Raddrizzatore a diodi', 'Transistor come interruttore', 'Circuito con LED e resistenza di protezione', FILTRI_RC]],
  [/coccodrillo|interruttore|cavi di|connettori|morsettiera/, MONTAGGIO_ELETTRICO],
  [/pila di volta/, [PILA_FRUTTA, FEM, 'Serie elettrochimica dei metalli', 'Pile in serie e in parallelo', PILA]],
  [/orologio ecologico/, [PILA_FRUTTA, FEM]],
  [/bottiglia di leida|dischi per condensatore/, ['Capacità di un condensatore piano', 'Accumulo di carica', 'Effetto di un dielettrico', 'Energia immagazzinata in un condensatore']],
  [/elettroscop|bacchette da strofinio|piumetto|scampanio|^sfera metallica|^macchina elettrostatica|dischi di plexiglass|van der graff|isolatore su asta/, [STROFINIO, 'Potere delle punte', INDUZIONE_ELETTROSTATICA, CONDUTTORI_ISOLANTI, CORPI_CARICHI, 'Distribuzione della carica su un conduttore', 'Gabbia di Faraday']],
  [/lastre di vetro/, [CONDUTTORI_ISOLANTI, LINEE_ELETTRICHE]],
  [/ruhmkorff/, ['Scariche ad alta tensione', INDUZIONE, TRASFORMATORE, SCARICA_GAS]],
  [/tubo di crookes/, [RAGGI_CATODICI, 'Deflessione magnetica degli elettroni', SCARICA_GAS, 'Propagazione rettilinea dei raggi catodici']],
  [/tubo di pohl/, [SCARICA_GAS, SPETTRI_GAS, 'Luminescenza di un gas e pressione']],
  [/bobina di tesla/, ['Risonanza fra circuiti accoppiati', 'Accensione a distanza di una lampada', 'Scariche ad alta tensione', 'Trasmissione di energia senza fili']],
  [/bobine di helmholtz/, ['Campo magnetico uniforme', CARICA_MASSA, CAMPO_TERRESTRE, 'Mappatura del campo con una sonda']],
  [/^bobin[ae](?! di)|solenoide|nucleo|nuclei/, [INDUZIONE, FARADAY, TRASFORMATORE, SOLENOIDE, AUTOINDUZIONE, LENZ, 'Mutua induzione', 'Elettromagnete']],
  [/bobina rotante|bobina mobile/, [CORRENTE_ALTERNATA, MOTORE, FORZA_CONDUTTORE]],
  [/galvanometr/, [INDUZIONE, FARADAY, OERSTED, LENZ, FORZA_CONDUTTORE, 'Corrente indotta da un magnete in movimento']],
  [/alternatore/, [CORRENTE_ALTERNATA, INDUZIONE, 'Tensione e velocità di rotazione', 'Dinamo e alternatore a confronto']],
  [/arganetto elettrico/, [MOTORE, 'Lavoro e potenza di un motore', 'Rendimento di un motore elettrico']],
  [/bussola|ago magnetico|aghi magnetici/, [OERSTED, LINEE_CAMPO, CAMPO_TERRESTRE, SOLENOIDE, 'Declinazione e inclinazione magnetica']],
  [/^magnet|limatura|espansioni polari|linee di campo/, [LINEE_CAMPO, FORZA_MAGNETI, FORZA_CONDUTTORE, INDUZIONE, 'Inseparabilità dei poli magnetici', 'Magnetizzazione del ferro', LENZ]],
  [/freno ad induzione|conduttore oscillante|nastro metallico con spira/, [FORZA_CONDUTTORE, CORRENTI_FOUCAULT, LENZ, INDUZIONE]],
  [/misuratore di campo/, ['Campo elettromagnetico di un apparecchio domestico', 'Campo e distanza dalla sorgente', 'Schermatura del campo']],
  [/geiger/, ['Radioattività ambientale', "Legge dell'inverso del quadrato della distanza", 'Assorbimento delle radiazioni', 'Statistica dei decadimenti', 'Radiazione di fondo in ambienti diversi']],
  [/sestante|teodolite/, [TRIANGOLAZIONE, 'Altezza di un edificio', "Latitudine dall'altezza del Sole", 'Distanza di un punto inaccessibile', 'Latitudine dalla stella Polare']],
  [/elioplanetario/, ['Alternarsi delle stagioni', 'Fasi lunari ed eclissi', 'Durata del dì nel corso dell\'anno', 'Fusi orari']],
  [/lamine di materiale/, [CONDUCIBILITA, CONDUTTORI_ISOLANTI, 'Effetto di un dielettrico']],
  [/maschere per cerchi/, ['Rapporto fra circonferenza e diametro', 'Orbite ellittiche e leggi di Keplero']],
  [/olio di ricino/, [STOKES, 'Viscosità e temperatura', LINEE_ELETTRICHE, DENSITA]],
  [/vaschetta circolare/, [LINEE_ELETTRICHE, ELETTROLISI, "Onde sulla superficie dell'acqua"]],
  [/sabbia/, ['Figure di Chladni', 'Angolo di riposo di un materiale granulare']],
  [/^oggetti casalinghi \(pezzetti/, [STROFINIO, CORPI_CARICHI, CONDUTTORI_ISOLANTI]],
  [/^oggetti casalinghi per/, [BARICENTRO, LEVE, 'Effetto Venturi', ATTRITO]],
];

export function esperimentiPredefiniti(nome) {
  const testo = (nome || '').toLowerCase();
  const trovati = REGOLE.filter(([regola]) => regola.test(testo)).flatMap(([, elenco]) => elenco);
  return [...new Set(trovati)].map((nomeEsperimento) => ({ nome: nomeEsperimento, schedaId: null }));
}
