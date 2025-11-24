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

// Middleware de Accesibilidad Global
app.use((req, res, next) => {
    // Valores por defecto
    if (!req.session.accessibility) {
        req.session.accessibility = { contrast: 'normal', fontSize: 'normal' };
    }
    
    // Hacemos las opciones disponibles para TODAS las plantillas EJS
    res.locals.accessibility = req.session.accessibility;
    
    // Generamos la cadena de clases para el <body>
    let bodyClasses = [];
    if (req.session.accessibility.contrast === 'high') bodyClasses.push('high-contrast');
    if (req.session.accessibility.fontSize === 'small') bodyClasses.push('font-small');
    if (req.session.accessibility.fontSize === 'large') bodyClasses.push('font-large');
    
    res.locals.bodyClass = bodyClasses.join(' ');
    
    next();
});

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