"use strict";

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const dao = require('../config/dao');
const { checkAdmin } = require('../middleware/auth');

router.use(checkAdmin);

// ------ Dashboard
router.get('/dashboard', (req, res) => {
    res.render('admin_dashboard');
});

// ------ GESTIÓN DE VEHÍCULOS

// Listar Vehículos
router.get('/vehiculos', (req, res) => {
    pool.query("SELECT * FROM Vehiculos", (err, vehiculos) => {// Obtener todos los vehículos
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }
        res.render('admin_vehiculos', { vehiculos: vehiculos });// Renderizar la vista con los vehículos
    });
});

// Formulario Nuevo Vehículo
router.get('/vehiculos/nuevo', (req, res) => {
    pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {// Obteniene todos los concesionarios
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

        res.render('admin_vehiculo_form', { // Renderiza el formulario
            vehiculo: null,
            concesionarios: concesionarios
        });
    });
});

// Procesar Nuevo Vehículo
router.post('/vehiculos/nuevo', (req, res) => {
    const { matricula, marca, modelo, anio, plazas, autonomia, color, imagen, precio, concesionario } = req.body;

    // Insertar el nuevo vehículo en la base de datos
    const sql = `INSERT INTO Vehiculos (matricula, marca, modelo,
     año_matriculacion, numero_plazas, autonomia_km, color, imagen, 
     estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'disponible', ?)`;

    const params = [matricula, marca, modelo, anio, plazas, autonomia, color, imagen, concesionario];

    pool.query(sql, params, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: "Error al crear vehículo (¿Matrícula duplicada?)", pila: err.stack });
        }
        res.redirect('/admin/vehiculos');
    });
});

// Formulario Editar Vehículo
router.get('/vehiculos/editar/:id', (req, res) => {
    const id = req.params.id;

    pool.query("SELECT * FROM Vehiculos WHERE id_vehiculo = ?", [id], (err, rows) => {// Obteniene el vehículo por ID
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        if (rows.length === 0) return res.status(404).render('error404', { url: req.url });

        const vehiculo = rows[0];

        pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => { // Obteniene todos los concesionarios
            if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

            res.render('admin_vehiculo_form', { // Renderiza el formulario con datos del vehículo
                vehiculo: vehiculo,
                concesionarios: concesionarios
            });
        });
    });
});

// Procesar Edición Vehículo (POST)
router.post('/vehiculos/editar/:id', (req, res) => {
    const id = req.params.id;
    const { matricula, marca, modelo, anio, plazas, autonomia, color, imagen, estado, concesionario } = req.body;

    // Actualizar el vehículo en la base de datos
    const sql = `UPDATE Vehiculos SET matricula=?, marca=?, modelo=?, 
    año_matriculacion=?, numero_plazas=?, autonomia_km=?, color=?, 
    imagen=?, estado=?, id_concesionario=? WHERE id_vehiculo=?`;

    const params = [matricula, marca, modelo, anio, plazas, autonomia, color, imagen, estado, concesionario, id];

    pool.query(sql, params, (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/vehiculos');
    });
});

// Borrar Vehículo
router.post('/vehiculos/borrar/:id', (req, res) => {
    const id = req.params.id;
    pool.query("DELETE FROM Vehiculos WHERE id_vehiculo = ?", [id], (err, result) => { // Borrar el vehículo por ID
        if (err) return res.status(500).render('error500', { mensaje: "No se puede borrar el vehículo (probablemente tiene reservas asociadas).", pila: err.stack });
        res.redirect('/admin/vehiculos');
    });
});

// ------ GESTIÓN DE CONCESIONARIOS

// Listar Concesionarios
router.get('/concesionarios', (req, res) => {
    pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {// Obtener todos los concesionarios
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.render('admin_concesionarios', { concesionarios: concesionarios });
    });
});

// Formulario Nuevo Concesionario
router.get('/concesionarios/nuevo', (req, res) => {
    res.render('admin_concesionario_form', { concesionario: null }); // Renderiza el formulario vacío
});

