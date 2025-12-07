"use strict";

// Comprueba que quien este intentando acceder este en la BD es decir que sea o empleado o admin
const checkEmpleado = (req, res, next) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }
    next();
};

// Comprueba que quien este intentando acceder es un admin
const checkAdmin = (req, res, next) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }
    if (req.session.usuarioRol !== 'admin') {
        return res.status(403).render('error403');
    }
    next();
};

module.exports = { checkEmpleado, checkAdmin };