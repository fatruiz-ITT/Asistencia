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
