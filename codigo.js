// Función para renovar el token de acceso
async function renovarAccessToken() {
    const clientId = '355052591281-haj4ho65tfppr51ei49f93e79r0rsct1.apps.googleusercontent.com';
    const clientSecret = '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';
    const refreshToken = '1//046SR2Bd895DvCgYIARAAGAQSNwF-L9IrjlTcWBE6ibiN0dIHd-AyC1LYzIs0dFG1UjUQ7fLSPFweb3_5-ViUgLsjgMdQwnc9vd0';

    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
    });

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        if (response.ok) {
            const data = await response.json();
            return data.access_token;
        } else {
            console.error('Error al renovar el token de acceso:', await response.text());
            alert('No se pudo renovar el token de acceso.');
        }
    } catch (error) {
        console.error('Error al renovar el token:', error);
    }
}

// Función para guardar la lista en Google Drive
async function guardarListaEnDrive() {
    const tablaAlumnos = document.getElementById('tabla-alumnos');
    const filas = tablaAlumnos.querySelectorAll('tr');
    const datos = [];

    // Obtener los valores de los dropdowns y construir el título del archivo
    const dropdownMateria = document.getElementById('materia');
    const dropdownGrupo = document.getElementById('grupo');
    const materia = dropdownMateria ? dropdownMateria.value.trim() : 'Materia';
    const grupo = dropdownGrupo ? dropdownGrupo.value.trim() : 'Grupo';
    const fecha = new Date();
    const fechaFormateada = `${fecha.toLocaleString('es-ES', { month: 'short' })} ${fecha.getDate()} de ${fecha.getFullYear()}`;
    const nombreArchivo = `${materia}-${grupo}-${fechaFormateada}.txt`;

    // Recopilar datos de la tabla
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length > 0) {
            const alumno = celdas[0].textContent.trim();
            const nombre = celdas[1].textContent.trim();
            const asistio = celdas[2].querySelector('input').checked ? 'Sí' : 'No';
            const materia = celdas[3].textContent.trim();
            datos.push(`${alumno},${nombre},${asistio},${materia}`);
        }
    });

    // Convertir datos a formato de texto
    const contenido = datos.join('\n');

    // Renovar el token de acceso antes de subir el archivo
    const accessToken = await renovarAccessToken();
    if (!accessToken) {
        alert('No se pudo obtener el token de acceso. Inténtalo nuevamente.');
        return;
    }

    // Subir el archivo a Google Drive
    const fileMetadata = {
        name: nombreArchivo,
        mimeType: 'application/vnd.google-apps.file',
        parents: ['1HO_fZ_kqtEgyD9dWLcFnFA_nRd8UenkU'] // ID de la carpeta en Drive
    };
    const fileContent = new Blob([contenido], { type: 'text/plain' });

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', fileContent);

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: form
        });

        if (response.ok) {
            alert('Lista guardada exitosamente en Google Drive.');
        } else {
            const errorDetails = await response.json();
            console.error('Error al guardar el archivo:', errorDetails);
            alert(`Error al guardar la lista: ${errorDetails.error.message || 'Desconocido'}`);
        }
    } catch (error) {
        console.error('Error al guardar la lista en Drive:', error);
        alert('Ocurrió un error al guardar la lista.');
    }
}

// Agregar evento al botón de guardar
const botonGuardar = document.getElementById('guardar-lista');
if (botonGuardar) {
    botonGuardar.addEventListener('click', guardarListaEnDrive);
}

// Funciones de manejo de eventos
document.getElementById('btn-anexar').addEventListener('click', () => {
    document.getElementById('form-anexar').style.display = 'block';
    document.getElementById('form-pasar-lista').style.display = 'none';
    document.getElementById('form-visualizar-lista').style.display = 'none';
    document.getElementById('form-eliminar-lista').style.display = 'none';
    document.getElementById('form-imprimir-lista').style.display = 'none';
});

document.getElementById('btn-pasar-lista').addEventListener('click', () => {
    document.getElementById('form-anexar').style.display = 'none';
    document.getElementById('form-pasar-lista').style.display = 'block';
    document.getElementById('form-visualizar-lista').style.display = 'none';
    document.getElementById('form-eliminar-lista').style.display = 'none';
    document.getElementById('form-imprimir-lista').style.display = 'none';
    cargarEmpresas(); // Cargar empresas y grupos
});

