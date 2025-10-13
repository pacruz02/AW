
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
        if (nombre.value.length < 3) {
            console.log('hola');
            setError(nombre, 'El nombre debe tener al menos 3 caracteres');
            valido = false;
        }
        else if (nombre.value === '') {
            setError(nombre, 'El nombre es obligatorio');
            valido = false;
        } else {
            clearError(nombre);
        }

        //Comprueba la validez del correo
        const expRegEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!expRegEmail.test(email.value)) {
            setError(email, 'El email no es correcto');
            valido = false;
        } else {
            clearError(email);
        }

        //Comprueba la validez de la fecha
        const inicio = new Date(fechaInicio.value);
        const fin = new Date(fechaFin.value);
        const hoy = new Date();

        if (inicio < hoy) {
            setError(fechaInicio, 'La fecha de inicio no puede ser anterior a hoy');
            valido = false;
        } else {
            clearError(fechaInicio);
        }

        if (fin <= inicio) {
            setError(fechaFin, 'La fecha de fin debe ser posterior a la fecha de inicio');
            valido = false;
        } else {    
            clearError(fechaFin);
        }

        //Si hay algún campo no valido no envía el correo
        if (!valido) {
            event.preventDefault();
        } else {
            alert("Formulario enviado correctamente");
        }

    });
});

function setError(input, message) {

    const errorSpan = document.getElementById(input.id + 'Error');

    errorSpan.textContent = message;

    input.classList.add('invalid');
    input.classList.remove('valid');

    input.setAttribute('aria-invalid', 'true');

}

function clearError(input) {

    const errorSpan = document.getElementById(input.id + 'Error');

    errorSpan.textContent = '';

    input.classList.remove('invalid');
    input.classList.add('valid');
    input.removeAttribute('aria-invalid');

}

const nombreInput = document.getElementById('nombre');

nombreInput.addEventListener('input', function () {
    if (this.value.length >= 3) {
        clearError(this);
    } else {
        setError(this, 'El nombre debe tener al menos 3 caracteres');
    }
});

const emailInput = document.getElementById('email');    

emailInput.addEventListener('input', function () {      
    const expRegEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (expRegEmail.test(this.value)) {
        clearError(this);
    } else {
        setError(this, 'El email no es correcto');
    }

});

const fechaInicioInput = document.getElementById('diaI');

fechaInicioInput.addEventListener('input', function () {    
    const inicio = new Date(this.value);
    const hoy = new Date();
    if (inicio >= hoy) {
        clearError(this);
    }
    else {
        setError(this, 'La fecha de inicio no puede ser anterior a hoy');
    }
});

const fechaFinInput = document.getElementById('diaF');

fechaFinInput.addEventListener('input', function () {

    const inicio = new Date(fechaInicioInput.value);
    const fin = new Date(this.value);
    if (fin > inicio) {
        clearError(this);
    } else {
        setError(this, 'La fecha de fin debe ser posterior a la fecha de inicio');
    }
});
