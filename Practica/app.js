"use strict";

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const { cargarDatosIniciales } = require('./config/dataLoader');

// Rutas
const mainRoutes = require('./routes/mainRoutes');
const adminRoutes = require('./routes/adminRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');

// Middleware
const { loadUser, loadAccessibility } = require('./middleware/global');
const { notFoundHandler, errorHandler } = require('./middleware/errors');

const app = express();
const PORT = 3000;

// Configuración
app.set("views", path.join(__dirname, "public", "views"));
app.set("view engine", "ejs");

// Middlewares globales
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false
}));

// Middlewares creados
app.use(loadUser);
app.use(loadAccessibility);

// Rutas
app.use('/', mainRoutes);
app.use('/admin', adminRoutes);
app.use('/empleado', empleadoRoutes);

// Errores
app.use(notFoundHandler);
app.use(errorHandler);  

// Arranque
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    cargarDatosIniciales();
});