document.getElementById('btn-visualizar').addEventListener('click', () => {
    document.getElementById('form-anexar').style.display = 'none';
    document.getElementById('form-pasar-lista').style.display = 'none';
    document.getElementById('form-visualizar-lista').style.display = 'block';
    document.getElementById('form-eliminar-lista').style.display = 'none';
    document.getElementById('form-imprimir-lista').style.display = 'none';
    cargarEmpresasVisualizar();
});

document.getElementById('btn-borrar').addEventListener('click', () => {
    document.getElementById('form-anexar').style.display = 'none';
    document.getElementById('form-pasar-lista').style.display = 'none';
    document.getElementById('form-visualizar-lista').style.display = 'none';
    document.getElementById('form-eliminar-lista').style.display = 'block';
    document.getElementById('form-imprimir-lista').style.display = 'none';
    cargarEmpresasEliminar();
});

document.getElementById('btn-imprimir').addEventListener('click', () => {
    document.getElementById('form-anexar').style.display = 'none';
    document.getElementById('form-pasar-lista').style.display = 'none';
    document.getElementById('form-visualizar-lista').style.display = 'none';
    document.getElementById('form-eliminar-lista').style.display = 'none';
    document.getElementById('form-imprimir-lista').style.display = 'block';
    cargarEmpresasImprimir();
});

const FOLDER_ID = "1HO_fZ_kqtEgyD9dWLcFnFA_nRd8UenkU"; // ID de la carpeta en Drive

document.getElementById('visualizar').addEventListener('click', async () => {
    const empresa = document.getElementById('materia-visualizar').value;
    const grupo = document.getElementById('grupo-visualizar').value;
    const fecha = document.getElementById('fecha-visualizar').value;

    // Validación de los campos
    if (!empresa || !grupo || !fecha) {
        alert('Por favor, selecciona una Empresa, Grupo-Materia y Fecha.');
        return;
    }

    // Formatea la fecha y construye el nombre del archivo
    const fechaFormateada = formatearFecha(fecha);
    const nombreArchivo = `${empresa}-${grupo}-${fechaFormateada}`;
    console.log(`Buscando archivo: ${nombreArchivo}`); // Muestra el nombre del archivo en consola

    try {
        const accessToken = await renovarAccessToken(); // Renueva el token de acceso
        const archivo = await buscarArchivoEnDrive(nombreArchivo, accessToken);

        if (archivo) {
            console.log(`Archivo encontrado: ${archivo.name} (ID: ${archivo.id})`);
            const contenido = await descargarContenidoArchivo(archivo.id, accessToken);
            mostrarTabla(contenido, fecha);
        } else {
            alert('No se encontró un archivo con ese nombre.');
            console.warn('Archivo no encontrado.');
        }
    } catch (error) {
        console.error("Error:", error);
        alert('Ocurrió un error al buscar el archivo.');
    }
});

// Buscar archivo en Google Drive usando el Access Token
async function buscarArchivoEnDrive(nombreArchivo, accessToken) {
    const url = `https://www.googleapis.com/drive/v3/files?q="'${FOLDER_ID}' in parents and name='${nombreArchivo}'"&fields=files(id,name)`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        console.error('Error al buscar en Drive:', await response.text());
        throw new Error('No se pudo realizar la búsqueda en Google Drive.');
    }

    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
}

// Descargar el contenido del archivo
async function descargarContenidoArchivo(fileId, accessToken) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        console.error('Error al descargar el archivo:', await response.text());
        throw new Error('No se pudo descargar el archivo.');
    }

    return await response.text(); // Asume que el archivo es texto plano o CSV
}

// Mostrar la tabla con los datos
function mostrarTabla(contenido, fecha) {
    const filas = contenido.trim().split('\n'); // Divide el contenido por líneas
    const datos = filas.map(fila => fila.split(',')); // Divide cada línea por comas

    const contenedor = document.createElement('div');
    contenedor.className = 'container mt-3';
    contenedor.innerHTML = `
        <h3 class="text-center">Lista del día ${formatearFechaVisual(fecha)}</h3>
        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Número de Empleado</th>
                    <th>Nombre del Alumno</th>
                    <th>Asistió</th>
                    <th>Empresa</th>
                </tr>
            </thead>
            <tbody>
                ${datos.map(d => `
                    <tr>
                        <td>${d[0]}</td>
                        <td>${d[1]}</td>
                        <td>${d[2]}</td>
                        <td>${d[3]}</td>
                    </tr>`).join('')}
            </tbody>
        </table>
    `;
    document.body.appendChild(contenedor);
}

