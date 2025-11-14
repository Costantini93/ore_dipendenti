// Database simulato (in produzione usare un database reale)
const DB = {
    users: {
        'alessandro_costantini': {
            username: 'alessandro_costantini',
            password: null, // null = primo accesso
            name: 'Alessandro Costantini',
            role: 'admin',
            ferieResidue: 208, // Ore di ferie disponibili (26 giorni x 8 ore)
            rolResidui: 120    // Ore di ROL disponibili (15 giorni x 8 ore)
        },
        'denise_raimondi': {
            username: 'denise_raimondi',
            password: null,
            name: 'Denise Raimondi',
            role: 'employee',
            ferieResidue: 208, // 26 giorni x 8 ore
            rolResidui: 120    // 15 giorni x 8 ore
        },
        'sandy_oduro': {
            username: 'sandy_oduro',
            password: null,
            name: 'Sandy Oduro',
            role: 'employee',
            ferieResidue: 208,
            rolResidui: 120
        },
        'luca_avesani': {
            username: 'luca_avesani',
            password: null,
            name: 'Luca Avesani',
            role: 'employee',
            ferieResidue: 208,
            rolResidui: 120
        },
        'sophie_rizzin': {
            username: 'sophie_rizzin',
            password: null,
            name: 'Sophie Rizzin',
            role: 'employee',
            ferieResidue: 208,
            rolResidui: 120
        },
        'sofia_bilianska': {
            username: 'sofia_bilianska',
            password: null,
            name: 'Sofia Bilianska',
            role: 'employee',
            ferieResidue: 208,
            rolResidui: 120
        }
    },
    timeEntries: {} // Formato: { username: { 'YYYY-MM-DD': { type, startTime, endTime, hours } } }
};

// Stato dell'applicazione
let currentUser = null;
let currentDate = new Date();
let selectedUser = null; // Per l'admin
let currentView = 'calendar'; // 'calendar' o 'table'

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
    await loadDataFromStorage();
    await checkAndAddMonthlyLeave();
    
    // Carica preferenza dark mode
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
    
    // Controlla se c'è un utente salvato (auto-login)
    const savedUsername = localStorage.getItem('loggedUser');
    if (savedUsername && DB.users[savedUsername]) {
        currentUser = DB.users[savedUsername];
        selectedUser = savedUsername;
        showPage('appPage');
        initializeApp();
    }
    
    initLoginForm();
    initApp();
});

// Carica dati da Firebase
async function loadDataFromStorage() {
    // Carica password e contatori ferie/ROL da Firebase
    if (typeof firebase !== 'undefined') {
        try {
            const snapshot = await dbRef.users.once('value');
            const data = snapshot.val();
            if (data) {
                Object.keys(data).forEach(username => {
                    if (DB.users[username]) {
                        if (data[username].password !== undefined) {
                            DB.users[username].password = data[username].password;
                        }
                        if (data[username].ferieResidue !== undefined) {
                            DB.users[username].ferieResidue = data[username].ferieResidue;
                        }
                        if (data[username].rolResidui !== undefined) {
                            DB.users[username].rolResidui = data[username].rolResidui;
                        }
                    }
                });
            }
            console.log('✅ Password caricate da Firebase');
        } catch (error) {
            console.error('❌ Errore caricamento password:', error);
        }
        
        // Carica timeEntries da Firebase con listener real-time
        dbRef.timeEntries.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                DB.timeEntries = data;
                // Aggiorna UI se necessario
                if (currentUser && currentView === 'calendar') {
                    renderCalendar();
                    updateMonthlySummary();
                } else if (currentUser && currentView === 'table') {
                    renderEmployeeTable();
                }
            }
        });
    }
}

// Salva dati in Firebase
function saveDataToStorage() {
    // Salva password e contatori ferie/ROL su Firebase
    if (typeof firebase !== 'undefined' && dbRef) {
        const usersToSave = {};
        Object.keys(DB.users).forEach(username => {
            usersToSave[username] = {
                password: DB.users[username].password,
                ferieResidue: DB.users[username].ferieResidue || 208, // 26 giorni x 8 ore
                rolResidui: DB.users[username].rolResidui || 120      // 15 giorni x 8 ore
            };
        });
        
        console.log('💾 Salvataggio users su Firebase:', usersToSave);
        dbRef.users.set(usersToSave).then(() => {
            console.log('✅ Users salvati correttamente su Firebase');
        }).catch((error) => {
            console.error('❌ Errore salvataggio password Firebase:', error);
        });
        
        // Salva timeEntries su Firebase e ritorna una Promise
        return dbRef.timeEntries.set(DB.timeEntries).catch((error) => {
            console.error('Errore salvataggio Firebase:', error);
            alert('Errore nel salvare i dati. Controlla la connessione internet.');
        });
    }
    
    return Promise.resolve();
}

// Controllo e aggiunta ore mensili ferie
async function checkAndAddMonthlyLeave() {
    const usersWithMonthlyLeave = ['alessandrocostantini', 'lucaavesani', 'deniseraimondi'];
    const monthlyFerieHours = 17.36;
    const monthlyRolHours = 8.67;
    
    try {
        // Ottieni l'ultimo mese processato
        const lastProcessedSnapshot = await database.ref('lastMonthlyLeaveUpdate').once('value');
        const lastProcessed = lastProcessedSnapshot.val();
        
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Se non è stato ancora processato questo mese
        if (lastProcessed !== currentMonthKey) {
            console.log('🔄 Aggiunta ore mensili ferie e ROL...');
            
            for (const username of usersWithMonthlyLeave) {
                if (DB.users[username]) {
                    const currentFerie = DB.users[username].ferieResidue || 0;
                    const newFerie = currentFerie + monthlyFerieHours;
                    
                    const currentRol = DB.users[username].rolResidui || 0;
                    const newRol = currentRol + monthlyRolHours;
                    
                    // Aggiorna Firebase
                    await database.ref(`users/${username}`).update({
                        ferieResidue: newFerie,
                        rolResidui: newRol
                    });
                    
                    // Aggiorna DB locale
                    DB.users[username].ferieResidue = newFerie;
                    DB.users[username].rolResidui = newRol;
                    
                    console.log(`✅ ${username}: Ferie +${monthlyFerieHours}h (${currentFerie} → ${newFerie}), ROL +${monthlyRolHours}h (${currentRol} → ${newRol})`);
                }
            }
            
            // Salva l'ultimo mese processato
            await database.ref('lastMonthlyLeaveUpdate').set(currentMonthKey);
            console.log('✅ Ore mensili aggiunte con successo!');
        }
    } catch (error) {
        console.error('❌ Errore aggiunta ore mensili:', error);
    }
}


