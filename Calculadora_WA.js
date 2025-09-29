import { points_mens_outdor } from './world_athletics_scoring_tables_of_athlet_2022_Mens.js';
import { points_womens_outdor } from './world_athletics_scoring_tables_of_athlet_2022_Womens.js';
import { points_mens_indoor } from './world_athletics_scoring_tables_of_athlet_2022_Inndoor_Mens.js';
import { points_womens_indoor } from './world_athletics_scoring_tables_of_athlet_2022_Inndoor_Womens.js';

const eventosSinDecimales = [
    "5km", "10km", "15km", "10 Miles", "20km", "HM", 
    "25km", "30km", "Marathon", "100km", "3kmW", 
    "5kmW", "10kmW", "15kmW", "20kmW", "30kmW", 
    "35kmW", "50kmW"
];

const concursos = [
    "HJ", "PV", "LJ", "TJ",
    "SP", "DT", "HT", "JT"
];

const combinadas = [
    "Decathlon", "Heptathlon", "Pentathlon"
];

// Mensaje de Error
const mensajeErrorDiv = document.getElementById('mensaje_error');

// Elimina el contenido del mensaje de error
mensajeErrorDiv.innerHTML = '';

// Verifica si el div tiene contenido
if (mensajeErrorDiv.innerHTML.trim() == '') {
    mensajeErrorDiv.style.backgroundColor = 'transparent'; // Elimina el fondo
} else {
    mensajeErrorDiv.style.backgroundColor = '#f5bcbc'; // Restaura el fondo si hay contenido
}

let elementotr;

const regexMarca = /^(?:(\d+):(\d{2}):(\d{2})(?:\.(\d+))?|(\d+):(\d{2})(?:\.(\d+))?|(\d+)(?:\.(\d+))?)$/; // Expresión regular para validar los formatos permitidos  (1. "9.58" 2. "1:20.33" 3. "25:15.44" 4. "15:20" 5. "5653" 6. "100.98" 7. 3:40:04.30)
const regexconcursos = /^\d+(\.\d+)?$/; // Solo para concursos, (1. "100.89", "2.55", 3. "4.6" 4. "77.8")
const regexPuntos = /^\d+$/; // Expresión regular para validar los formatos permitidos  (1. "958")

// Funciones
const buscarPuntos = (marca, prueba, tabla) => {
    var puntos;
    const resultado = tabla.find(entry => entry[prueba] == marca);
    if (resultado) {
        puntos = resultado.puntos;
    } else {
        puntos = null;
    }
    return puntos;
};

const buscarMarca = (puntos, prueba, tabla) => {
    var marca;
    const resultado = tabla.find(entry => entry.puntos == puntos);
    if (resultado) {
        marca = resultado[prueba];
    } else {
        marca = null;
    }
    return marca;
};

function convertirTiempoEnSegundos(tabla, posicionI, evento) {

    let tiempoEnSegundos = tabla[posicionI][evento].split(':');
    
    let totalSegundos = 0;

    // Verificamos cuántos elementos hay en la tabla
    if (tiempoEnSegundos.length == 3) {
        // Formato: horas:minutos:segundos
        let horas = Number(tiempoEnSegundos[0]);
        let minutos = Number(tiempoEnSegundos[1]);
        let segundos = Number(tiempoEnSegundos[2]);
        totalSegundos = (horas * 3600) + (minutos * 60) + segundos;
    } else if (tiempoEnSegundos.length == 2) {
        // Formato: minutos:segundos
        let minutos = Number(tiempoEnSegundos[0]);
        let segundos = Number(tiempoEnSegundos[1]);
        totalSegundos = (minutos * 60) + segundos;
    } else if (tiempoEnSegundos.length == 1) {
        // Formato: solo segundos
        totalSegundos = Number(tiempoEnSegundos[0]);
    }

    return totalSegundos; // Retorna el tiempo total en segundos
}

