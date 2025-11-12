# 🔥 Guida Setup Firebase per Sincronizzazione Dati

## 🎯 Perché Firebase?

**Problema:** localStorage salva dati solo sul dispositivo locale. Ogni utente vede solo i suoi dati.

**Soluzione:** Firebase = database cloud gratuito che sincronizza i dati in tempo reale tra tutti gli utenti!

---

## 📋 STEP 1: Crea Progetto Firebase (5 minuti)

1. **Vai su:** [console.firebase.google.com](https://console.firebase.google.com)

2. **Accedi** con il tuo account Google (o creane uno)

3. **Click su "Aggiungi progetto"** (o "Add project")

4. **Nome progetto:** `gestione-ore-dipendenti` (o come vuoi)
   - Click "Continua"

5. **Google Analytics:** 
   - Puoi disattivarlo (non serve)
   - Click "Crea progetto"

6. **Aspetta** 30 secondi che venga creato

7. **Click "Continua"** quando è pronto

---

## ⚙️ STEP 2: Configura Realtime Database

1. Nel menu a sinistra, click su **"Realtime Database"** (icona fulmine)

2. Click su **"Crea database"**

3. **Posizione:** Scegli `europe-west1` (più vicina a noi)

4. **Regole di sicurezza:** 
   - Per ora scegli **"Modalità test"** (temporaneo)
   - Click "Attiva"

5. Il database è stato creato! ✅

---

## 🔐 STEP 3: Configura Regole di Sicurezza (IMPORTANTE!)

1. Nel database, vai sulla tab **"Regole"**

2. **Sostituisci** il contenuto con questo:

```json
{
  "rules": {
    "users": {
      ".read": false,
      ".write": false
    },
    "timeEntries": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click **"Pubblica"**

⚠️ **Nota:** Queste regole permettono a tutti di leggere/scrivere. Per produzione, aggiungi autenticazione Firebase!

---

## 🌐 STEP 4: Ottieni Configurazione Web

1. Torna alla **panoramica progetto** (click sull'icona casa in alto)

2. Click sull'icona **"</>"** (Web app) 

3. **Registra app:**
   - Nome: `Gestione Ore Web`
   - **NON** selezionare "Firebase Hosting"
   - Click "Registra app"

4. **Copia la configurazione!** Vedrai un codice tipo:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "gestione-ore-xxxx.firebaseapp.com",
  databaseURL: "https://gestione-ore-xxxx.firebaseio.com",
  projectId: "gestione-ore-xxxx",
  storageBucket: "gestione-ore-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijk"
};
```

5. **COPIA** questi valori!

---

## 📝 STEP 5: Incolla Configurazione nel Codice

1. Apri il file **`firebase-config.js`**

2. **Sostituisci** i valori finti con quelli veri che hai copiato:

```javascript
const firebaseConfig = {
    apiKey: "INCOLLA_QUI_IL_TUO_API_KEY",
    authDomain: "INCOLLA_QUI_IL_TUO_AUTH_DOMAIN",
    databaseURL: "INCOLLA_QUI_IL_TUO_DATABASE_URL",
    projectId: "INCOLLA_QUI_IL_TUO_PROJECT_ID",
    storageBucket: "INCOLLA_QUI_IL_TUO_STORAGE_BUCKET",
    messagingSenderId: "INCOLLA_QUI_IL_TUO_SENDER_ID",
    appId: "INCOLLA_QUI_IL_TUO_APP_ID"
};
```

3. **Salva** il file

---

## 🚀 STEP 6: Carica su GitHub e Testa!

1. **Carica i file aggiornati** su GitHub:
   - `index.html` (modificato)
   - `app.js` (modificato)
   - `firebase-config.js` (NUOVO - con la tua config!)
   - `styles.css` (invariato)

2. **Aspetta 2-3 minuti** che GitHub Pages aggiorni

3. **Testa:**
   - Apri il sito dal tuo telefono
   - Inserisci ore come dipendente
   - Apri il sito dal tuo PC (admin)
   - **Dovresti vedere le ore inserite!** 🎉

---

## ✅ Come Verificare che Funziona

1. Vai su [console.firebase.google.com](https://console.firebase.google.com)
2. Apri il tuo progetto
3. Vai su "Realtime Database"
4. Dovresti vedere apparire i dati mentre gli utenti li inseriscono!

Esempio:
```
timeEntries
  └─ denise.raimondi
      └─ 2025-11-12
          ├─ type: "work"
          ├─ startTime: "09:00"
          ├─ endTime: "17:00"
          └─ hours: 8
```

---

## 🔒 Prossimi Passi per Sicurezza (Opzionale)

Per proteggere i dati:

1. **Aggiungi Firebase Authentication**
2. **Modifica le regole** per permettere solo agli utenti autenticati
3. **Nascondi la config** usando variabili d'ambiente

Per ora va bene così per testing! 🎯

---

## ⚠️ Piano Gratuito Firebase

- ✅ **100 GB/mese** di dati scaricati
- ✅ **Unlimited** connessioni simultanee
- ✅ **1 GB** di spazio database

Perfetto per 5-10 dipendenti! 👥

---

## 🆘 Problemi?

### "Errore nel salvare i dati"
- Controlla di aver copiato correttamente la config
- Verifica che il `databaseURL` sia corretto
- Controlla le regole del database

### "I dati non si sincronizzano"
- Svuota cache del browser (CTRL + F5)
- Controlla Console errori (F12 → Console)
- Verifica connessione internet

### "Permission denied"
- Controlla le regole del database
- Assicurati di aver pubblicato le regole

---

## 📞 Serve Aiuto?

Fammi sapere a che step sei e ti guido! 🚀