// Renueva el token de acceso
async function renovarAccessToken() {
    const clientId = '355052591281-haj4ho65tfppr51ei49f93e79r0rsct1.apps.googleusercontent.com';
    const clientSecret = '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';
    const refreshToken = '1//046SR2Bd895DvCgYIARAAGAQSNwF-L9IrjlTcWBE6ibiN0dIHd-AyC1LYzIs0dFG1UjUQ7fLSPFweb3_5-ViUgLsjgMdQwnc9vd0';

    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
    });

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        if (response.ok) {
            const data = await response.json();
            return data.access_token;
        } else {
            console.error('Error al renovar el token de acceso:', await response.text());
            throw new Error('No se pudo renovar el token de acceso.');
        }
    } catch (error) {
        console.error('Error al renovar el token:', error);
        throw error;
    }
}

// Formatea la fecha para el nombre del archivo
function formatearFecha(fechaInput) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const fecha = new Date(fechaInput);
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    return `${mes} ${dia} de ${anio}`;
}

// Formatea la fecha para visualización en la tabla
function formatearFechaVisual(fechaInput) {
    const fecha = new Date(fechaInput);
    return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}


// Funciones de carga de datos desde Google Sheets
async function cargarEmpresas() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/1sLO2eSk409iWY7T_t0Dj0PMuqg9TK6gDmzmnk77jWgc/gviz/tq?tqx=out:json&sheet=AnexoAlumnos";
    const response = await fetch(sheetURL);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const empresas = new Set();
    const grupos = {};
    const data = json.table.rows;
    const selectEmpresa = document.getElementById('materia');
    selectEmpresa.innerHTML = '<option value="">Selecciona una opción</option>';

    data.forEach(row => {
        const empresa = row.c[4]?.v; // Columna E para Empresa
        if (empresa) {
            empresas.add(empresa);
            const grupo = row.c[3]?.v; // Columna D para Grupo-Materia
            if (grupo && !grupos[empresa]) {
                grupos[empresa] = new Set();
            }
            if (grupo) {
                grupos[empresa].add(grupo);
            }
        }
    });

    empresas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa;
        option.textContent = empresa;
        selectEmpresa.appendChild(option);
    });

    selectEmpresa.addEventListener('change', () => {
        cargarGrupos(data, selectEmpresa.value, grupos, 'grupo');
    });

    document.getElementById('grupo').addEventListener('change', () => {
        const materiaSeleccionada = selectEmpresa.value;
        const grupoSeleccionado = document.getElementById('grupo').value;
        cargarAlumnos(data, materiaSeleccionada, grupoSeleccionado);
    });
}

// Función para cargar los grupos según la materia seleccionada
function cargarGrupos(data, empresaSeleccionada, grupos, selectId) {
    const selectGrupo = document.getElementById(selectId);
    selectGrupo.innerHTML = '<option value="">Selecciona una opción</option>';

    if (empresaSeleccionada && grupos[empresaSeleccionada]) {
        grupos[empresaSeleccionada].forEach(grupo => {
            const option = document.createElement('option');
            option.value = grupo;
            option.textContent = grupo;
            selectGrupo.appendChild(option);
        });
    }
}

