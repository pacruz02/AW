"use strict";
const http = require('http');
const fs = require('fs');
const path = require('path');

const servidor = http.createServer((request, response) => {

    console.log(`Método: ${request.method}`);
    console.log(`URL: ${request.url}`);

    const rutaPublica = path.join(__dirname, 'public');

    if (request.url === "/") {
        const archivoHTML = path.join(rutaPublica, 'html', 'index_es.html');
        return fs.readFile(archivoHTML, 'utf-8', (err, data) => {
            if (err) {
                response.statusCode = 500;
                return response.end('Error al cargar el archivo HTML');
            }
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(data);
        });
    }

    const rutaArchivo = path.join(rutaPublica, request.url);

    fs.readFile(rutaArchivo, (err, data) => {
        if (err) {
            response.statusCode = 404;
            return response.end('Archivo no encontrado');
        }

        // Determinar MIME type
        const ext = path.extname(rutaArchivo).toLowerCase();
        const tipos = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml"
        };

        response.setHeader("Content-Type", tipos[ext] || "application/octet-stream");
        response.statusCode = 200;
        response.end(data);
    });

});

servidor.listen(3000, () => {
    console.log("Servidor escuchando en http://localhost:3000/");
});