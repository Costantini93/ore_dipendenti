// Database simulato (in produzione usare un database reale)
const DB = {
    users: {
        'alessandro_costantini': {
            username: 'alessandro_costantini',
            password: null, // null = primo accesso
            name: 'Alessandro Costantini',
            role: 'admin'
        },
        'denise_raimondi': {
            username: 'denise_raimondi',
            password: null,
            name: 'Denise Raimondi',
            role: 'employee'
        },
        'sandy_oduro': {
            username: 'sandy_oduro',
            password: null,
            name: 'Sandy Oduro',
            role: 'employee'
        },
        'luca_avesani': {
            username: 'luca_avesani',
            password: null,
            name: 'Luca Avesani',
            role: 'employee'
        },
        'sophie_rizzin': {
            username: 'sophie_rizzin',
            password: null,
            name: 'Sophie Rizzin',
            role: 'employee'
        },
        'sofia_bilianska': {
            username: 'sofia_bilianska',
            password: null,
            name: 'Sofia Bilianska',
            role: 'employee'
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
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    initLoginForm();
    initApp();
});

// Carica dati da Firebase
function loadDataFromStorage() {
    // Carica password salvate da localStorage (per sicurezza restano locali)
    const savedData = localStorage.getItem('timeTrackingData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.users) {
                Object.keys(parsed.users).forEach(username => {
                    if (DB.users[username] && parsed.users[username].password) {
                        DB.users[username].password = parsed.users[username].password;
                    }
                });
            }
        } catch (e) {
            console.error('Errore caricamento password:', e);
        }
    }
    
    // Carica timeEntries da Firebase
    if (typeof firebase !== 'undefined') {
        dbRef.timeEntries.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                DB.timeEntries = data;
                // Aggiorna UI se necessario
                if (currentUser && currentView === 'calendar') {
                    renderCalendar();
                } else if (currentUser && currentView === 'table') {
                    renderEmployeeTable();
                }
            }
        });
    }
}

// Salva dati in Firebase
function saveDataToStorage() {
    // Salva password localmente (per sicurezza)
    const usersToSave = {};
    Object.keys(DB.users).forEach(username => {
        usersToSave[username] = {
            password: DB.users[username].password
        };
    });
    
    localStorage.setItem('timeTrackingData', JSON.stringify({
        users: usersToSave
    }));
    
    // Salva timeEntries su Firebase
    if (typeof firebase !== 'undefined' && dbRef) {
        dbRef.timeEntries.set(DB.timeEntries).catch((error) => {
            console.error('Errore salvataggio Firebase:', error);
            alert('Errore nel salvare i dati. Controlla la connessione internet.');
        });
    }
}

// Login Form
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.toLowerCase().trim();
        const password = document.getElementById('password').value;

        const user = DB.users[username];
        
        if (!user) {
            loginError.textContent = 'Username non trovato';
            loginError.classList.add('show');
            return;
        }

        // Primo accesso - nessuna password impostata
        if (user.password === null) {
            currentUser = user;
            showFirstTimeModal();
            loginError.classList.remove('show');
            return;
        }

        // Login normale con password
        if (user.password === password) {
            currentUser = user;
            selectedUser = username; // Tutti partono visualizzando se stessi
            showPage('appPage');
            initializeApp();
            loginError.classList.remove('show');
        } else {
            loginError.textContent = 'Password errata';
            loginError.classList.add('show');
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
        saveDataToStorage();

        // Chiudi modal e vai all'app
        closeFirstTimeModal();
        selectedUser = currentUser.username; // Tutti partono visualizzando se stessi
        showPage('appPage');
        initializeApp();
        passwordError.classList.remove('show');
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
        showPage('loginPage');
        document.getElementById('loginForm').reset();
    });

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

    // Selezione utente per admin
    document.getElementById('userSelect').addEventListener('change', (e) => {
        selectedUser = e.target.value;
        renderCalendar();
    });

    // View Toggle
    document.getElementById('calendarViewBtn').addEventListener('click', () => {
        switchView('calendar');
    });

    document.getElementById('tableViewBtn').addEventListener('click', () => {
        switchView('table');
    });

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
        // Admin parte visualizzando se stesso
        selectedUser = currentUser.username;
        document.getElementById('userSelect').value = currentUser.username;
    } else {
        document.getElementById('adminUserSelection').style.display = 'none';
        document.getElementById('viewToggle').style.display = 'none';
    }

    switchView('calendar');
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
                time.textContent = `${entry.startTime} - ${entry.endTime}`;
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
    document.getElementById('timeModal').classList.remove('show');
    document.getElementById('timeForm').reset();
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

    DB.timeEntries[viewingUser][dateStr] = entry;
    saveDataToStorage();
    
    closeModal();
    renderCalendar();
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
        
        th.textContent = employee.role === 'admin' ? initials + '★' : initials;
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
    totalsRow.innerHTML = '<td class="sticky-col day-col"><strong>TOTALI</strong></td>';
    
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
