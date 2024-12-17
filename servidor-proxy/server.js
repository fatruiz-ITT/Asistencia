// Importar las dependencias necesarias
const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Configurar el puerto
const port = process.env.PORT || 3000;

// Middleware para parsear las solicitudes JSON
app.use(express.json());

// Ruta de proxy para redirigir las solicitudes a Google Sheets u otro servicio
app.post('/proxy', async (req, res) => {
    const { cambios } = req.body;

    const urlGoogleSheets = 'https://script.google.com/macros/s/AKfycbyWq7jwg0nYwJ1hLpoXCj8lA1uBOXp-lcMTKFzLiL8LY5OgeyqA2PGGw4eZpqFxO-ne/exec'; // La URL de tu endpoint de Google Sheets

    try {
        // Hacer la solicitud a Google Sheets
        const response = await fetch(urlGoogleSheets, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cambios })
        });

        // Parsear la respuesta y devolverla al cliente
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error en el proxy:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
//Prueba de codigo
