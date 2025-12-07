"use strict";

// Maneja el error de pagina no encontrada
const notFoundHandler = (req, res, next) => {
    res.status(404);
    res.render("error404", { url: req.url });
};

// Maneja el error de fallo interno 
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render("error500", { 
        mensaje: err.message, 
        pila: err.stack 
    });
};

module.exports = { notFoundHandler, errorHandler };