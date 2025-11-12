# 🕐 Sistema di Gestione Ore Dipendenti

Applicazione web moderna e intuitiva per la gestione delle ore lavorative dei dipendenti.

## ✨ Funzionalità

### 👤 Per i Dipendenti
- **Login sicuro** con credenziali personali
- **Visualizzazione calendario mensile** con navigazione mese per mese
- **Inserimento ore** con:
  - Orario di inizio e fine turno
  - Calcolo automatico delle ore giornaliere
  - Opzioni per giorni OFF, Ferie e ROL
- **Riepilogo mensile** con:
  - Totale ore lavorate
  - Giorni lavorativi
  - Giorni di ferie
  - Giorni ROL
- **Limitazione modifiche**: una volta inserite, le ore devono essere modificate dall'admin

### 👨‍💼 Per l'Amministratore
- **Accesso completo** a tutti i dipendenti
- **Modifica ore** di qualsiasi dipendente
- **Selezione dipendente** per visualizzare e modificare i loro dati
- **Tutte le funzionalità** dei dipendenti

## 🚀 Come Utilizzare

1. **Apri il file `index.html`** nel tuo browser
2. **Effettua il login** con il tuo username (formato nome.cognome):

   **Amministratore:**
   - Username: `alessandro.costantini`

   **Dipendenti:**
   - Username: `denise.raimondi`
   - Username: `sandy.oduro`
   - Username: `luca.avesani`
   - Username: `sophie.rizzin`
   - Username: `sofia.bilianska`

3. **Al primo accesso**, ti verrà chiesto di impostare una password personale
4. **Naviga** tra i mesi usando le frecce
5. **Clicca su un giorno** per inserire le ore
6. **Seleziona il tipo di giornata**:
   - **Lavoro**: inserisci orario inizio/fine
   - **OFF**: giorno libero (0 ore)
   - **Ferie**: giorno di ferie
   - **ROL**: riduzione orario di lavoro

## 🎨 Design

- **Design moderno** con gradiente viola
- **Interfaccia intuitiva** e facile da usare
- **Responsive** per dispositivi mobili
- **Animazioni fluide** per una migliore esperienza utente
- **Colori distintivi** per i diversi tipi di giornata

## 💾 Salvataggio Dati

I dati vengono salvati automaticamente nel **localStorage** del browser, quindi rimangono disponibili anche dopo aver chiuso la pagina.

## 🔧 Tecnologie Utilizzate

- **HTML5** per la struttura
- **CSS3** con variabili custom e gradients
- **JavaScript** vanilla per la logica
- **Google Fonts** (Inter) per la tipografia

## 📝 Note Importanti

- Questa è una versione **demo/frontend only**
- Per l'uso in produzione, è necessario implementare:
  - Backend con database reale (MySQL, PostgreSQL, MongoDB)
  - Sistema di autenticazione sicuro
  - API REST per la gestione dei dati
  - Backup e sicurezza dei dati

## 🛠️ Personalizzazione

Per aggiungere nuovi dipendenti, modifica l'oggetto `DB.users` nel file `app.js`:

```javascript
DB.users['nome.cognome'] = {
    username: 'nome.cognome',
    password: null, // null = primo accesso
    name: 'Nome Cognome',
    role: 'employee'
};
```

Ricordati di aggiungere anche il nuovo dipendente nella select dell'admin in `index.html`.

## 📱 Compatibilità

- ✅ Chrome/Edge (consigliato)
- ✅ Firefox
- ✅ Safari
- ✅ Dispositivi mobili

---

**Sviluppato con ❤️ per una gestione efficiente del tempo lavorativo**