// Login Form
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginFooter = document.getElementById('loginFooter');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.toLowerCase().trim();
        const password = document.getElementById('password').value;

        const user = DB.users[username];
        
        if (!user) {
            loginError.textContent = 'Username non trovato';
            loginError.classList.add('show');
            // Mostra il footer solo se l'utente non esiste (possibile primo accesso)
            loginFooter.style.display = 'block';
            return;
        }

        // Primo accesso - nessuna password impostata
        if (user.password === null) {
            currentUser = user;
            showFirstTimeModal();
            loginError.classList.remove('show');
            loginFooter.style.display = 'none'; // Nascondi il footer
            return;
        }

        // Login normale con password
        if (user.password === password) {
            currentUser = user;
            selectedUser = username; // Tutti partono visualizzando se stessi
            localStorage.setItem('loggedUser', username); // Salva per auto-login
            showPage('appPage');
            initializeApp();
            loginError.classList.remove('show');
            loginFooter.style.display = 'none'; // Nascondi il footer
        } else {
            loginError.textContent = 'Password errata';
            loginError.classList.add('show');
            loginFooter.style.display = 'none'; // Nascondi il footer se la password è errata
        }
    });

    // First time password form
    const firstTimeForm = document.getElementById('firstTimeForm');
    const passwordError = document.getElementById('passwordError');

    firstTimeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            passwordError.textContent = 'Le password non coincidono';
            passwordError.classList.add('show');
            return;
        }

        if (newPassword.length < 4) {
            passwordError.textContent = 'La password deve essere di almeno 4 caratteri';
            passwordError.classList.add('show');
            return;
        }

        // Salva la nuova password
        DB.users[currentUser.username].password = newPassword;
        localStorage.setItem('loggedUser', currentUser.username); // Salva per auto-login
        saveDataToStorage().then(() => {
            // Chiudi modal e vai all'app
            closeFirstTimeModal();
            selectedUser = currentUser.username; // Tutti partono visualizzando se stessi
            showPage('appPage');
            initializeApp();
            passwordError.classList.remove('show');
        });
    });
}

// Mostra/nascondi pagine
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Modal primo accesso
function showFirstTimeModal() {
    const modal = document.getElementById('firstTimeModal');
    modal.classList.add('show');
    document.getElementById('firstTimeForm').reset();
    document.getElementById('passwordError').classList.remove('show');
}

function closeFirstTimeModal() {
    document.getElementById('firstTimeModal').classList.remove('show');
}

