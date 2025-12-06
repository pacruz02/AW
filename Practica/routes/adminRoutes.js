"use strict";

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkAdmin } = require('../middleware/auth');

router.use(checkAdmin);

// --- Dashboard ---
router.get('/dashboard', (req, res) => {
    res.render('admin_dashboard');
});

// --- GESTIÓN DE VEHÍCULOS ---

// 1. Listar Vehículos
router.get('/vehiculos', (req, res) => {
    pool.query("SELECT * FROM Vehiculos", (err, vehiculos) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }
        res.render('admin_vehiculos', { vehiculos: vehiculos });
    });
});

// 2. Formulario Nuevo Vehículo
router.get('/vehiculos/nuevo', (req, res) => {
    // Necesitamos la lista de concesionarios para el desplegable
    pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

        res.render('admin_vehiculo_form', {
            vehiculo: null, // null indica que es una creación
            concesionarios: concesionarios
        });
    });
});

// 3. Procesar Nuevo Vehículo (POST)
router.post('/vehiculos/nuevo', (req, res) => {
    const { matricula, marca, modelo, anio, plazas, autonomia, color, imagen, precio, concesionario } = req.body;

    const sql = "INSERT INTO Vehiculos (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'disponible', ?)";
    const params = [matricula, marca, modelo, anio, plazas, autonomia, color, imagen, concesionario];

    pool.query(sql, params, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: "Error al crear vehículo (¿Matrícula duplicada?)", pila: err.stack });
        }
        res.redirect('/admin/vehiculos');
    });
});

// 4. Formulario Editar Vehículo
router.get('/vehiculos/editar/:id', (req, res) => {
    const id = req.params.id;

    pool.query("SELECT * FROM Vehiculos WHERE id_vehiculo = ?", [id], (err, rows) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        if (rows.length === 0) return res.status(404).render('error404', { url: req.url });

        const vehiculo = rows[0];

        pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {
            if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

            res.render('admin_vehiculo_form', {
                vehiculo: vehiculo, // Pasamos el vehículo existente
                concesionarios: concesionarios
            });
        });
    });
});

// 5. Procesar Edición Vehículo (POST)
router.post('/vehiculos/editar/:id', (req, res) => {
    const id = req.params.id;
    const { matricula, marca, modelo, anio, plazas, autonomia, color, imagen, estado, concesionario } = req.body;

    const sql = "UPDATE Vehiculos SET matricula=?, marca=?, modelo=?, año_matriculacion=?, numero_plazas=?, autonomia_km=?, color=?, imagen=?, estado=?, id_concesionario=? WHERE id_vehiculo=?";
    const params = [matricula, marca, modelo, anio, plazas, autonomia, color, imagen, estado, concesionario, id];

    pool.query(sql, params, (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/vehiculos');
    });
});

// 6. Borrar Vehículo
router.post('/vehiculos/borrar/:id', (req, res) => {
    const id = req.params.id;
    pool.query("DELETE FROM Vehiculos WHERE id_vehiculo = ?", [id], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: "No se puede borrar el vehículo (probablemente tiene reservas asociadas).", pila: err.stack });
        res.redirect('/admin/vehiculos');
    });
});

// --- GESTIÓN DE CONCESIONARIOS ---

// 1. Listar Concesionarios
router.get('/concesionarios', (req, res) => {
    pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.render('admin_concesionarios', { concesionarios: concesionarios });
    });
});

// 2. Formulario Nuevo Concesionario
router.get('/concesionarios/nuevo', (req, res) => {
    res.render('admin_concesionario_form', { concesionario: null });
});

// 3. Procesar Nuevo Concesionario (POST)
router.post('/concesionarios/nuevo', (req, res) => {
    const { nombre, ciudad, direccion, telefono } = req.body;
    const sql = "INSERT INTO Concesionarios (nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?)";

    pool.query(sql, [nombre, ciudad, direccion, telefono], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/concesionarios');
    });
});

