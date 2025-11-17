"use strict";

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { cargarDatosIniciales } = require('./config/dataLoader');

const mainRoutes = require('./routes/mainRoutes');
const adminRoutes = require('./routes/adminRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');

const app = express();
const PORT = 3000;

app.set("views", path.join(__dirname, "public", "views"));
app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use(session({
    secret: 'tu_clave_secreta_aqui',
    resave: false,
    saveUninitialized: false
}));

app.use('/', mainRoutes);
app.use('/admin', adminRoutes);
app.use('/empleado', empleadoRoutes);

app.use((req, res, next) => {
    res.status(404);
    res.render("error404", { url: req.url });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render("error500", { 
        mensaje: err.message, 
        pila: err.stack 
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    cargarDatosIniciales();
});