// Función para cargar los alumnos
function cargarAlumnos(data, materiaSeleccionada, grupoSeleccionado) {
    const tablaAlumnos = document.getElementById('tabla-alumnos');
    tablaAlumnos.innerHTML = ''; // Limpiar la tabla

    const alumnosFiltrados = data.filter(row => {
        const empresa = row.c[4]?.v; // Columna E para Empresa
        const grupo = row.c[3]?.v;  // Columna D para Grupo
        return empresa === materiaSeleccionada && grupo === grupoSeleccionado;
    });

    alumnosFiltrados.forEach(row => {
        const alumno = row.c[1]?.v;
        const nombre = row.c[2]?.v;
        const asistio = row.c[3]?.v;
        const fechaAsistencia = row.c[5]?.v;
// SI QUIERO VER MATERIA id grupoSeleccionado SI QUIER VER EMPRESA materiaSeleccionada
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${alumno}</td>
            <td>${nombre}</td>
            <td style="display: flex; align-items: center; justify-content: center;"><input type="checkbox" ${asistio === 'Sí' ? 'checked' : ''}></td>
            <td>${materiaSeleccionada}</td>
        `;
        tablaAlumnos.appendChild(tr);
    });
}

// Funciones de carga para los formularios de Visualizar, Eliminar e Imprimir
async function cargarEmpresasVisualizar() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/1sLO2eSk409iWY7T_t0Dj0PMuqg9TK6gDmzmnk77jWgc/gviz/tq?tqx=out:json&sheet=AnexoAlumnos";
    const response = await fetch(sheetURL);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const empresas = new Set();
    const grupos = {};
    const data = json.table.rows;
    const selectEmpresa = document.getElementById('materia-visualizar');
    selectEmpresa.innerHTML = '<option value="">Selecciona una opción</option>';

    data.forEach(row => {
        const empresa = row.c[4]?.v; // Columna E para Empresa
        if (empresa) {
            empresas.add(empresa);
            const grupo = row.c[3]?.v; // Columna D para Grupo
            if (grupo && !grupos[empresa]) {
                grupos[empresa] = new Set();
            }
            if (grupo) {
                grupos[empresa].add(grupo);
            }
        }
    });

    empresas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa;
        option.textContent = empresa;
        selectEmpresa.appendChild(option);
    });

    selectEmpresa.addEventListener('change', () => {
        cargarGrupos(data, selectEmpresa.value, grupos, 'grupo-visualizar');
    });

    document.getElementById('grupo-visualizar').addEventListener('change', () => {
        const materiaSeleccionada = selectEmpresa.value;
        const grupoSeleccionado = document.getElementById('grupo-visualizar').value;
        // Aquí puedes agregar funcionalidad adicional si es necesario
    });
}

// Inicializar la carga de datos
cargarEmpresasVisualizar();

// Función para cargar empresas en el formulario de eliminación
async function cargarEmpresasEliminar() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/1sLO2eSk409iWY7T_t0Dj0PMuqg9TK6gDmzmnk77jWgc/gviz/tq?tqx=out:json&sheet=AnexoAlumnos";
    const response = await fetch(sheetURL);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const empresas = new Set();
    const grupos = {};
    const data = json.table.rows;
    const selectEmpresa = document.getElementById('materia-eliminar');
    selectEmpresa.innerHTML = '<option value="">Selecciona una opción</option>';

    data.forEach(row => {
        const empresa = row.c[4]?.v; // Columna E para Empresa
        if (empresa) {
            empresas.add(empresa);
            const grupo = row.c[3]?.v; // Columna D para Grupo
            if (grupo && !grupos[empresa]) {
                grupos[empresa] = new Set();
            }
            if (grupo) {
                grupos[empresa].add(grupo);
            }
        }
    });

    empresas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa;
        option.textContent = empresa;
        selectEmpresa.appendChild(option);
    });

    selectEmpresa.addEventListener('change', () => {
        cargarGrupos(data, selectEmpresa.value, grupos, 'grupo-eliminar');
    });

    document.getElementById('grupo-eliminar').addEventListener('change', () => {
        const materiaSeleccionada = selectEmpresa.value;
        const grupoSeleccionado = document.getElementById('grupo-eliminar').value;
        cargarAlumnos(data, materiaSeleccionada, grupoSeleccionado);
    });
}

// Función para cargar empresas en el formulario de impresión
async function cargarEmpresasImprimir() {
    const sheetURL = "https://docs.google.com/spreadsheets/d/1sLO2eSk409iWY7T_t0Dj0PMuqg9TK6gDmzmnk77jWgc/gviz/tq?tqx=out:json&sheet=AnexoAlumnos";
    const response = await fetch(sheetURL);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const empresas = new Set();
    const grupos = {};
    const data = json.table.rows;
    const selectEmpresa = document.getElementById('materia-imprimir');
    selectEmpresa.innerHTML = '<option value="">Selecciona una opción</option>';

    data.forEach(row => {
        const empresa = row.c[4]?.v; // Columna E para Empresa
        if (empresa) {
            empresas.add(empresa);
            const grupo = row.c[3]?.v; // Columna D para Grupo
            if (grupo && !grupos[empresa]) {
                grupos[empresa] = new Set();
            }
            if (grupo) {
                grupos[empresa].add(grupo);
            }
        }
    });

    empresas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa;
        option.textContent = empresa;
        selectEmpresa.appendChild(option);
    });

    selectEmpresa.addEventListener('change', () => {
        cargarGrupos(data, selectEmpresa.value, grupos, 'grupo-imprimir');
    });

    document.getElementById('grupo-imprimir').addEventListener('change', () => {
        const materiaSeleccionada = selectEmpresa.value;
        const grupoSeleccionado = document.getElementById('grupo-imprimir').value;
        cargarAlumnos(data, materiaSeleccionada, grupoSeleccionado);
    });
}
