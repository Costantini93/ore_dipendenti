# Prossime Funzionalità da Implementare

## 4. Cambio Password Utente
- Bottone profilo nella navbar con dropdown
- Modal "Cambia Password" con:
  - Password attuale
  - Nuova password
  - Conferma nuova password
- Validazione e salvataggio su Firebase

## 5. Gestione Utenti per Admin
- Pannello admin dedicato (nuova vista)
- Lista dipendenti con azioni:
  - Reset password (imposta a null per forzare primo accesso)
  - Modifica giorni ferie/ROL residui
  - Aggiungere nuovo dipendente
  - Rimuovere dipendente
- Accessibile solo dall'admin

## 6. Sistema Notifiche Push
- Richiesta permessi notifiche al primo login
- Notifica giornaliera alle 21:00 se non hai inserito ore
- (Per admin) Notifica quando un dipendente modifica ore
- Usa Web Push API + Service Worker

---

**Status**: Funzionalità 1-3 completate e testate!
- Export Excel ✅
- Gestione Ferie/ROL ✅  
- Dark Mode ✅

**Per continuare l'implementazione**, chiedi "continua con cambio password" o "implementa funzionalità 4".
