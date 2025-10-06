// ============================================
// CONSTANTS
// ============================================
const EVENT_TYPES = {
    NO_DECIMALS: [
        "5km", "10km", "15km", "10 Miles", "20km", "HM", 
        "25km", "30km", "Marathon", "100km", "3kmW", 
        "5kmW", "10kmW", "15kmW", "20kmW", "30kmW", 
        "35kmW", "50kmW"
    ],
    FIELD: ["HJ", "PV", "LJ", "TJ", "SP", "DT", "HT", "JT"],
    COMBINED: ["Decathlon", "Heptathlon", "Pentathlon"]
};

const REGEX = {
    TIME: /^(?:(\d+):(\d{2}):(\d{2})(?:\.(\d+))?|(\d+):(\d{2})(?:\.(\d+))?|(\d+)(?:\.(\d+))?)$/,
    FIELD: /^\d+(\.\d+)?$/,
    POINTS: /^\d+$/
};

// ============================================
// DATA LOADING
// ============================================
let scoringTables = {
    outdoor: { men: null, women: null },
    indoor: { men: null, women: null }
};

function convertArrayToObject(dataArray) {
    const obj = {};
    dataArray.forEach(entry => {
        const points = entry.Points;
        obj[points] = entry;
    });
    return obj;
}

async function loadScoringTables() {
    try {
        const [mensOutdoor, womensOutdoor, mensIndoor, womensIndoor] = await Promise.all([
            fetch('./data/mens-outdoor.json').then(r => r.json()),
            fetch('./data/womens-outdoor.json').then(r => r.json()),
            fetch('./data/mens-indoor.json').then(r => r.json()),
            fetch('./data/womens-indoor.json').then(r => r.json())
        ]);

        scoringTables.outdoor.men = convertArrayToObject(mensOutdoor);
        scoringTables.outdoor.women = convertArrayToObject(womensOutdoor);
        scoringTables.indoor.men = convertArrayToObject(mensIndoor);
        scoringTables.indoor.women = convertArrayToObject(womensIndoor);
    } catch (error) {
        console.error('Error loading scoring tables:', error);
        showError('Error loading data. Please refresh the page.');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showError(message) {
    const mensajeErrorDiv = document.getElementById('mensaje_error');
    mensajeErrorDiv.textContent = message;
    mensajeErrorDiv.style.backgroundColor = message ? '#f5bcbc' : 'transparent';
}

function clearError() {
    showError('');
}

function convertTimeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    let totalSeconds = 0;

    if (parts.length === 3) {
        totalSeconds = (Number(parts[0]) * 3600) + (Number(parts[1]) * 60) + Number(parts[2]);
    } else if (parts.length === 2) {
        totalSeconds = (Number(parts[0]) * 60) + Number(parts[1]);
    } else {
        totalSeconds = Number(parts[0]);
    }

    return totalSeconds;
}

function convertSecondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(2);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;
    } else if (minutes > 0) {
        return `${minutes}:${String(secs).padStart(5, '0')}`;
    } else {
        return secs;
    }
}

function findScoreByMark(mark, event, tableData) {
    for (let points = 1400; points >= 1; points--) {
        const entry = tableData[points];
        if (entry && entry[event] === mark) {
            return points;
        }
    }
    return null;
}