// Inizializza l'app principale
function initApp() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        currentUser = null;
        selectedUser = null;
        localStorage.removeItem('loggedUser'); // Rimuovi auto-login
        showPage('loginPage');
        document.getElementById('loginForm').reset();
    });

    // Change Password
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');

    changePasswordBtn.addEventListener('click', () => {
        changePasswordModal.style.display = 'flex';
        changePasswordForm.reset();
    });

    closePasswordModal.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
    });

    cancelPasswordBtn.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
    });

    // Users Management Modal
    const usersManagementBtn = document.getElementById('usersManagementBtn');
    const adminUserManagement = document.getElementById('adminUserManagement');
    const closeUsersModal = document.getElementById('closeUsersModal');

    if (usersManagementBtn) {
        usersManagementBtn.addEventListener('click', () => {
            adminUserManagement.style.display = 'flex';
        });
    }

    if (closeUsersModal) {
        closeUsersModal.addEventListener('click', () => {
            adminUserManagement.style.display = 'none';
        });
    }

    // Chiudi modal cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target === adminUserManagement) {
            adminUserManagement.style.display = 'none';
        }
    });

    // Holidays Modal
    const holidaysBtn = document.getElementById('holidaysBtn');
    const holidaysModal = document.getElementById('holidaysModal');
    const closeHolidaysModal = document.getElementById('closeHolidaysModal');
    const holidayYearSelect = document.getElementById('holidayYearSelect');

    if (holidaysBtn) {
        holidaysBtn.addEventListener('click', () => {
            const currentYear = new Date().getFullYear();
            holidayYearSelect.value = currentYear;
            renderHolidaysList(currentYear);
            holidaysModal.style.display = 'flex';
        });
    }

    if (closeHolidaysModal) {
        closeHolidaysModal.addEventListener('click', () => {
            holidaysModal.style.display = 'none';
        });
    }

    if (holidayYearSelect) {
        holidayYearSelect.addEventListener('change', (e) => {
            renderHolidaysList(parseInt(e.target.value));
        });
    }

    // Chiudi holidays modal cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target === holidaysModal) {
            holidaysModal.style.display = 'none';
        }
    });

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validazione
        if (newPassword.length < 4) {
            alert('La nuova password deve contenere almeno 4 caratteri');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Le password non coincidono');
            return;
        }

        // Verifica password attuale
        if (DB.users[currentUser].password !== currentPassword) {
            alert('Password attuale errata');
            return;
        }

        // Aggiorna password in Firebase
        try {
            await database.ref(`users/${currentUser}`).update({
                password: newPassword
            });

            DB.users[currentUser].password = newPassword;
            alert('Password cambiata con successo!');
            changePasswordModal.style.display = 'none';
            changePasswordForm.reset();
        } catch (error) {
            console.error('Errore cambio password:', error);
            alert('Errore durante il cambio password');
        }
    });

    // User Management (Admin only)
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('userModal');
    const closeUserModal = document.getElementById('closeUserModal');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const userForm = document.getElementById('userForm');

    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            document.getElementById('userModalTitle').textContent = 'Aggiungi Utente';
            document.getElementById('editUserId').value = '';
            userForm.reset();
            document.getElementById('userUsername').disabled = false;
            document.getElementById('userPassword').required = true;
            document.getElementById('userPassword').placeholder = '';
            userModal.style.display = 'flex';
        });
    }

    if (closeUserModal) {
        closeUserModal.addEventListener('click', () => {
            userModal.style.display = 'none';
        });
    }

    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', () => {
            userModal.style.display = 'none';
        });
    }

    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const editUserId = document.getElementById('editUserId').value;
            const username = document.getElementById('userUsername').value.toLowerCase().trim();
            const name = document.getElementById('userName').value.trim();
            const password = document.getElementById('userPassword').value;
            const role = document.getElementById('userRole').value;
            const ferieResidue = parseFloat(document.getElementById('userFerie').value);
            const rolResidui = parseFloat(document.getElementById('userRol').value);

            // Validazione username univoco (solo per nuovi utenti)
            if (!editUserId && DB.users[username]) {
                alert('Username già esistente. Scegli un altro username.');
                return;
            }

            const userData = {
                name,
                role,
                ferieResidue,
                rolResidui
            };

            // Aggiungi password solo se è un nuovo utente o se è stata cambiata
            if (!editUserId) {
                // Nuovo utente - password obbligatoria
                if (!password) {
                    alert('La password è obbligatoria per i nuovi utenti');
                    return;
                }
                userData.password = password;
            } else if (password) {
                // Utente esistente - password opzionale
                userData.password = password;
            }

            try {
                const targetUsername = editUserId || username;
                
                // Per utenti esistenti, mantieni la password corrente se non è stata modificata
                if (editUserId && !password && DB.users[targetUsername]) {
                    userData.password = DB.users[targetUsername].password;
                }
                
                console.log('Tentativo di salvataggio:', targetUsername, userData);
                await database.ref(`users/${targetUsername}`).update(userData);
                console.log('Salvataggio completato con successo');
                
                // Aggiorna DB locale
                if (!DB.users[targetUsername]) {
                    DB.users[targetUsername] = {};
                }
                Object.assign(DB.users[targetUsername], userData);
                if (!editUserId) {
                    DB.users[targetUsername].username = targetUsername;
                }

                // Aggiorna lista utenti se admin
                if (currentUser.role === 'admin') {
                    renderUsersList();
                }

                alert(editUserId ? 'Utente aggiornato con successo!' : 'Utente creato con successo!');
                userModal.style.display = 'none';
                userForm.reset();
            } catch (error) {
                console.error('Errore salvataggio utente:', error);
                console.error('Dettagli errore:', error.message, error.code);
                alert('Errore durante il salvataggio: ' + error.message);
            }
        });
    }

    // Navigazione mesi
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        if (currentView === 'calendar') {
            renderCalendar();
        } else {
            renderEmployeeTable();
        }
        updateMonthDisplay();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        if (currentView === 'calendar') {
            renderCalendar();
        } else {
            renderEmployeeTable();
        }
        updateMonthDisplay();
    });

    // Dark Mode Toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Notifications Toggle
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', requestNotificationPermission);
    }

    // Selezione utente per admin
    document.getElementById('userSelect').addEventListener('change', (e) => {
        selectedUser = e.target.value;
        updateLeaveBalance(); // Aggiorna contatori quando cambia utente
        renderCalendar();
        updateMonthlySummary();
    });

    // View Toggle
    document.getElementById('calendarViewBtn').addEventListener('click', () => {
        switchView('calendar');
    });

    document.getElementById('tableViewBtn').addEventListener('click', () => {
        switchView('table');
    });

    // Export Excel
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);

    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('timeModal').addEventListener('click', (e) => {
        if (e.target.id === 'timeModal') closeModal();
    });

    // Time Form
    initTimeForm();
}

function initializeApp() {
    // Mostra nome utente
    document.getElementById('userDisplay').textContent = currentUser.name;

    // Mostra/nascondi selezione admin e toggle vista
    if (currentUser.role === 'admin') {
        document.getElementById('adminUserSelection').style.display = 'flex';
        document.getElementById('viewToggle').style.display = 'flex';
        document.getElementById('exportExcelBtn').style.display = 'inline-flex';
        document.getElementById('usersManagementBtn').style.display = 'inline-flex';
        renderUsersList();
        // Admin parte visualizzando se stesso
        selectedUser = currentUser.username;
        document.getElementById('userSelect').value = currentUser.username;
    } else {
        document.getElementById('adminUserSelection').style.display = 'none';
        document.getElementById('viewToggle').style.display = 'none';
        document.getElementById('usersManagementBtn').style.display = 'none';
    }

    // Mostra balance ferie/ROL
    document.getElementById('leaveBalance').style.display = 'flex';
    updateLeaveBalance();

    // Inizializza notifiche
    initNotifications();

    switchView('calendar');
}

// Aggiorna balance ferie/ROL
function updateLeaveBalance() {
    const user = DB.users[selectedUser];
    const ferieOre = user.ferieResidue || 0;
    const ferieGiorni = (ferieOre / 8).toFixed(1); // Converti ore in giorni
    document.getElementById('ferieResidue').textContent = `${ferieGiorni} gg`;
    document.getElementById('rolResidui').textContent = `${user.rolResidui || 0}h`;
}