function convertirTiempoEnSegundos_soloMarca(marca) {
    let tiempoEnSegundos = marca.split(':');

    let totalSegundos = 0;

    // Verificamos cuántos elementos hay en el tiempo
    if (tiempoEnSegundos.length == 3) {
        // Formato: horas:minutos:segundos
        let horas = Number(tiempoEnSegundos[0]);
        let minutos = Number(tiempoEnSegundos[1]);
        let segundos = Number(tiempoEnSegundos[2]);
        totalSegundos = (horas * 3600) + (minutos * 60) + segundos;
    } else if (tiempoEnSegundos.length == 2) {
        // Formato: minutos:segundos
        let minutos = Number(tiempoEnSegundos[0]);
        let segundos = Number(tiempoEnSegundos[1]);
        totalSegundos = (minutos * 60) + segundos;
    } else if (tiempoEnSegundos.length == 1) {
        // Formato: solo segundos
        totalSegundos = Number(tiempoEnSegundos[0]);
    }

    return totalSegundos; // Retorna el tiempo total en segundos
}

function convertirSegundosMarca(numero) {
    // Calculamos las horas, minutos y segundos
    let horas = Math.floor(numero / 3600); // Convertimos a horas
    let minutos = Math.floor((numero % 3600) / 60); // Obtenemos los minutos restantes
    let segundos = (numero % 60).toFixed(2); // Extraemos los segundos y los formateamos a dos decimales
    let retornar;

    // Verificamos si hay horas, solo minutos y segundos, o solo segundos
    if (horas > 0) {
        // Formato: horas:minutos.segundos
        retornar = `${horas}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(5, '0')}`;
    } else if (minutos > 0) {
        // Formato: minutos.segundos
        retornar = `${minutos}:${String(segundos).padStart(5, '0')}`;
    } else {
        // Solo segundos
        retornar = `${segundos}`;
    }
    
    return retornar;
}

