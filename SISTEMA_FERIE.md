# 📅 Sistema Gestione Ferie - Documentazione

## 🎯 Panoramica

Il sistema di gestione ferie include:
- **Calendario annuale** con tutte le festività italiane evidenziate in rosso
- **Richieste ferie** da parte dei dipendenti (periodo continuo o giorni singoli)
- **Approvazioni admin** con gestione differenziata
- **Notifiche push** per tutti gli eventi importanti
- **Detrazione automatica** ore dal saldo ferie
- **Promemoria automatici** per ferie in arrivo e timbrature mancanti

---

## 🏖️ Per i Dipendenti

### Come Richiedere Ferie

1. **Clicca sul pulsante "Richiedi Ferie"** (icona ➕ nella navbar)
2. **Scegli il tipo di richiesta:**
   - **Periodo Continuo**: per ferie consecutive (es: una settimana)
   - **Giorni Singoli**: per giorni sparsi non consecutivi

#### Periodo Continuo
- Seleziona data inizio e data fine
- Il sistema calcola automaticamente i giorni lavorativi (esclusi weekend)
- Specifica le ore per giorno (default: 8h)

#### Giorni Singoli
- Seleziona i singoli giorni dal calendario
- Usa Ctrl/Cmd + Click per selezioni multiple
- Weekend evidenziati in grigio

3. **Aggiungi note opzionali** (es: motivo della richiesta)
4. **Visualizza riepilogo** con:
   - Giorni lavorativi totali
   - Ore totali richieste
   - Saldo ferie residuo attuale
   - Saldo ferie dopo approvazione

5. **Invia richiesta**
   - Riceverai una notifica quando l'admin la processerà
   - Puoi vedere lo stato nel calendario ferie

### Notifiche che Riceverai

- ✅ **Ferie approvate**: quando l'admin approva la tua richiesta
- ❌ **Ferie rifiutate**: se la richiesta viene rifiutata
- ⚠️ **Timbratura mancante**: alle 20:00 se non hai inserito le ore del giorno

---

## 👨‍💼 Per gli Admin

### Calendario Ferie

**Accesso**: Clicca sull'icona calendario ferie (📅) nella navbar

#### Funzionalità
- **Visualizzazione annuale**: tabella con tutti i 12 mesi
- **Festività italiane**: celle rosse con emoji 🎉
- **Weekend**: celle grigie
- **Richieste ferie**: colorate per dipendente con:
  - ⏳ = In attesa
  - ✓ = Approvata
  - ✗ = Rifiutata