// Render users list for admin
function renderUsersList() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    usersList.innerHTML = '';
    
    Object.keys(DB.users).forEach(username => {
        const user = DB.users[username];
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const ferieGiorni = ((user.ferieResidue || 0) / 8).toFixed(1);
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${initials}</div>
                <div class="user-details">
                    <div class="user-name">
                        ${user.name}
                        <span class="user-badge badge-${user.role}">${user.role === 'admin' ? 'Admin' : 'Dipendente'}</span>
                    </div>
                    <div class="user-meta">
                        @${username} • Ferie: ${ferieGiorni}gg • ROL: ${user.rolResidui || 0}h
                    </div>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn-icon-small edit" onclick="editUser('${username}')" title="Modifica">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="btn-icon-small reset" onclick="resetUserPassword('${username}')" title="Reset Password">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="btn-icon-small delete" onclick="deleteUser('${username}')" title="Elimina">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

// Edit user
async function editUser(username) {
    const user = DB.users[username];
    document.getElementById('userModalTitle').textContent = 'Modifica Utente';
    document.getElementById('editUserId').value = username;
    document.getElementById('userName').value = user.name;
    document.getElementById('userUsername').value = username;
    document.getElementById('userUsername').disabled = true;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').disabled = false;
    document.getElementById('userPassword').required = false;
    document.getElementById('userPassword').placeholder = 'Lascia vuoto per mantenere';
    document.getElementById('userRole').value = user.role;
    
    // Usa i valori esatti senza arrotondamenti
    document.getElementById('userFerie').value = user.ferieResidue || 208;
    document.getElementById('userFerie').disabled = false;
    document.getElementById('userRol').value = user.rolResidui || 120;
    document.getElementById('userRol').disabled = false;
    document.getElementById('userModal').style.display = 'flex';
}

// Delete user
async function deleteUser(username) {
    if (username === currentUser.username) {
        alert('Non puoi eliminare il tuo account mentre sei loggato!');
        return;
    }

    if (!confirm(`Sei sicuro di voler eliminare l'utente ${DB.users[username].name}?\nQuesta azione è irreversibile!`)) {
        return;
    }

    try {
        await database.ref(`users/${username}`).remove();
        await database.ref(`timeEntries/${username}`).remove();
        delete DB.users[username];
        delete DB.timeEntries[username];
        
        populateUserSelect();
        renderUsersList();
        alert('Utente eliminato con successo!');
    } catch (error) {
        console.error('Errore eliminazione utente:', error);
        alert('Errore durante l\'eliminazione');
    }
}

// Reset user password
async function resetUserPassword(username) {
    const newPassword = prompt(`Inserisci la nuova password per ${DB.users[username].name}:`);
    if (!newPassword) return;

    if (newPassword.length < 4) {
        alert('La password deve contenere almeno 4 caratteri');
        return;
    }

    try {
        await database.ref(`users/${username}`).update({
            password: newPassword
        });
        DB.users[username].password = newPassword;
        alert('Password resettata con successo!');
    } catch (error) {
        console.error('Errore reset password:', error);
        alert('Errore durante il reset password');
    }
}

// Aggiorna display del mese
function updateMonthDisplay() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
}

// Cambia vista
function switchView(view) {
    currentView = view;
    
    const calendarView = document.getElementById('calendarView');
    const tableView = document.getElementById('tableView');
    const calendarBtn = document.getElementById('calendarViewBtn');
    const tableBtn = document.getElementById('tableViewBtn');
    const adminSection = document.getElementById('adminUserSelection');
    const monthlySummary = document.querySelector('.monthly-summary');
    
    if (view === 'calendar') {
        calendarView.classList.add('active');
        tableView.classList.remove('active');
        calendarBtn.classList.add('active');
        tableBtn.classList.remove('active');
        // Mostra dropdown solo se admin
        adminSection.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
        monthlySummary.style.display = 'grid';
        renderCalendar();
    } else {
        calendarView.classList.remove('active');
        tableView.classList.add('active');
        calendarBtn.classList.remove('active');
        tableBtn.classList.add('active');
        adminSection.style.display = 'none';
        monthlySummary.style.display = 'none';
        renderEmployeeTable();
    }
}

// Render calendario
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Aggiorna titolo
    updateMonthDisplay();

    // Calcola giorni del mese
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lunedì = 0

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // Header giorni della settimana
    const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.style.cssText = 'font-weight: 700; text-align: center; padding: 0.5rem; color: var(--text-secondary);';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Giorni vuoti prima del primo giorno
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell other-month';
        grid.appendChild(emptyCell);
    }

    // Giorni del mese
    const viewingUser = currentUser.role === 'admin' ? selectedUser : currentUser.username;
    const userEntries = DB.timeEntries[viewingUser] || {};

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = userEntries[dateStr];

        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.dataset.date = dateStr;

        // Aggiungi classe se ha dati
        if (entry) {
            if (entry.type === 'work') cell.classList.add('has-work');
            if (entry.type === 'off') cell.classList.add('has-off');
            if (entry.type === 'ferie') cell.classList.add('has-holiday');
            if (entry.type === 'rol') cell.classList.add('has-rol');
        }

        // Numero giorno
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // Info giorno
        const dayInfo = document.createElement('div');
        dayInfo.className = 'day-info';

        if (entry) {
            if (entry.type === 'work') {
                const hours = document.createElement('div');
                hours.className = 'day-hours';
                hours.textContent = `${entry.hours.toFixed(2)}h`;
                dayInfo.appendChild(hours);

                const time = document.createElement('div');
                time.className = 'day-time';
                time.innerHTML = `${entry.startTime}<br>-<br>${entry.endTime}`;
                dayInfo.appendChild(time);
            } else {
                const type = document.createElement('div');
                type.className = `day-type ${entry.type}`;
                type.textContent = entry.type.toUpperCase();
                dayInfo.appendChild(type);
            }
        }

        cell.appendChild(dayInfo);

        // Click handler
        cell.addEventListener('click', () => openTimeModal(dateStr, entry));

        grid.appendChild(cell);
    }

    updateMonthlySummary();
}