function calculos(points_array, outdoorIndoor, menWomen, selectedEvent, marcaInput, estadoTablaMarca, puntosInput, estadoTablaPuntos) {
    if (marcaInput != "" && estadoTablaMarca != 'none') { // Por marca
        // Por si las primeras marcas son == "-"
        let salir_marca_maxima = false;
        let salir_marca_minima = false;
        let numeroImaxima;
        let numeroIminima;
        for (let i = 0; !salir_marca_maxima; i++) {
            if (points_array[i][selectedEvent] != "-") {
                numeroImaxima = i;
                salir_marca_maxima = true;
            }
        }

        for (let i = 1399; !salir_marca_minima; i--) {
            if (points_array[i][selectedEvent] != "-") {
                numeroIminima = i;
                salir_marca_minima = true;
            }
        }

        if (!concursos.includes(selectedEvent) && !combinadas.includes(selectedEvent)) { // Los que no son concursos ni combinadas
            if (regexMarca.test(marcaInput)) {
                // Verificamos si hay decimales
                let marcaFinal;
                if (!eventosSinDecimales.includes(selectedEvent)) {
                    marcaFinal = convertirTiempoEnSegundos_soloMarca(marcaInput);
                    marcaFinal = convertirSegundosMarca(marcaFinal);
                } else {
                    marcaFinal = marcaInput;
                }

                const puntos = buscarPuntos(marcaFinal, selectedEvent, points_array);

                if (convertirTiempoEnSegundos(points_array, numeroImaxima, selectedEvent) > convertirTiempoEnSegundos_soloMarca(marcaFinal)) {
                    agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaFinal, "+1400 (Out of Tables)"); // Fuera de Tablas
                    //resultadoTabla.textContent = `(Poner en Tabla): ${menWomen} - ${outdoorIndoor}      ${selectedEvent} - ${marcaFinal} - +1400 (Out of Tables)`;
                } else if (convertirTiempoEnSegundos(points_array, numeroIminima, selectedEvent) < convertirTiempoEnSegundos_soloMarca(marcaFinal)) {
                    agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaFinal, "0 (Out of Tables)"); // Fuera de Tablas
                } else {
                    if (puntos) {
                        agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaFinal, puntos);
                    } else {
                        let salir_marca = false;

                        for (let i = 0; !salir_marca; i++) {
                            let marcaFinalSegundos = convertirTiempoEnSegundos_soloMarca(marcaFinal);
                            let marcaISegundos = convertirTiempoEnSegundos(points_array, i, selectedEvent);

                            if (marcaFinalSegundos < marcaISegundos) {

                                let nuevosPuntos = 1400 - i;

                                agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaFinal, nuevosPuntos);

                                salir_marca = true;
                            }
                        }
                    }
                }
            } else {
                if (!eventosSinDecimales.includes(selectedEvent)) {
                    mensajeErrorDiv.textContent = `The format must be: hh:mm:ss.ss`;
                } else {
                    mensajeErrorDiv.textContent = `The format must be: hh:mm:ss`;
                }
            }
        } else if (combinadas.includes(selectedEvent)) { // Solo las convinadas
            if (regexPuntos.test(marcaInput)) {
                const puntos = buscarPuntos(marcaInput, selectedEvent, points_array);

                if (points_array[numeroImaxima][selectedEvent] < Number(marcaInput)) {

                    agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaInput, "+1400 (Out of Tables)"); // Fuera de Tablas

                } else if (points_array[numeroIminima][selectedEvent] > Number(marcaInput)) {

                    agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaInput, "0 (Out of Tables)"); // Fuera de Tablas

                } else {
                    if (puntos) {
                        agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaInput, puntos);
                    } else {
                        let salir_combinadas = false;

                        for (let i = 0; !salir_combinadas; i++) {
                            
                            if (marcaInput > points_array[i][selectedEvent]) {

                                let nuevosPuntos = 1400 - i;

                                agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaInput, nuevosPuntos);

                                salir_combinadas = true;
                            }
                        }
                    }
                }
            } else {
                mensajeErrorDiv.textContent = `The format must be in points`;
            }
        } else {  // Solo los que son concursos
            if (regexconcursos.test(marcaInput)) {
                let marcaConcurso = Number(marcaInput).toFixed(2);

                const puntos = buscarPuntos(marcaConcurso, selectedEvent, points_array);

                if (points_array[numeroImaxima][selectedEvent] < Number(marcaConcurso)) {

                    agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaConcurso, "+1400 (Out of Tables)"); // Fuera de Tablas

                } else if (points_array[numeroIminima][selectedEvent] > Number(marcaConcurso)) {

                    agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaConcurso, "0 (Out of Tables)"); // Fuera de Tablas

                } else {
                    if (puntos) {
                        agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaConcurso, puntos);
                    } else {
                        let salir_concurso = false;

                        for (let i = 0; !salir_concurso; i++) {
                            
                            if (marcaConcurso > points_array[i][selectedEvent]) {

                                let nuevosPuntos = 1400 - i;

                                agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaConcurso, nuevosPuntos);

                                salir_concurso = true;
                            }
                        }
                    }
                }
            } else {
                mensajeErrorDiv.textContent = `The format must be: m.mm`;
            }
        }
    } else if (estadoTablaPuntos == 'none') {
        if (!concursos.includes(selectedEvent) && !combinadas.includes(selectedEvent)) { // Seleciona un Tiempo
            mensajeErrorDiv.textContent = `Select the Time`;
        } else if (combinadas.includes(selectedEvent)) { // Seleciona Puntos
            mensajeErrorDiv.textContent = `Select the Points`;
        } else { // Seleciona Metros
            mensajeErrorDiv.textContent = `Select the Meters`;
        }
    }
    if (puntosInput != "" && estadoTablaPuntos != 'none') { // Por Puntos
        if (regexPuntos.test(puntosInput)) {
            if (Number(puntosInput) >= 1 && Number(puntosInput) <= 1400) { // Entre 1-1400
                if (Number.isInteger(Number(puntosInput))) { // Solo números enteros
                    const marca = buscarMarca(puntosInput, selectedEvent, points_array);

                    if (marca != '-') {

                        agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marca, puntosInput);

                    } else {
                        let salir_puntos = false;
                        for (let i = 0; !salir_puntos; i++) {

                            let puntosSimilaresArriba = Number(puntosInput) + i;

                            let marcaArriba = buscarMarca(puntosSimilaresArriba, selectedEvent, points_array); // Cabiamos los puntos introduciodos por los de arriba

                            if (marcaArriba != '-' && marcaArriba != null) {
                                agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaArriba, puntosInput);
                                salir_puntos = true;
                            } else {
                                let puntosSimilaresAbajo = Number(puntosInput) - i;

                                let marcaAbajo = buscarMarca(puntosSimilaresAbajo, selectedEvent, points_array); // Cabiamos los puntos introduciodos por los de abajo
                                
                                if (marcaAbajo != '-' && marcaAbajo != null) {
                                    agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marcaAbajo, puntosInput);
                                    salir_puntos = true;
                                }
                            }
                        }
                    }
                } else {
                    mensajeErrorDiv.textContent = `Tables are only valid without decimals`; // Las tablas solo son válidas sin decimales
                }
            } else {
                mensajeErrorDiv.textContent = `Tables are only valid between 1 - 1400 Points`; // Las tablas solo son válidas entre 1 - 1400 puntos
            }
        } else {
            mensajeErrorDiv.textContent = `The format must be in Points`; // El formato debe ser en puntos
        }
    } else if (estadoTablaMarca == 'none') {
        mensajeErrorDiv.textContent = `Select the Points`; // Selecciona los puntos
    }
}

