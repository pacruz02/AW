"use strict";

const notFoundHandler = (req, res, next) => {
    res.status(404);
    res.render("error404", { url: req.url });
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render("error500", { 
        mensaje: err.message, 
        pila: err.stack 
    });
};

module.exports = { notFoundHandler, errorHandler };