// Apri modal per inserimento ore
function openTimeModal(dateStr, existingEntry) {
    // Controlla permessi
    const viewingUser = currentUser.role === 'admin' ? selectedUser : currentUser.username;
    
    // Se non è admin e sta cercando di vedere/modificare ore di altri
    if (currentUser.role !== 'admin' && viewingUser !== currentUser.username) {
        alert('Non hai i permessi per modificare le ore di altri dipendenti.');
        return;
    }
    
    // Se non è admin e ci sono già dati, mostra messaggio
    if (currentUser.role !== 'admin' && existingEntry) {
        alert('Non puoi modificare ore già inserite. Contatta l\'amministratore per le modifiche.');
        return;
    }

    const modal = document.getElementById('timeModal');
    const form = document.getElementById('timeForm');
    
    document.getElementById('selectedDate').value = dateStr;
    
    const date = new Date(dateStr + 'T12:00:00');
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
                        'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    
    document.getElementById('modalTitle').textContent = 
        `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;

    // Popola form se esiste entry
    if (existingEntry) {
        document.querySelector(`input[name="dayType"][value="${existingEntry.type}"]`).checked = true;
        if (existingEntry.type === 'work') {
            document.getElementById('startTime').value = existingEntry.startTime;
            document.getElementById('endTime').value = existingEntry.endTime;
            updateCalculatedHours();
        }
    } else {
        form.reset();
        document.querySelector('input[name="dayType"][value="work"]').checked = true;
    }

    toggleTimeInputs();
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('timeModal');
    modal.classList.remove('show');
    document.getElementById('timeForm').reset();
    
    // Ripristina il tipo default a "work"
    document.querySelector('input[name="dayType"][value="work"]').checked = true;
    toggleTimeInputs();
}

// Gestione form inserimento ore
function initTimeForm() {
    const form = document.getElementById('timeForm');
    const dayTypeRadios = document.querySelectorAll('input[name="dayType"]');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');

    dayTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleTimeInputs);
    });

    startTime.addEventListener('change', updateCalculatedHours);
    endTime.addEventListener('change', updateCalculatedHours);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTimeEntry();
    });
}

function toggleTimeInputs() {
    const dayType = document.querySelector('input[name="dayType"]:checked').value;
    const timeInputs = document.getElementById('timeInputs');
    
    if (dayType === 'work') {
        timeInputs.style.display = 'flex';
    } else {
        timeInputs.style.display = 'none';
    }
}

function updateCalculatedHours() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (startTime && endTime) {
        const start = parseTime(startTime);
        const end = parseTime(endTime);
        
        let hours = end - start;
        if (hours < 0) hours += 24; // Gestisce turni notturni

        document.getElementById('calculatedHours').textContent = hours.toFixed(2);
    } else {
        document.getElementById('calculatedHours').textContent = '0.00';
    }
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
}

function saveTimeEntry() {
    const dateStr = document.getElementById('selectedDate').value;
    const dayType = document.querySelector('input[name="dayType"]:checked').value;
    const viewingUser = currentUser.role === 'admin' ? selectedUser : currentUser.username;
    
    // Controllo sicurezza: dipendenti possono modificare solo le proprie ore
    if (currentUser.role !== 'admin' && viewingUser !== currentUser.username) {
        alert('Non hai i permessi per modificare le ore di altri dipendenti.');
        closeModal();
        return;
    }

    if (!DB.timeEntries[viewingUser]) {
        DB.timeEntries[viewingUser] = {};
    }

    // Controlla se c'era già un'entry (per gestire il cambio tipo)
    const oldEntry = DB.timeEntries[viewingUser][dateStr];

    const entry = { type: dayType };

    if (dayType === 'work') {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

        if (!startTime || !endTime) {
            alert('Inserisci orario di inizio e fine');
            return;
        }

        const start = parseTime(startTime);
        const end = parseTime(endTime);
        let hours = end - start;
        if (hours < 0) hours += 24;

        entry.startTime = startTime;
        entry.endTime = endTime;
        entry.hours = hours;
    } else {
        entry.hours = 0;
    }

    // Gestione contatori ferie/ROL in ORE
    const user = DB.users[viewingUser];
    
    // Ripristina ore se cambia da ferie/ROL a altro tipo
    if (oldEntry) {
        if (oldEntry.type === 'ferie' && dayType !== 'ferie') {
            // Ripristina 8 ore (1 giorno)
            user.ferieResidue = (user.ferieResidue || 0) + 8;
        }
        if (oldEntry.type === 'rol' && dayType !== 'rol') {
            // Ripristina 8 ore (1 giorno)
            user.rolResidui = (user.rolResidui || 0) + 8;
        }
    }
    
    // Decrementa ore se è ferie/ROL (8 ore = 1 giorno)
    if (dayType === 'ferie') {
        if ((user.ferieResidue || 0) < 8) {
            const giorniRimasti = ((user.ferieResidue || 0) / 8).toFixed(1);
            alert(`⚠️ Attenzione: hai solo ${giorniRimasti} giorni di ferie disponibili!`);
        }
        user.ferieResidue = Math.max(0, (user.ferieResidue || 0) - 8);
    }
    
    if (dayType === 'rol') {
        if ((user.rolResidui || 0) < 8) {
            alert(`⚠️ Attenzione: hai solo ${user.rolResidui || 0} ore di ROL disponibili!`);
        }
        user.rolResidui = Math.max(0, (user.rolResidui || 0) - 8);
    }

    DB.timeEntries[viewingUser][dateStr] = entry;
    
    // Salva e poi aggiorna l'interfaccia
    saveDataToStorage().then(() => {
        closeModal();
        updateLeaveBalance(); // Aggiorna contatori
        
        // Aggiorna vista in base alla modalità corrente
        if (currentView === 'calendar') {
            renderCalendar();
            updateMonthlySummary();
        } else {
            renderEmployeeTable();
        }
    });
}

// Aggiorna riepilogo mensile
function updateMonthlySummary() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const viewingUser = currentUser.role === 'admin' ? selectedUser : currentUser.username;
    const userEntries = DB.timeEntries[viewingUser] || {};

    let totalHours = 0;
    let workDays = 0;
    let holidayDays = 0;
    let rolDays = 0;

    Object.keys(userEntries).forEach(dateStr => {
        const entryDate = new Date(dateStr + 'T12:00:00');
        if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
            const entry = userEntries[dateStr];
            
            if (entry.type === 'work') {
                totalHours += entry.hours;
                workDays++;
            } else if (entry.type === 'ferie') {
                holidayDays++;
            } else if (entry.type === 'rol') {
                rolDays++;
            }
        }
    });

    document.getElementById('totalHours').textContent = totalHours.toFixed(2);
    document.getElementById('workDays').textContent = workDays;
    document.getElementById('holidayDays').textContent = holidayDays;
    document.getElementById('rolDays').textContent = rolDays;
}

// Render tabella dipendenti (solo admin)
function renderEmployeeTable() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Aggiorna titolo mese
    updateMonthDisplay();
    
    // Ottieni tutti gli utenti (admin + dipendenti)
    const employees = Object.values(DB.users).sort((a, b) => {
        // Admin per primo
        if (a.role === 'admin') return -1;
        if (b.role === 'admin') return 1;
        return a.name.localeCompare(b.name);
    });
    
    // Numero di giorni nel mese
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Crea header con nomi dipendenti
    const thead = document.getElementById('tableHeader');
    thead.innerHTML = '<th class="sticky-col day-col">#</th>';
    employees.forEach(employee => {
        const th = document.createElement('th');
        th.className = 'employee-col';
        
        // Ottieni iniziali Nome.Cognome
        const nameParts = employee.name.split(' ');
        const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('.');
        
        th.textContent = initials;
        th.title = employee.name + (employee.role === 'admin' ? ' (Admin)' : ''); // Tooltip con nome completo
        
        thead.appendChild(th);
    });
    
    // Crea righe per ogni giorno
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';
    
    for (let day = 1; day <= daysInMonth; day++) {
        const row = document.createElement('tr');
        
        // Colonna giorno
        const dayCell = document.createElement('td');
        dayCell.className = 'sticky-col day-col';
        dayCell.textContent = day;
        row.appendChild(dayCell);
        
        // Celle per ogni dipendente
        employees.forEach(employee => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const userEntries = DB.timeEntries[employee.username] || {};
            const entry = userEntries[dateStr];
            
            const cell = document.createElement('td');
            cell.className = 'data-cell';
            cell.dataset.username = employee.username;
            cell.dataset.date = dateStr;
            
            if (entry) {
                if (entry.type === 'work') {
                    cell.classList.add('work-cell');
                    
                    // Formato compatto su mobile
                    const isMobile = window.innerWidth <= 480;
                    const timeDisplay = isMobile 
                        ? `${entry.startTime.substring(0,5)}-${entry.endTime.substring(0,5)}`
                        : `${entry.startTime}-${entry.endTime}`;
                    
                    cell.innerHTML = `
                        <div class="cell-content">
                            <div class="cell-time">${timeDisplay}</div>
                            <div class="cell-hours">${entry.hours.toFixed(1)}h</div>
                        </div>
                    `;
                } else if (entry.type === 'off') {
                    cell.classList.add('off-cell');
                    cell.innerHTML = '<div class="cell-content"><div class="cell-label">OFF</div></div>';
                } else if (entry.type === 'ferie') {
                    cell.classList.add('holiday-cell');
                    cell.innerHTML = '<div class="cell-content"><div class="cell-label">FERIE</div></div>';
                } else if (entry.type === 'rol') {
                    cell.classList.add('rol-cell');
                    cell.innerHTML = '<div class="cell-content"><div class="cell-label">ROL</div></div>';
                }
            } else {
                cell.innerHTML = '<div class="cell-content"></div>';
            }
            
            // Click per modificare
            cell.addEventListener('click', () => {
                // Solo l'admin può cliccare sulle celle della tabella
                if (currentUser.role === 'admin') {
                    selectedUser = employee.username;
                    openTimeModal(dateStr, entry);
                }
            });
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    }
    
    // Riga totali
    const totalsRow = document.getElementById('tableTotals');
    totalsRow.innerHTML = '<td class="sticky-col day-col"><strong class="vertical-text">TOT</strong></td>';
    
    employees.forEach(employee => {
        const userEntries = DB.timeEntries[employee.username] || {};
        let totalHours = 0;
        let ferieDays = 0;
        let rolDays = 0;
        
        Object.keys(userEntries).forEach(dateStr => {
            const entryDate = new Date(dateStr + 'T12:00:00');
            if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
                const entry = userEntries[dateStr];
                if (entry.type === 'work') {
                    totalHours += entry.hours;
                } else if (entry.type === 'ferie') {
                    ferieDays++;
                } else if (entry.type === 'rol') {
                    rolDays++;
                }
            }
        });
        
        const totalCell = document.createElement('td');
        totalCell.className = 'total-cell';
        totalCell.innerHTML = `
            <div class="total-details">
                <div class="total-hours"><strong>${totalHours.toFixed(1)}h</strong></div>
                <div class="total-info">F: ${ferieDays} | R: ${rolDays}</div>
            </div>
        `;
        totalsRow.appendChild(totalCell);
    });
}

// Registra Service Worker per PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/ore_dipendenti/service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registrato:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ Errore registrazione Service Worker:', error);
            });
    });
}

// Export Excel
function exportToExcel() {
    const month = currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    const isAdmin = currentUser.role === 'admin';
    
    if (isAdmin && currentView === 'table') {
        // Export tabella completa di tutti i dipendenti
        exportTableViewToExcel(month);
    } else {
        // Export calendario singolo utente
        exportCalendarToExcel(selectedUser, month);
    }
}

async function exportTableViewToExcel(month) {
    // Include admin + employees
    const allUsers = Object.keys(DB.users);
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Crea workbook con ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resoconto');
    
    // Header row
    const headerRow = ['Giorno'];
    allUsers.forEach(username => {
        headerRow.push(DB.users[username].name);
    });
    const header = worksheet.addRow(headerRow);
    
    // Stile header - grigio
    header.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Righe giorni
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(year, monthIndex, day);
        const dayName = date.toLocaleDateString('it-IT', { weekday: 'short' });
        
        const rowData = [`${dayName} ${day}`];
        
        allUsers.forEach(username => {
            const entry = DB.timeEntries[username]?.[dateStr];
            
            if (entry) {
                if (entry.type === 'work' && entry.hours) {
                    rowData.push(`${entry.hours.toFixed(1)}h (${entry.startTime}-${entry.endTime})`);
                } else if (entry.type === 'ferie') {
                    rowData.push('FERIE');
                } else if (entry.type === 'rol') {
                    rowData.push('ROL');
                } else if (entry.type === 'off') {
                    rowData.push('OFF');
                }
            } else {
                rowData.push('');
            }
        });
        
        const row = worksheet.addRow(rowData);
        
        // Stile prima colonna (giorni) - grigio
        row.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        row.getCell(1).font = { bold: true };
        row.getCell(1).alignment = { horizontal: 'center' };
        row.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        
        // Stile celle dati
        for (let col = 2; col <= allUsers.length + 1; col++) {
            const cell = row.getCell(col);
            const value = cell.value?.toString().toUpperCase() || '';
            
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            if (value === 'FERIE') {
                // Giallo
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF00' }
                };
                cell.font = { bold: true };
            } else if (value === 'ROL') {
                // Verde chiaro
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF90EE90' }
                };
                cell.font = { bold: true };
            } else if (value === 'OFF') {
                // Rosso
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF6B6B' }
                };
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            }
        }
    }
    
    // Riga vuota
    worksheet.addRow([]);
    
    // Riga TOTALE ORE
    const totalData = ['TOT ORE'];
    allUsers.forEach(username => {
        let totalHours = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = DB.timeEntries[username]?.[dateStr];
            if (entry && entry.type === 'work' && entry.hours) {
                totalHours += entry.hours;
            }
        }
        totalData.push(totalHours.toFixed(1));
    });
    const totalRow = worksheet.addRow(totalData);
    totalRow.eachCell((cell, colNum) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colNum === 1 ? 'FF808080' : 'FFD3D3D3' }
        };
        cell.font = { bold: true, color: { argb: colNum === 1 ? 'FFFFFFFF' : 'FF000000' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Riga FERIE
    const ferieData = ['FERIE'];
    allUsers.forEach(username => {
        let ferieDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = DB.timeEntries[username]?.[dateStr];
            if (entry && entry.type === 'ferie') ferieDays++;
        }
        ferieData.push(ferieDays);
    });
    const ferieRow = worksheet.addRow(ferieData);
    ferieRow.eachCell((cell, colNum) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colNum === 1 ? 'FF808080' : 'FFD3D3D3' }
        };
        cell.font = { bold: true, color: { argb: colNum === 1 ? 'FFFFFFFF' : 'FF000000' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Riga ROL
    const rolData = ['ROL'];
    allUsers.forEach(username => {
        let rolDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = DB.timeEntries[username]?.[dateStr];
            if (entry && entry.type === 'rol') rolDays++;
        }
        rolData.push(rolDays);
    });
    const rolRow = worksheet.addRow(rolData);
    rolRow.eachCell((cell, colNum) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colNum === 1 ? 'FF808080' : 'FFD3D3D3' }
        };
        cell.font = { bold: true, color: { argb: colNum === 1 ? 'FFFFFFFF' : 'FF000000' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Larghezza colonne
    worksheet.getColumn(1).width = 12;
    for (let col = 2; col <= allUsers.length + 1; col++) {
        worksheet.getColumn(col).width = 22;
    }
    
    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resoconto_${month.replace(' ', '_')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
}

async function exportCalendarToExcel(username, month) {
    const user = DB.users[username];
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(user.name.split(' ')[0]);
    
    // Column widths
    worksheet.columns = [
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 10 }
    ];
    
    // Title row
    const titleRow = worksheet.addRow([`Resoconto Ore - ${user.name}`, '', '', '']);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'left' };
    
    // Month row
    const monthRow = worksheet.addRow([`Mese: ${month}`, '', '', '']);
    monthRow.font = { bold: true };
    
    // Empty row
    worksheet.addRow([]);
    
    // Header row
    const headerRow = worksheet.addRow(['Data', 'Tipo', 'Orario', 'Ore']);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    let totalHours = 0;
    let ferieDays = 0;
    let rolDays = 0;
    
    // Data rows
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = DB.timeEntries[username]?.[dateStr];
        const date = new Date(year, monthIndex, day);
        const dayName = date.toLocaleDateString('it-IT', { weekday: 'short' });
        const dateFormatted = `${dayName} ${day}`;
        
        if (entry) {
            let row;
            if (entry.type === 'work' && entry.hours) {
                const orario = `${entry.startTime} - ${entry.endTime}`;
                row = worksheet.addRow([dateFormatted, 'Lavoro', orario, entry.hours.toFixed(1)]);
                totalHours += entry.hours;
                row.alignment = { horizontal: 'center', vertical: 'middle' };
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            } else if (entry.type === 'ferie') {
                row = worksheet.addRow([dateFormatted, 'FERIE', '-', '-']);
                ferieDays++;
                row.getCell(2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF00' }
                };
                row.getCell(2).font = { bold: true };
                row.alignment = { horizontal: 'center', vertical: 'middle' };
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            } else if (entry.type === 'rol') {
                row = worksheet.addRow([dateFormatted, 'ROL', '-', '-']);
                rolDays++;
                row.getCell(2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF90EE90' }
                };
                row.getCell(2).font = { bold: true };
                row.alignment = { horizontal: 'center', vertical: 'middle' };
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            } else if (entry.type === 'off') {
                row = worksheet.addRow([dateFormatted, 'OFF', '-', '-']);
                row.getCell(2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF6B6B' }
                };
                row.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
                row.alignment = { horizontal: 'center', vertical: 'middle' };
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        }
    }
    
    // Empty row
    worksheet.addRow([]);
    
    // Total rows
    const totalRow = worksheet.addRow(['TOTALE ORE', '', '', totalHours.toFixed(1)]);
    totalRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' }
    };
    totalRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    totalRow.getCell(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
    };
    totalRow.getCell(4).font = { bold: true };
    totalRow.alignment = { horizontal: 'center', vertical: 'middle' };
    totalRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    const ferieRow = worksheet.addRow(['Giorni Ferie', '', '', ferieDays]);
    ferieRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' }
    };
    ferieRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ferieRow.getCell(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }
    };
    ferieRow.getCell(4).font = { bold: true };
    ferieRow.alignment = { horizontal: 'center', vertical: 'middle' };
    ferieRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    const rolRow = worksheet.addRow(['Giorni ROL', '', '', rolDays]);
    rolRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' }
    };
    rolRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    rolRow.getCell(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' }
    };
    rolRow.getCell(4).font = { bold: true };
    rolRow.alignment = { horizontal: 'center', vertical: 'middle' };
    rolRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    rolRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' }
    };
    rolRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    rolRow.getCell(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' }
    };
    rolRow.getCell(4).font = { bold: true };
    rolRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ore_${user.name.replace(' ', '_')}_${month.replace(' ', '_')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Italian Holidays Calculator
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function getItalianHolidays(year) {
    const easter = calculateEaster(year);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);

    return [
        { date: new Date(year, 0, 1), name: 'Capodanno', type: 'nazionale' },
        { date: new Date(year, 0, 6), name: 'Epifania', type: 'nazionale' },
        { date: easter, name: 'Pasqua', type: 'nazionale' },
        { date: easterMonday, name: 'Lunedì dell\'Angelo (Pasquetta)', type: 'nazionale' },
        { date: new Date(year, 3, 25), name: 'Festa della Liberazione', type: 'nazionale' },
        { date: new Date(year, 4, 1), name: 'Festa dei Lavoratori', type: 'nazionale' },
        { date: new Date(year, 5, 2), name: 'Festa della Repubblica', type: 'nazionale' },
        { date: new Date(year, 7, 15), name: 'Assunzione di Maria (Ferragosto)', type: 'nazionale' },
        { date: new Date(year, 10, 1), name: 'Ognissanti', type: 'nazionale' },
        { date: new Date(year, 11, 8), name: 'Immacolata Concezione', type: 'nazionale' },
        { date: new Date(year, 11, 25), name: 'Natale', type: 'nazionale' },
        { date: new Date(year, 11, 26), name: 'Santo Stefano', type: 'nazionale' }
    ].sort((a, b) => a.date - b.date);
}

function renderHolidaysList(year) {
    const holidays = getItalianHolidays(year);
    const container = document.getElementById('holidaysList');
    
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    
    holidays.forEach(holiday => {
        const dayName = dayNames[holiday.date.getDay()];
        const day = holiday.date.getDate();
        const month = monthNames[holiday.date.getMonth()];
        
        html += `
            <div style="padding: 15px; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid #e74c3c;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px; color: var(--text-primary);">${holiday.name}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">${dayName}, ${day} ${month} ${year}</div>
                    </div>
                    <div style="background: #e74c3c; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 500; font-size: 14px;">
                        ${day} ${month.substring(0, 3)}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
    const icon = document.getElementById('darkModeIcon');
    if (isDark) {
        // Moon icon
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>';
    } else {
        // Sun icon
        icon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
}

// Notifications System
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Questo browser non supporta le notifiche desktop');
        return;
    }

    if (!('serviceWorker' in navigator)) {
        alert('Questo browser non supporta i Service Workers');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // Registra service worker se non già registrato
            const registration = await navigator.serviceWorker.ready;
            
            // Salva preferenza utente
            localStorage.setItem('notificationsEnabled', 'true');
            localStorage.setItem('notificationUser', currentUser.username);
            
            // Mostra notifica di conferma
            showLocalNotification('Notifiche Attivate', 'Riceverai promemoria per inserire le ore lavorative');
            
            // Programma notifiche giornaliere
            scheduleDailyNotifications();
            
            alert('Notifiche attivate con successo!');
        } else {
            alert('Permesso notifiche negato');
        }
    } catch (error) {
        console.error('Errore richiesta permessi:', error);
        alert('Errore nell\'attivazione delle notifiche');
    }
}

function showLocalNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/ore_dipendenti/icon-192.png',
            badge: '/ore_dipendenti/badge-72.png',
            tag: 'ore-app'
        });
    }
}

function scheduleDailyNotifications() {
    // Controlla se è l'ora di inviare la notifica (es: ogni giorno alle 18:00)
    const checkNotification = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Notifica alle 18:00 se non sono state inserite ore oggi
        if (hour === 18 && minute === 0) {
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const username = localStorage.getItem('notificationUser');
            
            if (username && DB.timeEntries[username]) {
                const entry = DB.timeEntries[username][dateStr];
                
                // Se non ci sono entry per oggi, invia notifica
                if (!entry) {
                    showLocalNotification(
                        'Promemoria Ore',
                        'Non dimenticare di inserire le ore di oggi!'
                    );
                }
            }
        }
    };
    
    // Controlla ogni minuto
    setInterval(checkNotification, 60000);
    
    // Controlla subito
    checkNotification();
}

// Inizializza notifiche se abilitate
function initNotifications() {
    const notificationsEnabled = localStorage.getItem('notificationsEnabled');
    const notificationsBtn = document.getElementById('notificationsBtn');
    
    if (notificationsBtn) {
        notificationsBtn.style.display = 'inline-flex';
        
        if (notificationsEnabled === 'true' && Notification.permission === 'granted') {
            scheduleDailyNotifications();
            notificationsBtn.style.opacity = '0.5';
            notificationsBtn.title = 'Notifiche Attive';
        }
    }
}
