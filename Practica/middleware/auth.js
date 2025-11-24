"use strict";

const checkEmpleado = (req, res, next) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }
    next();
};

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