// 4. Formulario Editar Concesionario
router.get('/concesionarios/editar/:id', (req, res) => {
    const id = req.params.id;
    pool.query("SELECT * FROM Concesionarios WHERE id_concesionario = ?", [id], (err, rows) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        if (rows.length === 0) return res.status(404).render('error404', { url: req.url });

        res.render('admin_concesionario_form', { concesionario: rows[0] });
    });
});

// 5. Procesar Edición Concesionario (POST)
router.post('/concesionarios/editar/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, ciudad, direccion, telefono } = req.body;
    const sql = "UPDATE Concesionarios SET nombre=?, ciudad=?, direccion=?, telefono_contacto=? WHERE id_concesionario=?";

    pool.query(sql, [nombre, ciudad, direccion, telefono, id], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/concesionarios');
    });
});

// 6. Borrar Concesionario
router.post('/concesionarios/borrar/:id', (req, res) => {
    const id = req.params.id;
    // Nota: Esto podría fallar si hay vehículos o usuarios asignados (por las claves foráneas)
    pool.query("DELETE FROM Concesionarios WHERE id_concesionario = ?", [id], (err, result) => {
        if (err) {
            console.error(err);
            // Enviamos un mensaje amigable si falla por restricciones de FK
            return res.status(500).render('error500', {
                mensaje: "No se puede borrar el concesionario. Asegúrate de que no tenga vehículos ni empleados asignados.",
                pila: err.stack
            });
        }
        res.redirect('/admin/concesionarios');
    });
});

// --- ESTADÍSTICAS ---

router.get('/estadisticas', (req, res) => {

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

// --- GESTIÓN DE USUARIOS ---

router.get('/usuarios', (req, res) => {
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

    pool.query("SELECT * FROM Usuarios WHERE id_usuario = ?", [id], (err, rows) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        if (rows.length === 0) return res.status(404).render('error404', { url: req.url });

        const usuario = rows[0];

        pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {
            if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

            res.render('admin_usuario_form', {
                usuario: usuario,
                concesionarios: concesionarios
            });
        });
    });
});

router.post('/usuarios/editar/:id', (req, res) => {
    const id = req.params.id;
    const { rol, concesionario } = req.body;

    const sql = "UPDATE Usuarios SET rol = ?, id_concesionario = ? WHERE id_usuario = ?";

    pool.query(sql, [rol, concesionario, id], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/usuarios');
    });
});

router.post('/usuarios/borrar/:id', (req, res) => {
    const id = req.params.id;

    if (id == req.session.usuarioId) {
        return res.status(400).send("No puedes borrar tu propio usuario mientras estás logueado.");
    }

    pool.query("DELETE FROM Usuarios WHERE id_usuario = ?", [id], (err, result) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        res.redirect('/admin/usuarios');
    });
});