function agregarEnTabla(menWomen, outdoorIndoor, selectedEvent, marca, puntos) {
    // Mostrar en el HTML
    const resultadoTabla = document.getElementById('resultado');

    const tabla_tr_NuevaFila = document.createElement('tr');
    tabla_tr_NuevaFila.classList.add('tabla_tr_NuevaFila');

    const tabla_td_Sexo = document.createElement('td');
    tabla_td_Sexo.classList.add('tabla_td_Sexo');

    const tabla_td_Pista = document.createElement('td');
    tabla_td_Pista.classList.add('tabla_td_Pista');

    const tabla_td_Prueba = document.createElement('td');
    tabla_td_Prueba.classList.add('tabla_td_Prueba');

    const tabla_td_Marca = document.createElement('td');
    tabla_td_Marca.classList.add('tabla_td_Marca');

    const tabla_td_Puntos = document.createElement('td');
    tabla_td_Puntos.classList.add('tabla_td_Puntos'); 

    tabla_td_Sexo.textContent = `${menWomen}`;
    tabla_td_Pista.textContent = `${outdoorIndoor}`;
    tabla_td_Prueba.textContent = `${selectedEvent}`;
    tabla_td_Marca.textContent = `${marca}`;
    tabla_td_Puntos.textContent = `${puntos}`;

    tabla_tr_NuevaFila.appendChild(tabla_td_Sexo);
    tabla_tr_NuevaFila.appendChild(tabla_td_Pista);
    tabla_tr_NuevaFila.appendChild(tabla_td_Prueba);
    tabla_tr_NuevaFila.appendChild(tabla_td_Marca);
    tabla_tr_NuevaFila.appendChild(tabla_td_Puntos);
    
    resultadoTabla.appendChild(tabla_tr_NuevaFila);
}

