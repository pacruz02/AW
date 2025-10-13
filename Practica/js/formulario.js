
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

        if(nombre.value ===''){
            setError(nombre, 'El nombre es obligatorio');
            valido = false;
        }

        if(valido){
            clearError(nombre);
        }

        //Comprueba la validez del correo
        const expRegEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!expRegEmail.test(email.value)) {
            setError(email, 'El email no es correcto');
            valido = false;
        }
        
        if(valido){
            clearError(nombre);
        }

        //Comprueba la validez de la fecha
        const inicio = new Date(fechaInicio.value);
        const fin = new Date(fechaFin.value);
        const hoy = new Date();

        if (inicio < hoy) {
            setError(fechaInicio, 'La fecha de inicio no puede ser anterior a hoy');
            valido = false;
        }

        if(valido){
            clearError(inicio);
        }
        
        if (fin <= inicio) {
            setError(fechaFin, 'La fecha de fin debe ser posterior a la fecha de inicio');
            valido = false;
        }

        if(valido){
            clearError(fin);
        }

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
    input.classList.remove('valid');

    input.setAttribute('aria-invalid', 'true');
    
}

function clearError(input){

    const errorSpan = document.getElementById(input.id + 'Error');

    errorSpan.textContent = '';

    input.classList.remove('invalid');
    input.classList.add('valid');
    input.removeAttribute('aria-invalid');

}