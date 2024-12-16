// Cargar la API de Google y autenticar al usuario
function gapiInit() {
    gapi.load('client:auth2', async () => {
        await gapi.client.init({
            apiKey: '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', // Reemplaza con tu API Key
            clientId: '355052591281-haj4ho65tfppr51ei49f93e79r0rsct1.apps.googleusercontent.com', // Reemplaza con tu Client ID
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: 'https://www.googleapis.com/auth/drive.file'
        });
    });
}

// Función para autenticar al usuario
async function authenticateUser() {
    await gapi.auth2.getAuthInstance().signIn();
}

// Función para guardar los datos de la tabla en un archivo de texto
async function guardarLista() {
    const tablaAlumnos = document.getElementById('tabla-alumnos');
    let contenido = '';

    // Recorrer las filas de la tabla y construir el contenido
    Array.from(tablaAlumnos.rows).forEach(row => {
        const alumno = row.cells[0].textContent;
        const nombre = row.cells[1].textContent;
        const asistio = row.cells[2].querySelector('input').checked ? 'Sí' : 'No';
        const materia = row.cells[3].textContent;

        contenido += `${alumno}, ${nombre}, ${asistio}, ${materia}\n`;
    });

    // Crear el archivo
    const fileContent = new Blob([contenido], { type: 'text/plain' });
    const metadata = {
        name: 'lista_alumnos.txt',
        parents: ['1HO_fZ_kqtEgyD9dWLcFnFA_nRd8UenkU'], // ID de la carpeta
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileContent);

    // Subir el archivo a Google Drive
    const accessToken = gapi.auth.getToken().access_token;
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
        body: form
    });

    if (response.ok) {
        alert('Lista guardada exitosamente en Google Drive.');
    } else {
        console.error('Error al guardar el archivo:', await response.text());
        alert('Hubo un error al guardar la lista.');
    }
}

// Agregar el evento al botón "guardar-lista"
document.getElementById('guardar-lista').addEventListener('click', async () => {
    try {
        await authenticateUser();
        await guardarLista();
    } catch (error) {
        console.error('Error durante el proceso de autenticación o guardado:', error);
    }
});

// Inicializar la API de Google
gapiInit();


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
        cargarAlumnos(data, materiaSeleccionada, grupoSeleccionado);
    });
}

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
