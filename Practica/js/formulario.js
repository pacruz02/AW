
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("formularioReservas");
    
    //"Intercepta" el formulario 
    form.addEventListener("submit", function (event) {

        //recoge los datos del formulario
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const fechaInicio = document.getElementById('diaI');
        const fechaFin = document.getElementById('diaF');

        let valido = true;

        //Comprueba la validez del nombre
        if (nombre.length < 3) {
            console.log('hola');
            setError(nombre, 'El nombre debe tener al menos 3 caracteres');
            valido = false;
        }

        if(nombre ===''){
            setError(nombre, 'El nombre es obligatorio');
            valido = false;
        }

        if(valido)
            clearError(nombre);

        //Comprueba la validez del correo
        const expRegEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!expRegEmail.test(email)) {
            setError(email, 'El email no es correcto');
            valido = false;
        }
        
        if(valido)
            clearError(nombre);

        //Comprueba la validez de la fecha
        const hoy = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin); 
        hoy.setHours(0, 0, 0, 0);

        if (inicio < hoy) {
            setError(inicio, 'La fecha de inicio no puede ser anterior a hoy');
            valido = false;
        }

        if(valido)
            clearError(inicio);

        if (fin <= inicio) {
            setError(fin, 'La fecha de fin debe ser posterior a la fecha de inicio');
            valido = false;
        }

        if(valido)
            clearError(fin);

        //Si hay algún campo no valido no envía el correo
        if (!valido) {
            event.preventDefault();
        } else {
            alert("Formulario enviado correctamente");
        }

    });
});

function setError(input, message){

    const errorSpan = document.getElementById(input.id + 'Error');
    
    errorSpan.textContent = message;

    input.classList.add('invalid');
    input.classList.add('valid');

    input.setAttribute('aria-invalid', 'true');
    
}

function clearError(input){

    const errorSpan = document.getElementById(input.id + 'Error');

    errorSpan.textContent = '';

    input.classList.remove('invalid');
    input.classList.add('valid');
    input.removeAttribute('aria-invalid');

}