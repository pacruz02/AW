"use strict";
const http = require('http');
const fs = require('fs');
const path = require('path');
//Establecimiento de la función callback del servidor
let servidor = http.createServer(function (request, response) {
    // funcionalidad del servidor
    response.setHeader('Content-Type', 'text/html; charset=utf-8');

    const rutaPublica = path.join(__dirname, 'public');  // Carpeta donde están los archivos estáticos

    // Si la ruta es la raíz, enviar el archivo index.html
    if (request.url === '/') {
        const archivoHTML = path.join(__dirname, 'public', 'html', 'index_es.html');
        fs.readFile(archivoHTML, 'utf-8', (err, data) => {
            if (err) {
                response.statusCode = 500;
                response.end('Error al cargar el archivo HTML');
            } else {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'text/html');
                response.end(data);
            }
        });
    }

    console.log(`Método: ${request.method}`);
    console.log(`URL: ${request.url}`);
    console.log(request.headers);
});
// Inicio del servidor
servidor.listen(3000, function (err) {
    if (err)
        console.log("Error al iniciar el servidor");
    else
        console.log("Servidor escuchando en el puerto 3000: http://localhost:3000/");
});