function findMarkByScore(score, event, tableData) {
    const entry = tableData[score];
    return entry && entry[event] ? entry[event] : null;
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================
function calculateForTimeEvent(mark, event, tableData) {
    const markSeconds = convertTimeToSeconds(mark);
    
    let maxSeconds = null;
    let minSeconds = null;
    
    for (let points = 1400; points >= 1; points--) {
        const entry = tableData[points];
        if (!entry || !entry[event] || entry[event] === '-') continue;
        
        const entrySeconds = convertTimeToSeconds(entry[event]);
        
        if (maxSeconds === null || entrySeconds < maxSeconds) maxSeconds = entrySeconds;
        if (minSeconds === null || entrySeconds > minSeconds) minSeconds = entrySeconds;
    }
    
    if (markSeconds < maxSeconds) return 1401;
    if (markSeconds > minSeconds) return 0;
    
    for (let points = 1400; points >= 1; points--) {
        const entry = tableData[points];
        if (!entry || !entry[event] || entry[event] === '-') continue;
        
        const entrySeconds = convertTimeToSeconds(entry[event]);
        
        if (markSeconds <= entrySeconds) {
            return points;
        }
    }
    
    return 0;
}

function calculateForFieldEvent(mark, event, tableData) {
    const markValue = Number(mark);
    
    let maxValue = null;
    let minValue = null;
    
    for (let points = 1400; points >= 1; points--) {
        const entry = tableData[points];
        if (!entry || !entry[event] || entry[event] === '-') continue;
        
        const entryValue = Number(entry[event]);
        
        if (maxValue === null || entryValue > maxValue) maxValue = entryValue;
        if (minValue === null || entryValue < minValue) minValue = entryValue;
    }
    
    if (markValue > maxValue) return 1401;
    if (markValue < minValue) return 0;
    
    for (let points = 1400; points >= 1; points--) {
        const entry = tableData[points];
        if (!entry || !entry[event] || entry[event] === '-') continue;
        
        const entryValue = Number(entry[event]);
        
        if (markValue >= entryValue) {
            return points;
        }
    }
    
    return 0;
}

function calculateForCombinedEvent(mark, event, tableData) {
    const markValue = Number(mark);
    
    let maxValue = null;
    let minValue = null;
    
    for (let points = 1400; points >= 1; points--) {
        const entry = tableData[points];
        if (!entry || !entry[event] || entry[event] === '-') continue;
        
        const entryValue = Number(entry[event]);
        
        if (maxValue === null || entryValue > maxValue) maxValue = entryValue;
        if (minValue === null || entryValue < minValue) minValue = entryValue;
    }
    
    if (markValue > maxValue) return 1401;
    if (markValue < minValue) return 0;
    
    for (let points = 1400; points >= 1; points--) {
        const entry = tableData[points];
        if (!entry || !entry[event] || entry[event] === '-') continue;
        
        const entryValue = Number(entry[event]);
        
        if (markValue >= entryValue) {
            return points;
        }
    }
    
    return 0;
}

function calculateScore(mark, event, tableData) {
    const exactScore = findScoreByMark(mark, event, tableData);
    if (exactScore) return exactScore;

    if (EVENT_TYPES.FIELD.includes(event)) {
        return calculateForFieldEvent(mark, event, tableData);
    } else if (EVENT_TYPES.COMBINED.includes(event)) {
        return calculateForCombinedEvent(mark, event, tableData);
    } else {
        return calculateForTimeEvent(mark, event, tableData);
    }
}

// ============================================
// TABLE FUNCTIONS
// ============================================
function addResultToTable(gender, track, event, mark, score) {
    const resultTable = document.getElementById('resultado');
    
    const row = document.createElement('tr');
    row.classList.add('tabla_tr_NuevaFila');
    
    const cells = [gender, track, event, mark, score];
    cells.forEach(content => {
        const cell = document.createElement('td');
        cell.textContent = content;
        row.appendChild(cell);
    });
    
    resultTable.appendChild(row);
    checkForTD();
}

function clearResults() {
    const table = document.getElementById("resultado");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    checkForTD();
}

function checkForTD() {
    const table = document.getElementById("resultado");
    const hasTD = table.querySelector("td") !== null;
    
    if (hasTD) {
        table.classList.add("has-td");
    } else {
        table.classList.remove("has-td");
    }
}

// ============================================
// FORM HANDLING
// ============================================
function updateEventOptions() {
    const eventType = document.querySelector('input[name="outdoor_indoor"]:checked').id;
    const gender = document.querySelector('input[name="men_women"]:checked').id;
    const selectEvent = document.getElementById('prueba');

    selectEvent.innerHTML = '';

    let options = [];
    if (eventType === 'indoor') {
        if (gender === 'men') {
            options = [
                { value: '50m', text: '50 Metres', class: 'velocidad' },
                { value: '55m', text: '55 Metres', class: 'velocidad' },
                { value: '60m', text: '60 Metres', class: 'velocidad' },
                { value: '200m', text: '200 Metres', class: 'velocidad' },
                { value: '300m', text: '300 Metres', class: 'velocidad' },
                { value: '400m', text: '400 Metres', class: 'velocidad' },
                { value: '500m', text: '500 Metres', class: 'medio-fondo' },
                { value: '600m', text: '600 Metres', class: 'medio-fondo' },
                { value: '800m', text: '800 Metres', class: 'medio-fondo' },
                { value: '1000m', text: '1000 Metres', class: 'medio-fondo' },
                { value: '1500m', text: '1500 Metres', class: 'medio-fondo' },
                { value: 'Mile', text: 'Mile', class: 'medio-fondo' },
                { value: '2000m', text: '2000 Metres', class: 'medio-fondo' },
                { value: '3000m', text: '3000 Metres', class: 'fondo' },
                { value: '2 Miles', text: '2 Miles', class: 'fondo' },
                { value: '5000m', text: '5000 Metres', class: 'fondo' },
                { value: '50mH', text: '50 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '55mH', text: '55 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '60mH', text: '60 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: 'HJ', text: 'High Jump', class: 'concursos' },
                { value: 'PV', text: 'Pole Vault', class: 'concursos' },
                { value: 'LJ', text: 'Long Jump', class: 'concursos' },
                { value: 'TJ', text: 'Triple Jump', class: 'concursos' },
                { value: 'SP', text: 'Shot Put', class: 'concursos' },
                { value: 'Heptathlon', text: 'Heptathlon', class: 'combinadas' },
                { value: '3000mW', text: '3000 Metres Race Walk', class: 'marcha-ruta' },
                { value: '5000mW', text: '5000 Metres Race Walk', class: 'marcha-ruta' },
                { value: '10,000mW', text: '10,000 Metres Race Walk', class: 'marcha-ruta' },
                { value: '4x200m', text: '4x200 Metres Relay', class: 'relevos' },
                { value: '4x400m', text: '4x400 Metres Relay', class: 'relevos' }
            ];
        } else {
            options = [
                { value: '50m', text: '50 Metres', class: 'velocidad' },
                { value: '55m', text: '55 Metres', class: 'velocidad' },
                { value: '60m', text: '60 Metres', class: 'velocidad' },
                { value: '200m', text: '200 Metres', class: 'velocidad' },
                { value: '300m', text: '300 Metres', class: 'velocidad' },
                { value: '400m', text: '400 Metres', class: 'velocidad' },
                { value: '500m', text: '500 Metres', class: 'medio-fondo' },
                { value: '600m', text: '600 Metres', class: 'medio-fondo' },
                { value: '800m', text: '800 Metres', class: 'medio-fondo' },
                { value: '1000m', text: '1000 Metres', class: 'medio-fondo' },
                { value: '1500m', text: '1500 Metres', class: 'medio-fondo' },
                { value: 'Mile', text: 'Mile', class: 'medio-fondo' },
                { value: '2000m', text: '2000 Metres', class: 'medio-fondo' },
                { value: '3000m', text: '3000 Metres', class: 'fondo' },
                { value: '2 Miles', text: '2 Miles', class: 'fondo' },
                { value: '5000m', text: '5000 Metres', class: 'fondo' },
                { value: '50mH', text: '50 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '55mH', text: '55 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '60mH', text: '60 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: 'HJ', text: 'High Jump', class: 'concursos' },
                { value: 'PV', text: 'Pole Vault', class: 'concursos' },
                { value: 'LJ', text: 'Long Jump', class: 'concursos' },
                { value: 'TJ', text: 'Triple Jump', class: 'concursos' },
                { value: 'SP', text: 'Shot Put', class: 'concursos' },
                { value: 'Pentathlon', text: 'Pentathlon', class: 'combinadas' },
                { value: '3000mW', text: '3000 Metres Race Walk', class: 'marcha-ruta' },
                { value: '5000mW', text: '5000 Metres Race Walk', class: 'marcha-ruta' },
                { value: '10,000mW', text: '10,000 Metres Race Walk', class: 'marcha-ruta' },
                { value: '4x200m', text: '4x200 Metres Relay', class: 'relevos' },
                { value: '4x400m', text: '4x400 Metres Relay', class: 'relevos' }
            ];
        }
    } else {
        if (gender === 'men') {
            options = [
                { value: '100m', text: '100 Metres', class: 'velocidad' },
                { value: '200m', text: '200 Metres', class: 'velocidad' },
                { value: '300m', text: '300 Metres', class: 'velocidad' },
                { value: '400m', text: '400 Metres', class: 'velocidad' },
                { value: '500m', text: '500 Metres', class: 'medio-fondo' },
                { value: '600m', text: '600 Metres', class: 'medio-fondo' },
                { value: '800m', text: '800 Metres', class: 'medio-fondo' },
                { value: '1000m', text: '1000 Metres', class: 'medio-fondo' },
                { value: '1500m', text: '1500 Metres', class: 'medio-fondo' },
                { value: 'Mile', text: 'Mile', class: 'medio-fondo' },
                { value: '2000m', text: '2000 Metres', class: 'medio-fondo' },
                { value: '3000m', text: '3000 Metres', class: 'fondo' },
                { value: '2 Miles', text: '2 Miles', class: 'fondo' },
                { value: '5000m', text: '5000 Metres', class: 'fondo' },
                { value: '10,000m', text: '10,000 Metres', class: 'fondo' },
                { value: '110mH', text: '110 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '400mH', text: '400 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '2000mSC', text: '2000 Metres Steeplechase', class: 'vallas-obstaculos' },
                { value: '3000mSC', text: '3000 Metres Steeplechase', class: 'vallas-obstaculos' },
                { value: '5km', text: '5 Kilometres', class: 'fondo-ruta' },
                { value: '10km', text: '10 Kilometres', class: 'fondo-ruta' },
                { value: '15km', text: '15 Kilometres', class: 'fondo-ruta' },
                { value: '10 Miles', text: '10 Miles', class: 'fondo-ruta' },
                { value: '20km', text: '20 Kilometres', class: 'fondo-ruta' },
                { value: 'HM', text: 'Half Marathon', class: 'fondo-ruta' },
                { value: '25km', text: '25 Kilometres', class: 'fondo-ruta' },
                { value: '30km', text: '30 Kilometres', class: 'fondo-ruta' },
                { value: 'Marathon', text: 'Marathon', class: 'fondo-ruta' },
                { value: '100km', text: '100 Kilometres', class: 'fondo-ruta' },
                { value: 'HJ', text: 'High Jump', class: 'concursos' },
                { value: 'PV', text: 'Pole Vault', class: 'concursos' },
                { value: 'LJ', text: 'Long Jump', class: 'concursos' },
                { value: 'TJ', text: 'Triple Jump', class: 'concursos' },
                { value: 'SP', text: 'Shot Put', class: 'concursos' },
                { value: 'DT', text: 'Discus Throw', class: 'concursos' },
                { value: 'HT', text: 'Hammer Throw', class: 'concursos' },
                { value: 'JT', text: 'Javelin Throw', class: 'concursos' },
                { value: 'Decathlon', text: 'Decathlon', class: 'combinadas' },
                { value: '3kmW', text: '3 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '5kmW', text: '5 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '10kmW', text: '10 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '15kmW', text: '15 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '20kmW', text: '20 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '30kmW', text: '30 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '35kmW', text: '35 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '50kmW', text: '50 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '3000mW', text: '3000 Metres Race Walk', class: 'marcha' },
                { value: '5000mW', text: '5000 Metres Race Walk', class: 'marcha' },
                { value: '10,000mW', text: '10,000 Metres Race Walk', class: 'marcha' },
                { value: '15,000mW', text: '15,000 Metres Race Walk', class: 'marcha' },
                { value: '20,000mW', text: '20,000 Metres Race Walk', class: 'marcha' },
                { value: '30,000mW', text: '30,000 Metres Race Walk', class: 'marcha' },
                { value: '35,000mW', text: '35,000 Metres Race Walk', class: 'marcha' },
                { value: '50,000mW', text: '50,000 Metres Race Walk', class: 'marcha' },
                { value: '4x100m', text: '4x100 Metres Relay', class: 'relevos' },
                { value: '4x200m', text: '4x200 Metres Relay', class: 'relevos' },
                { value: '4x400m', text: '4x400 Metres Relay', class: 'relevos' }
            ];
        } else {
            options = [
                { value: '100m', text: '100 Metres', class: 'velocidad' },
                { value: '200m', text: '200 Metres', class: 'velocidad' },
                { value: '300m', text: '300 Metres', class: 'velocidad' },
                { value: '400m', text: '400 Metres', class: 'velocidad' },
                { value: '500m', text: '500 Metres', class: 'medio-fondo' },
                { value: '600m', text: '600 Metres', class: 'medio-fondo' },
                { value: '800m', text: '800 Metres', class: 'medio-fondo' },
                { value: '1000m', text: '1000 Metres', class: 'medio-fondo' },
                { value: '1500m', text: '1500 Metres', class: 'medio-fondo' },
                { value: 'Mile', text: 'Mile', class: 'medio-fondo' },
                { value: '2000m', text: '2000 Metres', class: 'medio-fondo' },
                { value: '3000m', text: '3000 Metres', class: 'fondo' },
                { value: '2 Miles', text: '2 Miles', class: 'fondo' },
                { value: '5000m', text: '5000 Metres', class: 'fondo' },
                { value: '10,000m', text: '10,000 Metres', class: 'fondo' },
                { value: '100mH', text: '100 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '400mH', text: '400 Metres Hurdles', class: 'vallas-obstaculos' },
                { value: '2000mSC', text: '2000 Metres Steeplechase', class: 'vallas-obstaculos' },
                { value: '3000mSC', text: '3000 Metres Steeplechase', class: 'vallas-obstaculos' },
                { value: '5km', text: '5 Kilometres', class: 'fondo-ruta' },
                { value: '10km', text: '10 Kilometres', class: 'fondo-ruta' },
                { value: '15km', text: '15 Kilometres', class: 'fondo-ruta' },
                { value: '10 Miles', text: '10 Miles', class: 'fondo-ruta' },
                { value: '20km', text: '20 Kilometres', class: 'fondo-ruta' },
                { value: 'HM', text: 'Half Marathon', class: 'fondo-ruta' },
                { value: '25km', text: '25 Kilometres', class: 'fondo-ruta' },
                { value: '30km', text: '30 Kilometres', class: 'fondo-ruta' },
                { value: 'Marathon', text: 'Marathon', class: 'fondo-ruta' },
                { value: '100km', text: '100 Kilometres', class: 'fondo-ruta' },
                { value: 'HJ', text: 'High Jump', class: 'concursos' },
                { value: 'PV', text: 'Pole Vault', class: 'concursos' },
                { value: 'LJ', text: 'Long Jump', class: 'concursos' },
                { value: 'TJ', text: 'Triple Jump', class: 'concursos' },
                { value: 'SP', text: 'Shot Put', class: 'concursos' },
                { value: 'DT', text: 'Discus Throw', class: 'concursos' },
                { value: 'HT', text: 'Hammer Throw', class: 'concursos' },
                { value: 'JT', text: 'Javelin Throw', class: 'concursos' },
                { value: 'Heptathlon', text: 'Heptathlon', class: 'combinadas' },
                { value: '3kmW', text: '3 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '5kmW', text: '5 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '10kmW', text: '10 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '15kmW', text: '15 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '20kmW', text: '20 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '30kmW', text: '30 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '35kmW', text: '35 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '50kmW', text: '50 Kilometres Race Walk', class: 'marcha-ruta' },
                { value: '3000mW', text: '3000 Metres Race Walk', class: 'marcha' },
                { value: '5000mW', text: '5000 Metres Race Walk', class: 'marcha' },
                { value: '10,000mW', text: '10,000 Metres Race Walk', class: 'marcha' },
                { value: '15,000mW', text: '15,000 Metres Race Walk', class: 'marcha' },
                { value: '20,000mW', text: '20,000 Metres Race Walk', class: 'marcha' },
                { value: '30,000mW', text: '30,000 Metres Race Walk', class: 'marcha' },
                { value: '35,000mW', text: '35,000 Metres Race Walk', class: 'marcha' },
                { value: '50,000mW', text: '50,000 Metres Race Walk', class: 'marcha' },
                { value: '4x100m', text: '4x100 Metres Relay', class: 'relevos' },
                { value: '4x200m', text: '4x200 Metres Relay', class: 'relevos' },
                { value: '4x400m', text: '4x400 Metres Relay', class: 'relevos' }
            ];
        }
    }

    options.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.textContent = option.text;
        newOption.title = option.text;
        newOption.className = option.class;
        selectEvent.appendChild(newOption);
    });

    updateMarkInput();
}

function updateMarkInput() {
    const markSpan = document.getElementById('marca_span');
    const markInput = document.getElementById('marca_prueba');
    const selectedEvent = document.getElementById('prueba').value;

    if (EVENT_TYPES.COMBINED.includes(selectedEvent)) {
        markSpan.textContent = "Points";
        markInput.placeholder = "pts";
    } else if (EVENT_TYPES.FIELD.includes(selectedEvent)) {
        markSpan.textContent = "Meters";
        markInput.placeholder = "m.mm";
    } else if (EVENT_TYPES.NO_DECIMALS.includes(selectedEvent)) {
        markSpan.textContent = "Time";
        markInput.placeholder = "hh:mm:ss";
    } else {
        markSpan.textContent = "Time";
        markInput.placeholder = "hh:mm:ss.ss";
    }
}

// ============================================
// FORM SUBMISSION
// ============================================
function handleFormSubmit(event) {
    event.preventDefault();
    clearError();

    const trackType = document.querySelector('input[name="outdoor_indoor"]:checked').id;
    const genderType = document.querySelector('input[name="men_women"]:checked').id;
    const selectedEvent = document.getElementById('prueba').value;
    
    const markInput = document.getElementById('marca_prueba').value.trim();
    const scoreInput = document.getElementById('puntos_prueba').value.trim();
    
    const markTabVisible = document.getElementById('tabla_marca').style.display !== 'none';
    const scoreTabVisible = document.getElementById('tabla_puntos').style.display !== 'none';

    const tableData = scoringTables[trackType][genderType];
    if (!tableData) {
        showError('Data not loaded yet. Please wait and try again.');
        return;
    }

    const gender = genderType.charAt(0).toUpperCase() + genderType.slice(1);
    const track = trackType.charAt(0).toUpperCase() + trackType.slice(1);

    if (markInput && markTabVisible) {
        let isValid = false;
        let processedMark = markInput;

        if (EVENT_TYPES.COMBINED.includes(selectedEvent)) {
            isValid = REGEX.POINTS.test(markInput);
            if (!isValid) {
                showError('The format must be in points');
                return;
            }
        } else if (EVENT_TYPES.FIELD.includes(selectedEvent)) {
            isValid = REGEX.FIELD.test(markInput);
            if (!isValid) {
                showError('The format must be: m.mm');
                return;
            }
            processedMark = Number(markInput).toFixed(2);
        } else {
            isValid = REGEX.TIME.test(markInput);
            if (!isValid) {
                const format = EVENT_TYPES.NO_DECIMALS.includes(selectedEvent) 
                    ? 'hh:mm:ss' 
                    : 'hh:mm:ss.ss';
                showError(`The format must be: ${format}`);
                return;
            }
            if (!EVENT_TYPES.NO_DECIMALS.includes(selectedEvent)) {
                processedMark = convertSecondsToTime(convertTimeToSeconds(markInput));
            }
        }

        const score = calculateScore(processedMark, selectedEvent, tableData);
        const displayScore = score > 1400 ? '+1400 (Out of Tables)' : 
                            score === 0 ? '0 (Out of Tables)' : score;
        
        addResultToTable(gender, track, selectedEvent, processedMark, displayScore);
    }
    else if (scoreInput && scoreTabVisible) {
        if (!REGEX.POINTS.test(scoreInput)) {
            showError('The format must be in Points');
            return;
        }

        const points = Number(scoreInput);
        if (points < 1 || points > 1400) {
            showError('Tables are only valid between 1 - 1400 Points');
            return;
        }

        let mark = findMarkByScore(points, selectedEvent, tableData);
        
        if (!mark || mark === '-') {
            for (let i = 0; i < 100; i++) {
                mark = findMarkByScore(points + i, selectedEvent, tableData);
                if (mark && mark !== '-') break;
                
                mark = findMarkByScore(points - i, selectedEvent, tableData);
                if (mark && mark !== '-') break;
            }
        }

        if (mark && mark !== '-') {
            addResultToTable(gender, track, selectedEvent, mark, points);
        } else {
            showError('No mark found for this score in the selected event');
        }
    } else {
        showError('Please enter a mark or score');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
    clearError(); // Inicialitzar el fons transparent
    await loadScoringTables();
    updateEventOptions();

    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            contents.forEach(content => content.style.display = 'none');
            const target = tab.getAttribute('data-tab');
            document.getElementById(target).style.display = 'block';
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    document.querySelectorAll('input[name="outdoor_indoor"]').forEach(radio => {
        radio.addEventListener('change', updateEventOptions);
    });

    document.querySelectorAll('input[name="men_women"]').forEach(radio => {
        radio.addEventListener('change', updateEventOptions);
    });

    document.getElementById('prueba').addEventListener('change', updateMarkInput);
    document.getElementById('formulario').addEventListener('submit', handleFormSubmit);
    document.getElementById('limpiarResultados').addEventListener('click', clearResults);

    let selectedRow = null;

    document.getElementById('resultado').addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'td') {
            selectedRow = e.target.closest('tr');
            const popup = document.getElementById('popup_papelera');
            popup.style.display = 'block';
            const rect = selectedRow.getBoundingClientRect();
            popup.style.left = `${rect.left + window.scrollX + selectedRow.offsetWidth + 10}px`;
            popup.style.top = `${rect.top + window.scrollY + selectedRow.offsetHeight / 2 - popup.offsetHeight / 2}px`;
        }
    });

    document.getElementById('popup_papelera').addEventListener('click', () => {
        if (selectedRow) {
            selectedRow.remove();
            document.getElementById('popup_papelera').style.display = 'none';
            checkForTD();
        }
    });

    document.addEventListener('mousedown', (e) => {
        const popup = document.getElementById('popup_papelera');
        const isClickInsidePopup = popup.contains(e.target);
        const isClickInsideTable = e.target.closest('#resultado');

        if (!isClickInsidePopup && !isClickInsideTable) {
            popup.style.display = 'none';
        }
    });
});