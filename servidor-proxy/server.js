const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000; // El puerto en el que correrá el servidor

// Configurar middleware
app.use(cors()); // Permite solicitudes desde cualquier origen
app.use(express.json()); // Permite parsear JSON en las solicitudes

// Endpoint del proxy
app.post('/proxy', async (req, res) => {
    const googleScriptURL = 'https://script.google.com/macros/s/AKfycbyWq7jwg0nYwJ1hLpoXCj8lA1uBOXp-lcMTKFzLiL8LY5OgeyqA2PGGw4eZpqFxO-ne/exec';

    try {
        const response = await fetch(googleScriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body), // Pasar el cuerpo original al servidor
        });

        const data = await response.json(); // Convertir respuesta a JSON
        res.json(data); // Enviar respuesta de vuelta al cliente
    } catch (error) {
        console.error('Error en el proxy:', error);
        res.status(500).json({ success: false, message: 'Error al reenviar la solicitud.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor proxy activo en http://localhost:${PORT}`);
});
