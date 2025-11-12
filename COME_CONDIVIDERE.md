# 🌐 Come Condividere il Sito con i Dipendenti

## 📱 Opzione 1: Rete WiFi Locale (GRATIS - Ideale per Test)

### Requisiti:
- Tutti sulla stessa rete WiFi
- Python installato sul tuo PC (o VS Code con Live Server)

### Passaggi:

1. **Avvia il server:**
   - Fai doppio click su `AVVIA_SERVER.bat`
   - Oppure in VS Code: Right click su `index.html` → "Open with Live Server"

2. **Trova l'indirizzo IP:**
   - Il batch file lo mostra automaticamente (es: `http://192.168.1.100:8080`)
   - Oppure: `Win + R` → digita `cmd` → scrivi `ipconfig` → cerca "IPv4"

3. **Condividi con i dipendenti:**
   - Manda loro l'indirizzo IP (es: `http://192.168.1.100:8080`)
   - Aprono dal browser del telefono
   - Fatto! ✅

### ⚠️ Limiti:
- Funziona solo sulla stessa WiFi
- Se spegni il PC, il sito non è più accessibile

---

## ☁️ Opzione 2: Hosting Gratuito Online (CONSIGLIATO)

### A) **GitHub Pages** (Gratuito, Facile)

1. Crea account su [github.com](https://github.com)
2. Crea un nuovo repository pubblico
3. Carica i file: `index.html`, `styles.css`, `app.js`
4. Vai su Settings → Pages → Deploy from `main` branch
5. Il tuo sito sarà su: `https://tuousername.github.io/nome-repo`

**Pro:** Gratuito, veloce, accessibile da ovunque
**Contro:** Pubblico (chiunque può accedere con il link)

### B) **Netlify** (Gratuito, Professionale)

1. Vai su [netlify.com](https://netlify.com)
2. Drag & drop la cartella nel sito
3. Ottieni un link tipo: `https://gestione-ore-xyz.netlify.app`

**Pro:** Gratuito, HTTPS automatico, può essere protetto con password
**Contro:** Richiede registrazione

### C) **Vercel** (Gratuito, Velocissimo)

1. Vai su [vercel.com](https://vercel.com)
2. Importa da GitHub o carica i file
3. Deploy automatico

---

## 🔐 Opzione 3: Hosting con Backend (Per Produzione)

Per uso reale a lungo termine, ti serve:
- **Database vero** (MySQL, PostgreSQL)
- **Backend** (Node.js, PHP, Python)
- **Hosting** (AWS, DigitalOcean, Hostinger)

Costo: €5-20/mese

---

## 🎯 Consiglio per ORA:

1. **Per testare subito (oggi):**
   - Usa `AVVIA_SERVER.bat` se siete in ufficio sulla stessa WiFi
   
2. **Per condividere da remoto (5 minuti):**
   - Usa Netlify (trascina la cartella, fatto!)

3. **Per uso definitivo:**
   - Considera un hosting professionale con database

---

## 📞 Hai bisogno di aiuto?

Dimmi quale opzione preferisci e ti guido passo passo! 🚀
