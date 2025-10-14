document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('formularioReservas');
    const campos = form.querySelectorAll('input, select');

    campos.forEach(campo => {
        if (campo.tagName === 'INPUT') { //Si es input es decir el nombre o el email
            campo.addEventListener('input', () => validarCampo(campo));
        } else if (campo.tagName === 'SELECT') { //Si es select es decir el selector del coche
            campo.addEventListener('change', () => validarCampo(campo));
        }
    });

    form.addEventListener('submit', e => { //Comprueba cuando se hace el submit
        let valido = true;
        campos.forEach(campo => {
            if (!validarCampo(campo)) valido = false;
        });
        if (!valido) e.preventDefault();
    });
});

function setError(input, message) { // Pone los errores en los html elements
    const errorSpan = document.getElementById(input.id + 'Error');
    if (!errorSpan) return;
    errorSpan.textContent = message;
    input.classList.add('invalid');
    input.classList.remove('valid');
}

function clearError(input) { // Borra los errores de html elements
    const errorSpan = document.getElementById(input.id + 'Error');
    if (!errorSpan) return;
    errorSpan.textContent = '';
    input.classList.remove('invalid');
    input.classList.add('valid');
}

function validarCampo(campo) { // Valida cada campo del formulario
    switch (campo.id) {
        case 'nombre': return validarNombre();
        case 'email': return validarEmail();
        case 'telefono': return validarTelefono();
        case 'diaI': return validarDiaInicio();
        case 'diaF': return validarDiaFin();
        case 'vehiculo': return validarVehiculo();
        default: return true;
    }
}

function validarNombre() {
    const nombre = document.getElementById('nombre');
    const valor = nombre.value.trim();
    if (valor.length < 3) {
        setError(nombre, 'El nombre debe tener al menos 3 caracteres');
        return false;
    }
    clearError(nombre);
    return true;
}

function validarEmail() {
    const email = document.getElementById('email');
    const expRegEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!expRegEmail.test(email.value.trim())) {
        setError(email, 'El correo no es válido');
        return false;
    }
    clearError(email);
    return true;
}

function validarTelefono() {
    const telefono = document.getElementById('telefono');
    const expRegTelefono = /^[0-9]{9}$/;
    if (!expRegTelefono.test(telefono.value.trim())) {
        setError(telefono, 'Debe tener 9 dígitos');
        return false;
    }
    clearError(telefono);
    return true;
}

function validarDiaInicio() {
    const diaI = document.getElementById('diaI');
    if (!diaI.value) {
        setError(diaI, 'Selecciona una fecha de inicio');
        return false;
    }
    const inicio = new Date(diaI.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    inicio.setHours(0, 0, 0, 0);
    if (inicio < hoy) {
        setError(diaI, 'La fecha no puede ser anterior a hoy');
        return false;
    }
    clearError(diaI);
    return true;
}

function validarDiaFin() {
    const diaI = new Date(document.getElementById('diaI').value);
    const diaF = document.getElementById('diaF');
    if (!diaF.value) {
        setError(diaF, 'Selecciona una fecha de fin');
        return false;
    }
    const fin = new Date(diaF.value);
    if (fin <= diaI) {
        setError(diaF, 'Debe ser posterior a la fecha de inicio');
        return false;
    }
    clearError(diaF);
    return true;
}

function validarVehiculo() {
    const vehiculo = document.getElementById('vehiculo');
    if (!vehiculo.value) {
        setError(vehiculo, 'Selecciona un vehículo');
        return false;
    }
    clearError(vehiculo);
    return true;
}
