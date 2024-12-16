document.getElementById('guardar-lista').addEventListener('click', async function() {
  const alumnos = [];
  const filas = document.querySelectorAll('#tabla-alumnos tr');

  filas.forEach(function(fila) {
    const celdas = fila.querySelectorAll('td');
    const numeroEmpleado = celdas[0].textContent.trim();
    const nombreAlumno = celdas[1].textContent.trim();
    const asistio = celdas[2].querySelector('input').checked ? 'Sí' : 'No';
    const fechaAsistencia = celdas[3].textContent.trim();

    // Verificar que los campos no estén vacíos
    if (numeroEmpleado && nombreAlumno && fechaAsistencia) {
      alumnos.push({
        numeroEmpleado: numeroEmpleado,
        nombreAlumno: nombreAlumno,
        asistio: asistio,
        fechaAsistencia: fechaAsistencia
      });
    }
  });

  // Verificar si hay alumnos para enviar
  if (alumnos.length === 0) {
    alert('No hay datos para guardar');
    return;
  }

  try {
    // Enviar los datos al Google Apps Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbyjV7WkJHbX9-hBtmGbkqiS9x0LhzmCCHxoU7y5hZZoRPvfjkqO0nyKu0h7z9QaS_tUHw/exe',
    {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(alumnos),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // Comprobar la respuesta en consola
  const result = await response.json();
  console.log(response);

    // Comprobar si la respuesta es exitosa
    if (response.ok) {
      alert('Datos guardados correctamente en Google Sheets');
    } else {
      alert('Hubo un error al guardar los datos: ' + response.statusText);
    }
  } catch (error) {
    alert('Error de red: ' + error.message);
  }
});


document.getElementById('guardar-lista').addEventListener('click', async () => {
    const tabla = document.getElementById('tabla-alumnos');
    const filas = tabla.querySelectorAll('tbody tr');  // Cambié aquí
    const datos = [];

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length > 0) {
            // Recolectamos solo los 4 elementos que necesitas
            const numeroEmpleado = celdas[0]?.textContent.trim(); // Número de Empleado
            const nombreAlumno = celdas[1]?.textContent.trim();   // Nombre del Alumno
            const asistio = celdas[2]?.querySelector('input')?.checked ? 'Sí' : 'No'; // Asistió?
            const fechaAsistencia = celdas[3]?.textContent.trim(); // Fecha de Asistencia

            // Creamos una fila de datos con estos 4 elementos
            const filaDatos = [numeroEmpleado, nombreAlumno, asistio, fechaAsistencia];
            datos.push(filaDatos); // Agrega la fila de datos
        }
    });

    // URL del Web App de Google Apps Script (reemplaza con la URL que copiaste)
    const url = 'https://script.google.com/macros/s/AKfycbyjV7WkJHbX9-hBtmGbkqiS9x0LhzmCCHxoU7y5hZZoRPvfjkqO0nyKu0h7z9QaS_tUHw/exec'; // Reemplaza con la URL de tu Web App

    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ datos: datos })
        });

        const result = await response.json();
        if (result.success) {
            alert('Datos guardados exitosamente');
        } else {
            alert('Hubo un problema al guardar los datos');
        }
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos');
    }
});