#### Legenda Colori
Ogni dipendente ha un colore univoco:
- Alessandro Costantini: Blu (#2196F3)
- Denise Raimondi: Rosa (#E91E63)
- Sandy Oduro: Arancione (#FF9800)
- Luca Avesani: Verde (#4CAF50)
- Sophie Rizzin: Viola (#9C27B0)
- Sofia Bilianska: Azzurro (#00BCD4)

### Approvare/Rifiutare Richieste

Le richieste in attesa appaiono in un box giallo sopra il calendario.

#### Per Periodi Continui
- **"✓ Approva Tutto"**: approva l'intero periodo con un solo click
- **"✗ Rifiuta"**: rifiuta l'intera richiesta

#### Per Giorni Singoli
- **"📋 Approva Singolarmente"**: apre una lista dei giorni
  - Puoi approvare/rifiutare ogni giorno individualmente
  - Oppure "Approva Tutti" con un click
- **"✗ Rifiuta"**: rifiuta tutti i giorni

### Detrazione Ore Automatica

Quando approvi una richiesta:
1. Le ore vengono **automaticamente detratte** dal saldo ferie del dipendente
2. Il calcolo esclude automaticamente i **weekend**
3. Considera le **ore personalizzate** per giorno (es: 4h per mezza giornata)

**Esempio:**
- Richiesta: 10-14 giugno (5 giorni, 8h/giorno)
- Weekend esclusi: 3 giorni lavorativi effettivi
- Detrazione: 3 × 8h = 24h dal saldo ferie

### Notifiche che Riceverai

- 🏖️ **Nuova richiesta ferie**: quando un dipendente fa una richiesta
- 📅 **Promemoria ferie**: 7 giorni prima dell'inizio ferie di un dipendente
- ⚠️ **Timbratura aggiunta**: quando un dipendente inserisce ore lavorative

---

## 🎉 Festività Italiane Incluse

### Fisse
- 1 gennaio: Capodanno
- 6 gennaio: Epifania
- 25 aprile: Festa della Liberazione
- 1 maggio: Festa del Lavoro
- 2 giugno: Festa della Repubblica
- 15 agosto: Ferragosto
- 1 novembre: Tutti i Santi
- 8 dicembre: Immacolata Concezione
- 25 dicembre: Natale
- 26 dicembre: Santo Stefano

### Mobili (calcolate automaticamente)
- Pasqua
- Lunedì dell'Angelo (Pasquetta)

Il sistema calcola automaticamente la Pasqua per ogni anno usando l'**algoritmo di Gauss**.

---

## 🔔 Sistema Notifiche

### Attivazione Notifiche

1. Clicca sull'icona campanella 🔔 nella navbar
2. Autorizza le notifiche nel browser
3. Le notifiche sono ora attive!

### Tipi di Notifiche

#### Per Dipendenti
- **Esito richieste ferie**: approvate/rifiutate
- **Promemoria timbrature**: se mancano ore del giorno prima

#### Per Admin
- **Nuove richieste**: quando un dipendente richiede ferie
- **Promemoria ferie**: 7 giorni prima dell'inizio ferie di un dipendente
- **Timbrature aggiunte**: quando dipendenti inseriscono ore

### Orari Notifiche Automatiche

- **09:00**: Promemoria ferie in arrivo (solo admin)
- **20:00**: Controllo timbrature mancanti (tutti i dipendenti)

---

## 💾 Salvataggio Dati

Tutte le richieste ferie sono salvate in **Firebase Realtime Database**:

```
/leaveRequests/
  ├── req_1234567890_abc123/
  │   ├── userId: "alessandro_costantini"
  │   ├── type: "period"
  │   ├── startDate: "2025-07-01"
  │   ├── endDate: "2025-07-15"
  │   ├── hoursPerDay: 8
  │   ├── status: "approved"
  │   ├── requestDate: "2025-06-15T10:30:00Z"
  │   ├── approvedBy: "alessandro_costantini"
  │   └── approvedDate: "2025-06-15T14:20:00Z"
```

### Stati Richiesta
- `pending`: In attesa di approvazione
- `approved`: Approvata
- `rejected`: Rifiutata

---

## 📱 Responsive Design

Il sistema è completamente **responsive** e funziona su:
- 💻 Desktop
- 📱 Tablet
- 📲 Smartphone

### Ottimizzazioni Mobile
- Calendario scrollabile orizzontalmente
- Pulsanti touch-friendly
- Layout adattivo per schermi piccoli
- Testo ridimensionato automaticamente

---

## 🎨 Personalizzazione

### Colori Dipendenti

Per modificare i colori assegnati ai dipendenti, edita l'oggetto `userColors` in `app.js`:

```javascript
const userColors = {
    'username': '#COLORE_HEX',
    // ...
};
```

### Festività Personalizzate

Per aggiungere festività locali/aziendali, edita l'oggetto `italianHolidays` in `app.js`:

```javascript
const italianHolidays = {
    'MM-DD': 'Nome Festività',
    // ...
};
```

---

## 🔧 Risoluzione Problemi

### Le notifiche non arrivano
1. Verifica che le notifiche siano attivate nel browser
2. Controlla che l'icona campanella sia visibile
3. Ricarica la pagina

### Il calendario non mostra le richieste
1. Controlla la connessione a Firebase
2. Apri la console (F12) per vedere eventuali errori
3. Verifica che l'anno selezionato sia corretto

### La detrazione ore non funziona
1. Assicurati di essere loggato come admin
2. Verifica che il dipendente abbia saldo ferie sufficiente
3. Controlla Firebase per vedere se i dati sono stati salvati

---

## 📊 Statistiche e Report

### Per Admin
Dal calendario ferie puoi vedere:
- Totale richieste in attesa
- Distribuzione ferie per dipendente
- Periodi con più dipendenti assenti
- Saldo ferie residuo di tutti

### Export Excel
Usa il pulsante "Esporta Excel" per:
- Generare report mensili
- Analizzare ore lavorate vs ferie
- Creare report per HR/contabilità

---

## 🚀 Prossimi Sviluppi

Funzionalità future che potrebbero essere aggiunte:
- Export PDF richieste ferie
- Calendario condiviso pubblico (sola lettura)
- Storico completo richieste
- Statistiche avanzate utilizzo ferie
- Previsione saldo ferie fine anno
- Notifiche email oltre che push
- App mobile nativa (iOS/Android)

---

## 💡 Suggerimenti d'Uso

### Best Practices
1. **Richiedi ferie in anticipo**: almeno 1-2 settimane prima
2. **Controlla il saldo**: prima di fare richieste
3. **Aggiungi note**: per comunicare meglio con l'admin
4. **Verifica le festività**: per ottimizzare le ferie

### Per Admin
1. **Processa le richieste tempestivamente**: entro 24-48h
2. **Usa le note**: per comunicare eventuali motivazioni di rifiuto
3. **Monitora il calendario**: per evitare troppi dipendenti assenti insieme
4. **Controlla i promemoria**: per pianificare sostituzioni

---

**Buon lavoro! 🎉**

Per supporto o segnalazione bug, contatta l'amministratore di sistema.