function actualizarOpcionesSelecionable() {
    const eventType = document.querySelector('input[name="outdoor_indoor"]:checked').id;
    const gender = document.querySelector('input[name="men_women"]:checked').id;
    const selectEvent = document.getElementById('prueba');

    // Limpiar opciones actuales
    selectEvent.innerHTML = '';

    // Crear nuevas opciones basadas en la selección
    let options = [];
    if (eventType == 'indoor') {
        if (gender == 'men') {
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
        if (gender == 'men') {
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
    // Agregar nuevas opciones al select
    options.forEach((option) => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.textContent = option.text;
        newOption.className = option.class;
        newOption.title = option.text;

        selectEvent.appendChild(newOption);
    });
}

function actualizarInputMarca() {
    const marcaSpan = document.getElementById('marca_span');
    const marcaPruebaInput = document.getElementById('marca_prueba');
    const selectedEvent = document.getElementById('prueba').value; // Obtener el valor seleccionado

    if (!concursos.includes(selectedEvent) && !combinadas.includes(selectedEvent) && !eventosSinDecimales.includes(selectedEvent)) { // Selecciona un Tiempo
        marcaSpan.textContent = "Time";
        marcaPruebaInput.placeholder = "hh:mm:ss.ss";
    } else if (eventosSinDecimales.includes(selectedEvent)) { // Selecciona Sin decimales
        marcaSpan.textContent = "Time";
        marcaPruebaInput.placeholder = "hh:mm:ss";
    } else if (combinadas.includes(selectedEvent)) { // Selecciona Puntos
        marcaSpan.textContent = "Points";
        marcaPruebaInput.placeholder = "pts";
    } else { // Selecciona Metros
        marcaSpan.textContent = "Meters";
        marcaPruebaInput.placeholder = "m:mm";
    }
}

function limpiarResultados() {
    // Seleccionamos la tabla
    var tabla = document.getElementById("resultado");
    // Limpiamos todos los tr excepto el primero (el de los encabezados)
    while (tabla.rows.length > 1) {
        tabla.deleteRow(1);
    }
}

// Función que verifica si hay al menos un <td> en la tabla
function checkForTD() {
    // Verifica si hay algún <td> en la tabla
    const table = document.getElementById("resultado");
    const hasTD = table.querySelector("td") != null;

    // Si hay <td>, agrega la clase 'has-td' a la tabla, sino, la elimina
    if (hasTD) {
        table.classList.add("has-td");
    } else {
        table.classList.remove("has-td");
    }

    const observer = new MutationObserver(checkForTD);
    observer.observe(table, {
        childList: true,    // Observar cambios en los nodos hijos (filas y celdas)
        subtree: true,      // Observar cambios en los subelementos dentro de la tabla
    });
}


document.getElementById('resultado').addEventListener('mousedown', function (e) { // se ejecuta cuando se mantiende pulsado (e de elemento)
    if (e.target.tagName.toLowerCase() == 'td') { // Verifica "e" si es un td
        elementotr = e.target.closest('tr'); // Encuetra la fila del td selecionado

        // Mostrar el pop-up
        const popup_papelera = document.getElementById('popup_papelera'); // Selecionamos el pop-up
        popup_papelera.style.display = 'block'; // Ponemos el pop-up visible
        const rect = elementotr.getBoundingClientRect(); // Obtiene la posicion de la fila
        popup_papelera.style.left = `${rect.left + window.scrollX + elementotr.offsetWidth + 10}px`;
        popup_papelera.style.top = `${rect.top + window.scrollY + elementotr.offsetHeight / 2 - popup_papelera.offsetHeight / 2}px`;

    }
});

// Eliminar la fila cuando se haga clic en el La Papelera (pop-up)
document.getElementById('popup_papelera').addEventListener('click', function () {
    if (elementotr) {
        elementotr.remove();
        document.getElementById('popup_papelera').style.display = 'none'; // Ocultar pop-up de nuevo
    }
});

// Ocultar el pop-up si se hace clic fuera de los <td> o del pop-up
document.addEventListener('mousedown', function (e) {
    const popup_papelera = document.getElementById('popup_papelera');
    const isClickInsidePopup = popup_papelera.contains(e.target);
    const isClickInsideTable = e.target.closest('#resultado'); // Verifica si el clic fue dentro del div de la tabla

    if (!isClickInsidePopup && !isClickInsideTable) {
        popup_papelera.style.display = 'none'; // Ocultar pop-up
    }
});


// Limpiar
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("limpiarResultados").addEventListener("click", limpiarResultados);
});