// Procesar Nuevo Concesionario
router.post('/concesionarios/nuevo', (req, res) => {
    const { nombre, ciudad, direccion, telefono } = req.body;
    // Insertar el nuevo concesionario en la base de datos
    const sql = `INSERT INTO Concesionarios (nombre, ciudad, direccion, 
     telefono_contacto) VALUES (?, ?, ?, ?)`;

    pool.query(sql, [nombre, ciudad, direccion, telefono], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/concesionarios');
    });
});

// Formulario Editar Concesionario
router.get('/concesionarios/editar/:id', (req, res) => {
    const id = req.params.id;
    pool.query("SELECT * FROM Concesionarios WHERE id_concesionario = ?", [id], (err, rows) => {// Obteniene el concesionario por ID
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        if (rows.length === 0) return res.status(404).render('error404', { url: req.url });

        res.render('admin_concesionario_form', { concesionario: rows[0] });
    });
});

// Procesar Edición Concesionario
router.post('/concesionarios/editar/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, ciudad, direccion, telefono } = req.body;
    // Actualizar el concesionario en la base de datos
    const sql = "UPDATE Concesionarios SET nombre=?, ciudad=?, direccion=?, telefono_contacto=? WHERE id_concesionario=?";

    pool.query(sql, [nombre, ciudad, direccion, telefono, id], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/concesionarios');
    });
});

// Borrar Concesionario
router.post('/concesionarios/borrar/:id', (req, res) => {
    const id = req.params.id;
    pool.query("DELETE FROM Concesionarios WHERE id_concesionario = ?", [id], (err, result) => { // Borrar el concesionario por ID
        if (err) {
            console.error(err);
            return res.status(500).render('error500', {
                mensaje: "No se puede borrar el concesionario. Asegúrate de que no tenga vehículos ni empleados asignados.",
                pila: err.stack
            });
        }
        res.redirect('/admin/concesionarios');
    });
});

// ------ ESTADÍSTICAS

router.get('/estadisticas', (req, res) => {

    // Consulta para obtener totales generales
    const sqlTotales = `
        SELECT 
            (SELECT COUNT(*) FROM Usuarios) as usuarios,
            (SELECT COUNT(*) FROM Vehiculos) as vehiculos,
            (SELECT COUNT(*) FROM Reservas) as reservas,
            (SELECT COUNT(*) FROM Concesionarios) as concesionarios
    `;

    pool.query(sqlTotales, (err, totalesResult) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

        const totales = totalesResult[0];

        // Consulta para obtener reservas por concesionario
        const sqlPorConcesionario = `
            SELECT C.nombre, COUNT(R.id_reserva) as num_reservas 
            FROM Concesionarios C 
            LEFT JOIN Vehiculos V ON C.id_concesionario = V.id_concesionario 
            LEFT JOIN Reservas R ON V.id_vehiculo = R.id_vehiculo 
            GROUP BY C.id_concesionario, C.nombre
            ORDER BY num_reservas DESC
        `;

        pool.query(sqlPorConcesionario, (err, porConcesionario) => {
            if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

            // Consulta para obtener el vehículo más reservado
            const sqlTopVehiculo = `
                SELECT V.marca, V.modelo, V.matricula, COUNT(R.id_reserva) as total
                FROM Reservas R
                JOIN Vehiculos V ON R.id_vehiculo = V.id_vehiculo
                GROUP BY V.id_vehiculo
                ORDER BY total DESC
                LIMIT 1
            `;

            pool.query(sqlTopVehiculo, (err, topVehiculo) => {
                if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

                res.render('admin_estadisticas', {
                    totales: totales,
                    porConcesionario: porConcesionario,
                    topVehiculo: topVehiculo[0] || null
                });
            });
        });
    });
});

// ------ GESTIÓN DE USUARIOS

