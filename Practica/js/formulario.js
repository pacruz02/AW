document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("formularioReservas");

    form.addEventListener("submit", function (event) {

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const fechaInicio = document.getElementById('diaI').value;
        const fechaFin = document.getElementById('diaF').value;

        let valido = true;

        if (nombre.length < 3) {
            alert("El nombre de tener más de 3 caracteres");
            valido = false;
            console.log("Nombre no válido");
        }

        const expRegEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!expRegEmail.test(email)) {
            alert("El email no es válido");
            valido = false;
            console.log("Email no válido");
        }

        const hoy = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin); 
        hoy.setHours(0, 0, 0, 0);

        if (inicio < hoy) {
            alert("La fecha de inicio no puede ser anterior a hoy");
            valido = false;
            console.log("Fecha de inicio no válida");
        }

        if (fin <= inicio) {
            alert("La fecha de fin debe ser posterior a la fecha de inicio");
            valido = false;
            console.log("Fecha de fin no válida");
        }

        if (!valido) {
            event.preventDefault();
        } else {
            alert("Formulario enviado correctamente");
        }

    });
});