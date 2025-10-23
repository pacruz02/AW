const http = requiere('http');
//Establecimiento de la función callback del servidor
let servidor = http.createServer(function (request, response) {
    // funcionalidad del servidor
    console.log('Método: ${request.method}');
    console.log('URL: ${request.url}');
    console.log(request.headers);
});
// Inicio del servidor
servidor.listen(3000, function (err) {
    if (err)
        console.log("Error al iniciar el servidor");
    else
        console.log("Servidor escuchando en el puerto 3000");
});