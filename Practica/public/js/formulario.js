document.addEventListener('DOMContentLoaded', () => {
    initValidation('formularioReservas');
    initValidation('formularioLogin');
    initValidation('formularioRegistro');
});

function initValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return; // si no existe, salir

    // Selecciona solo campos relevantes (exclude type="submit" y botones)
    const campos = form.querySelectorAll('input:not([type="submit"]):not([type="button"]), select, textarea');

    campos.forEach(campo => {
        const evt = campo.tagName === 'SELECT' ? 'change' : 'input';
        campo.addEventListener(evt, () => validarCampo(campo, form));
    });

    form.addEventListener('submit', e => {
        let valido = true;
        campos.forEach(campo => {
            if (!validarCampo(campo, form)) valido = false;
        });
        if (!valido) e.preventDefault();
    });
}

function setError(input, message) { // Pone los errores en los html elements
    const errorSpan = input.form?.querySelector(`#${input.id}Error`);
    if (!errorSpan) return;
    errorSpan.textContent = message;
    input.classList.add('invalid');
    input.classList.remove('valid');
}

function clearError(input) { // Borra los errores de html elements
    const errorSpan = input.form?.querySelector(`#${input.id}Error`);
    if (!errorSpan) return;
    errorSpan.textContent = '';
    input.classList.remove('invalid');
    input.classList.add('valid');
}

function clearCampo(input) { // Limpia un campo específico y su error
    input.classList.remove('invalid', 'valid');
    const errorSpan = input.form?.querySelector(`#${input.id}Error`);
    if (!errorSpan) return;
    errorSpan.textContent = '';
}

function limpiarFormulario() { // Limpia el formulario y los errores
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.reset();
        const campos = form.querySelectorAll('input, select, textarea');
        campos.forEach(campo => clearCampo(campo));
    });
}

function validarCampo(campo, form) { // Valida cada campo del formulario
    switch (campo.id) {
        case 'nombre': return validarNombre(campo);
        case 'email': return validarEmail(campo);
        case 'telefono': return validarTelefono(campo);
        case 'diaI': return validarDiaInicio(campo);
        case 'diaF': return validarDiaFin(campo, form);
        case 'vehiculo': return validarVehiculo(campo);
        case 'password': return validarContrasena(campo);
        case 'passwordR': return validarContrasenaR(campo, form);
        default: return true;
    }
}

function validarNombre(nombre) {
    if (nombre.value.trim().length < 3) {
        setError(nombre, 'El nombre debe tener al menos 3 caracteres');
        return false;
    }
    clearError(nombre);
    return true;
}

function validarEmail(email) {
    const expRegEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!expRegEmail.test(email.value.trim())) {
        setError(email, 'El correo no es válido');
        return false;
    }
    clearError(email);
    return true;
}

function validarTelefono(telefono) {
    const expRegTelefono = /^[0-9]{9}$/;
    if (!expRegTelefono.test(telefono.value.trim())) {
        setError(telefono, 'Debe tener 9 dígitos');
        return false;
    }
    clearError(telefono);
    return true;
}

function validarDiaInicio(diaI) {
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

function validarDiaFin(diaF, form) {
    const diaI = form.querySelector('#diaI');
    if (!diaF.value) {
        setError(diaF, 'Selecciona una fecha de fin');
        return false;
    }
    if (!diaI || !diaI.value) {
        setError(diaF, 'Selecciona una fecha de inicio primero');
        return false;
    }
    const inicio = new Date(diaI.value);
    const fin = new Date(diaF.value);
    if (fin <= inicio) {
        setError(diaF, 'Debe ser posterior a la fecha de inicio');
        return false;
    }
    clearError(diaF);
    return true;
}

function validarVehiculo(vehiculo) {
    if (!vehiculo.value) {
        setError(vehiculo, 'Selecciona un vehículo');
        return false;
    }
    clearError(vehiculo);
    return true;
}

function validarContrasena(contrasena) {
    const expRegPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!expRegPassword.test(contrasena.value)) {
        setError(contrasena, 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un carácter especial');
        return false;
    }
    clearError(contrasena);
    return true;
}

function validarContrasenaR(contrasenaR, form) {
    const contrasena = form.querySelector('#password');
    if (contrasenaR.value !== contrasena.value) {
        setError(contrasenaR, 'Las contraseñas no coinciden');
        return false;
    }
    clearError(contrasenaR);
    return true;
}