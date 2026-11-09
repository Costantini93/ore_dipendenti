# Gestione Ore Dipendenti

Web app (PWA) con cui i dipendenti dei locali inseriscono le proprie ore di lavoro, ferie e ROL, e l'amministratore (Alessandro) le controlla, le modifica e le esporta in Excel. Si usa soprattutto da telefono. Lingua dell'interfaccia: italiano.

## Stack e struttura

HTML, CSS e JavaScript semplice, senza build e senza `package.json`. I dati stanno su Firebase Realtime Database (SDK compat 10.7.1 caricato da CDN).

- `index.html`: tutte le schermate in un'unica pagina.
- `app.js`: tutta la logica (circa 2.500 righe). Contiene gli utenti in `DB.users`, il calendario, la tabella dell'amministratore, l'esportazione Excel, le festività italiane, le notifiche e il tema scuro.
- `styles.css`: stile, con i colori come variabili in `:root`. Il tema scuro è la classe `dark-mode` su `<body>`.
- `firebase-config.js`: configurazione del progetto Firebase.
- `service-worker.js` e `manifest.json`: uso offline e installazione come app.
- `PROSSIME_FEATURES.md`: elenco delle funzioni ancora da fare.

File che l'app non usa (nessun riferimento nel codice): `styles_old_backup.css`, `WorkspaceSetupScreen.tsx`, `.expo/`. Non modificarli e chiedi prima di cancellarli.

Il `README.md` è vecchio: parla di una demo con solo `localStorage`, ma oggi i dati stanno su Firebase. Nel browser restano solo il tema scuro, l'utente collegato e le impostazioni delle notifiche.

Per provarla in locale: `python3 -m http.server` nella cartella e apri `http://localhost:8000`. Aprendo `index.html` direttamente il service worker non parte.

## Regole fisse

- Quando cambi o aggiungi un file servito (CSS, JS, immagini), aggiungilo a `urlsToCache` in `service-worker.js` e aumenta `CACHE_NAME`. Senza questo i telefoni continuano a mostrare la versione vecchia.
- Per aggiungere un dipendente segui la sezione Personalizzazione del `README.md` e controlla `populateUserSelect()` in `app.js`.
- Il repository è pubblico. Non scrivere nel codice, nei commenti o nei messaggi di commit chiavi, password o dati personali nuovi dei dipendenti.
- Non cambiare progetto Firebase, regole del database o `firebase-config.js` senza che lo chieda Alessandro.
- Le password dei dipendenti oggi sono salvate e confrontate in chiaro (`user.password === password` in `app.js`). Non aggiungere funzioni che le mostrano, le copiano o le registrano. Se lavori su login o cambio password, proponi prima un sistema più sicuro (Firebase Authentication o un hash) e chiedi conferma a Alessandro.
- Non introdurre framework o strumenti di build senza che lo chieda Alessandro.

## Aspetto attuale e regole di design

L'aspetto attuale è in stile vetro sfumato con gradiente viola e font Inter. Non rifare l'aspetto di schermate esistenti se non te lo chiedono. Per tutto il lavoro nuovo valgono le regole qui sotto. Le sfocature (`backdrop-filter`) e i gradienti già presenti restano finché Alessandro non chiede un restyling.

- **Tipografia:** al massimo tre pesi (400, 500, 600) nel codice nuovo. Corpo 16px, testo secondario 14px, nessun testo sotto 12px. Titoli con interlinea 1.1 a 1.25, testo con 1.5 a 1.6.
- **Colori:** sempre tramite le variabili, sia per il tema chiaro sia per `body.dark-mode`. Il colore da solo non basta mai a comunicare uno stato (ferie, ROL, OFF, errore): aggiungi testo o icona.
- **Niente decorazione nuova:** niente sfocature, niente sfondi sfumati sui pulsanti, niente pillole attorno a testo statico, niente illustrazioni di persone negli stati vuoti.
- **Tocco:** ogni elemento cliccabile è alto almeno 44px.
- **Tastiera e focus:** il contorno di focus resta sempre visibile. Non usare `outline: none` senza un sostituto equivalente.
- **Movimento:** ogni animazione nuova ha la variante `prefers-reduced-motion` (oggi nel CSS non ce n'è nessuna).
- **Form e finestre:** etichetta visibile su ogni campo. Gli errori dicono cosa è successo e come correggerlo, senza dare la colpa a chi scrive. Le azioni che cancellano dati chiedono conferma con il nome di ciò che si cancella.
- **Testi:** pulsanti con il verbo all'inizio ("Salva ore", non "OK" né "Invia"). Un'azione ha lo stesso nome in tutto il percorso. Frasi brevi, in italiano semplice.
- **Telefono prima di tutto:** niente scorrimento orizzontale della pagina da 375px in su. Le tabelle larghe stanno in un contenitore che scorre da solo.

## Skill da usare per il lavoro sull'interfaccia

Sono plugin installati nell'account di Alessandro, non fanno parte del repository, e nelle sessioni cloud o da app possono mancare. Se una skill non è disponibile, applica comunque le regole scritte sopra.

- Prima di costruire o cambiare una schermata: `frontend-design` e `vectorlab-ux-skills:page-patterns`.
- Stile: `vectorlab-ux-skills:typography`, `colour-palette`, `spacing`, `anti-slop`.
- Form e interazione: `forms`, `labels`, `verbs`, `errors`, `empty-states`, `defaults`, `surfaces`, `keyboard`, `icon-buttons`.
- Movimento: `motion`, `transitions`, `reduced-motion`.
- Telefono: `viewports`.
- Prima di chiudere il lavoro: `vectorlab-ux-skills:ux-audit` e `design:accessibility-review`.
- Testi dell'interfaccia: `design:ux-copy`.
- Tabelle e grafici di dati: `dataviz`.

Non servono qui `21st` e `web-artifacts-builder`: lavorano su React e shadcn, che questo progetto non usa.