router.get('/usuarios', (req, res) => {
    // Obtener todos los usuarios junto con el nombre del concesionario asociado
    const sql = `
        SELECT U.*, C.nombre as nombre_concesionario 
        FROM Usuarios U
        LEFT JOIN Concesionarios C ON U.id_concesionario = C.id_concesionario
        ORDER BY U.nombre ASC
    `;

    pool.query(sql, (err, usuarios) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.render('admin_usuarios', { usuarios: usuarios });
    });
});

router.get('/usuarios/editar/:id', (req, res) => {
    const id = req.params.id;

    pool.query("SELECT * FROM Usuarios WHERE id_usuario = ?", [id], (err, rows) => {// Obteniene el usuario por ID
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        if (rows.length === 0) return res.status(404).render('error404', { url: req.url });

        const usuario = rows[0];

        pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {// Obteniene todos los concesionarios
            if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

            res.render('admin_usuario_form', {
                usuario: usuario,
                concesionarios: concesionarios
            });
        });
    });
});

// Procesar Edición Usuario
router.post('/usuarios/editar/:id', (req, res) => {
    const id = req.params.id;
    const { rol, concesionario } = req.body;

    // Actualizar el usuario en la base de datos
    const sql = "UPDATE Usuarios SET rol = ?, id_concesionario = ? WHERE id_usuario = ?";

    pool.query(sql, [rol, concesionario, id], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/usuarios');
    });
});

// procesar Borrar Usuario
router.post('/usuarios/borrar/:id', (req, res) => {
    const id = req.params.id;

    
    if (id == req.session.usuarioId) { // Evitar que un admin se borre a sí mismo
        return res.status(400).send("No puedes borrar tu propio usuario mientras estás logueado.");
    }

   
    pool.query("DELETE FROM Usuarios WHERE id_usuario = ?", [id], (err, result) => { // Borrar el usuario por ID
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/usuarios');
    });
});

// ------ CARGA DE DATOS

// Formulario de carga de datos
router.get('/carga-datos', (req, res) => {
    res.render('admin_carga', { error: null });
});

// Previsualización de datos cargados
router.post('/carga-datos/preview', (req, res) => {
    let jsonData;
    try {
        jsonData = JSON.parse(req.body.json_text);
    } catch (e) {
        return res.render('admin_carga', { error: "El formato JSON no es válido. Revisa la sintaxis." });
    }

    if (!jsonData.vehiculos || !Array.isArray(jsonData.vehiculos)) {
        return res.render('admin_carga', { error: "El JSON debe contener un array llamado 'vehiculos'." });
    }

    pool.query("SELECT matricula FROM Vehiculos", (err, rows) => { // Obtener todas las matrículas existentes
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

        const matriculasExistentes = new Set(rows.map(r => r.matricula));

        const nuevos = [];
        const existentes = [];

        jsonData.vehiculos.forEach(v => {
            if (matriculasExistentes.has(v.matricula)) {
                existentes.push(v);
            } else {
                nuevos.push(v);
            }
        });

        pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => { // Obtener todos los concesionarios
            if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

            res.render('admin_carga_confirm', { // Renderizar la vista de confirmación
                nuevos: nuevos,
                existentes: existentes,
                concesionarios: concesionarios,
                jsonNuevos: JSON.stringify(nuevos),
                jsonExistentes: JSON.stringify(existentes),
                jsonConcesionarios: JSON.stringify(jsonData.concesionarios || [])
            });
        });
    });
});

// Confirmar datos cargados
router.post('/carga-datos/confirm', (req, res) => {
    const nuevos = JSON.parse(req.body.jsonNuevos || '[]');
    const existentesTotal = JSON.parse(req.body.jsonExistentes || '[]');
    const matriculas = new Set([].concat(req.body.actualizar_matriculas || []));// Matrículas a actualizar

    const actualizar = existentesTotal.filter(v => matriculas.has(v.matricula));

    const todosLosVehiculos = [...nuevos, ...actualizar];
    const logs = [];

    dao.procesarListaVehiculos(todosLosVehiculos, logs, () => {
        res.render('admin_carga_result', { logs: logs });
    });
});

module.exports = router;