router.get('/carga-datos', (req, res) => {
    res.render('admin_carga', { error: null });
});

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

    // Obtenemos todas las matrículas existentes para comparar
    pool.query("SELECT matricula FROM Vehiculos", (err, rows) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

        const matriculasExistentes = new Set(rows.map(r => r.matricula));

        const nuevos = [];
        const existentes = [];

        // Clasificamos los vehículos del JSON
        jsonData.vehiculos.forEach(v => {
            if (matriculasExistentes.has(v.matricula)) {
                existentes.push(v);
            } else {
                nuevos.push(v);
            }
        });

        // Necesitamos la lista de concesionarios para poder mapear los nombres a IDs en el siguiente paso
        pool.query("SELECT * FROM Concesionarios", (err, concesionarios) => {
            if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

            res.render('admin_carga_confirm', {
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

router.post('/carga-datos/confirm', (req, res) => {
    const nuevos = JSON.parse(req.body.jsonNuevos || '[]');
    const aActualizarMatriculas = req.body.actualizar_matriculas || [];
    const existentesTotal = JSON.parse(req.body.jsonExistentes || '[]');

    const concesionariosNuevos = JSON.parse(req.body.jsonConcesionarios || '[]');
    const matriculasSet = new Set(Array.isArray(aActualizarMatriculas) ? aActualizarMatriculas : [aActualizarMatriculas]);
    const aActualizar = existentesTotal.filter(v => matriculasSet.has(v.matricula));

    const logs = [];

    const procesarConcesionarios = (lista, index, callback) => {
        if (index >= lista.length) return callback();

        const c = lista[index];
        pool.query("SELECT id_concesionario FROM Concesionarios WHERE nombre = ?", [c.nombre], (err, rows) => {
            if (rows && rows.length > 0) {
                procesarConcesionarios(lista, index + 1, callback);
            } else {
                const sql = "INSERT INTO Concesionarios (nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?)";
                pool.query(sql, [c.nombre, c.ciudad, c.direccion, c.telefono_contacto], (err) => {
                    if (!err) logs.push(`Sede creada: ${c.nombre}`);
                    else logs.push(`Error sede ${c.nombre}: ${err.message}`);
                    procesarConcesionarios(lista, index + 1, callback);
                });
            }
        });
    };

    const getConcesionarioId = (nombre, cb) => {
        pool.query("SELECT id_concesionario FROM Concesionarios WHERE nombre = ?", [nombre], (err, res) => {
            if (err || res.length === 0) return cb(null);
            cb(res[0].id_concesionario);
        });
    };

    const procesarNuevos = (lista, index, callback) => {
        if (index >= lista.length) return callback();

        const v = lista[index];
        getConcesionarioId(v.concesionario_nombre, (cId) => {
            if (!cId) {
                logs.push(`Error al insertar ${v.matricula}: Concesionario '${v.concesionario_nombre}' no existe.`);
                return procesarNuevos(lista, index + 1, callback);
            }

            const sql = "INSERT INTO Vehiculos (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const params = [v.matricula, v.marca, v.modelo, v.año_matriculacion, v.numero_plazas, v.autonomia_km, v.color, v.imagen, v.estado || 'disponible', cId];

            pool.query(sql, params, (err) => {
                if (err) logs.push(`Error insertando ${v.matricula}: ${err.message}`);
                else logs.push(`Vehículo NUEVO insertado: ${v.matricula} (${v.marca} ${v.modelo})`);
                procesarNuevos(lista, index + 1, callback);
            });
        });
    };

    const procesarActualizaciones = (lista, index, callback) => {
        if (index >= lista.length) return callback();

        const v = lista[index];
        getConcesionarioId(v.concesionario_nombre, (cId) => {
            if (!cId) {
                logs.push(`⚠️ No se actualizó ${v.matricula}: Concesionario nuevo no encontrado.`);
                return procesarActualizaciones(lista, index + 1, callback);
            }

            const sql = "UPDATE Vehiculos SET marca=?, modelo=?, año_matriculacion=?, numero_plazas=?, autonomia_km=?, color=?, imagen=?, estado=?, id_concesionario=? WHERE matricula=?";
            const params = [v.marca, v.modelo, v.año_matriculacion, v.numero_plazas, v.autonomia_km, v.color, v.imagen, v.estado || 'disponible', cId, v.matricula];

            pool.query(sql, params, (err) => {
                if (err) logs.push(`Error actualizando ${v.matricula}: ${err.message}`);
                else logs.push(`Vehículo ACTUALIZADO: ${v.matricula}`);
                procesarActualizaciones(lista, index + 1, callback);
            });
        });
    };

    procesarConcesionarios(concesionariosNuevos, 0, () => {
        procesarNuevos(nuevos, 0, () => {
            procesarActualizaciones(aActualizar, 0, () => {
                res.render('admin_carga_result', { logs: logs });
            });
        });
    });
});

module.exports = router;