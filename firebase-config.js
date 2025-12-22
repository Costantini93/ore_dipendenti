// Configurazione Firebase - ISTRUZIONI:
// 1. Vai su https://console.firebase.google.com
// 2. Crea un nuovo progetto (es: "gestione-ore-dipendenti")
// 3. Vai su Project Settings (icona ingranaggio)
// 4. Scroll down → trova "Your apps" → click "</>" (Web app)
// 5. Registra app (nome: "Gestione Ore")
// 6. Copia i valori firebaseConfig e incollali qui sotto

// ✅ CONFIGURAZIONE COMPLETA - NON MODIFICARE
const firebaseConfig = {
    apiKey: "AIzaSyCMY_lCojh_wuKdmplgf60ECn1xFWRp2nY",
    authDomain: "gestione-ore-dipendenti.firebaseapp.com",
    databaseURL: "https://gestione-ore-dipendenti-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "gestione-ore-dipendenti",
    storageBucket: "gestione-ore-dipendenti.firebasestorage.app",
    messagingSenderId: "100602228669",
    appId: "1:100602228669:web:c7c0bcc00b5cef916cacd4"
};

// Inizializza Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inizializzato correttamente');
} catch (error) {
    console.error('❌ Errore inizializzazione Firebase:', error);
}

const database = firebase.database();
console.log('✅ Database reference creato');

// Riferimenti database
const dbRef = {
    users: database.ref('users'),
    timeEntries: database.ref('timeEntries'),
    leaveRequests: database.ref('leaveRequests'),
    notifications: database.ref('notifications')
};

console.log('✅ dbRef creato:', dbRef);