// Marca / Puntos
document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Ocultar todos los contenidos
            contents.forEach(content => {
                content.style.display = 'none';
            });

            // Mostrar el contenido correspondiente
            const target = tab.getAttribute('data-tab');
            document.getElementById(target).style.display = 'block';

            // Opcional: resaltar la pestaña activa
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
});

// Escuchar cambios en los radios de tipo de evento
document.querySelectorAll('input[name="outdoor_indoor"]').forEach((radio) => {
    radio.addEventListener('change', actualizarOpcionesSelecionable);
});

// Escuchar cambios en los radios de género
document.querySelectorAll('input[name="men_women"]').forEach((radio) => {
    radio.addEventListener('change', actualizarOpcionesSelecionable);
});

document.getElementById('prueba').addEventListener('change', actualizarInputMarca);

// Calcular
document.getElementById('formulario').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma normal

    // Obtener el id del radio button de outdoor/indoor y convierte en mañuscula la primera
    const outdoorIndoorId = document.querySelector('input[name="outdoor_indoor"]:checked').id;
    const outdoorIndoor = outdoorIndoorId.charAt(0).toUpperCase() + outdoorIndoorId.slice(1);

    // Obtener el id del radio button de mens/womens y convierte en mañuscula la primera
    const menWomenId = document.querySelector('input[name="men_women"]:checked').id;
    const menWomen = menWomenId.charAt(0).toUpperCase() + menWomenId.slice(1);

    // Obtener el valor del select
    const selectedEvent = document.getElementById('prueba').value;
    
    // Obtener el tiempo ingresado
    const marcaInput = document.getElementById('marca_prueba').value;
    // Tabla Marca
    const tablaMarca = document.getElementById('tabla_marca');
    const estadoTablaMarca = window.getComputedStyle(tablaMarca).display;

    // Obtener los puntos ingresado
    const puntosInput = document.getElementById('puntos_prueba').value;
    // Tabla Puntos
    const tablaPuntos = document.getElementById('tabla_puntos');
    const estadoTablaPuntos = window.getComputedStyle(tablaPuntos).display;
    
    // Elimina el contenido del mensaje de error
    mensajeErrorDiv.innerHTML = '';

    if (outdoorIndoor == "Outdoor") {
        if (menWomen == "Men") {
            calculos(points_mens_outdor, outdoorIndoor, menWomen, selectedEvent, marcaInput, estadoTablaMarca, puntosInput, estadoTablaPuntos);
        } else if (menWomen == "Women") {
            calculos(points_womens_outdor, outdoorIndoor, menWomen, selectedEvent, marcaInput, estadoTablaMarca, puntosInput, estadoTablaPuntos);
        }
    } else if (outdoorIndoor == "Indoor"){
        if (menWomen == "Men") {
            calculos(points_mens_indoor, outdoorIndoor, menWomen, selectedEvent, marcaInput, estadoTablaMarca, puntosInput, estadoTablaPuntos);
        } else if (menWomen == "Women") {
            calculos(points_womens_indoor, outdoorIndoor, menWomen, selectedEvent, marcaInput, estadoTablaMarca, puntosInput, estadoTablaPuntos);
        }
    }

    // Verifica si el div tiene contenido
    if (mensajeErrorDiv.innerHTML.trim() == '') {
        mensajeErrorDiv.style.backgroundColor = 'transparent'; // Elimina el fondo
    } else {
        mensajeErrorDiv.style.backgroundColor = '#f5bcbc'; // Restaura el fondo si hay contenido
    }

    checkForTD();
});

// Inicializar opciones al cargar la página
window.onload = actualizarOpcionesSelecionable;