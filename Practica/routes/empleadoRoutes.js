"use strict";

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkEmpleado } = require('../middleware/auth');

router.use(checkEmpleado);

// ------ DASHBOARD
router.get('/dashboard', (req, res) => {
    const usuarioId = req.session.usuarioId;

    // Obtener las reservas del usuario
    const sql = `
        SELECT R.*, V.marca, V.modelo, V.matricula, V.imagen 
        FROM Reservas R 
        JOIN Vehiculos V ON R.id_vehiculo = V.id_vehiculo 
        WHERE R.id_usuario = ? 
        ORDER BY R.fecha_inicio DESC
    `;

    pool.query(sql, [usuarioId], (err, reservas) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }

        res.render('empleado_dashboard', { reservas: reservas });// Renderizar el dashboard con las reservas
    });
});

// ------ VEHÍCULOS

// Listado de vehículos disponibles para reserva
router.get('/vehiculos', (req, res) => {
    const usuarioId = req.session.usuarioId;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }

        // Obtener el concesionario del empleado
        const sqlUsuario = "SELECT id_concesionario FROM Usuarios WHERE id_usuario = ?";

        connection.query(sqlUsuario, [usuarioId], (err, results) => {
            if (err) {
                connection.release();
                console.error(err);
                return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
            }

            const idConcesionario = results[0].id_concesionario;

            // Obtener los vehículos disponibles en ese concesionario
            const sqlVehiculos = "SELECT * FROM Vehiculos WHERE id_concesionario = ? AND estado = 'disponible'";

            connection.query(sqlVehiculos, [idConcesionario], (err, vehiculos) => {
                connection.release();
                if (err) {
                    console.error(err);
                    return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                }

                res.render('empleado_vehiculos', { vehiculos: vehiculos });
            });
        });
    });
});

// Reservar un vehículo
router.get('/reservar/:id', (req, res) => {
    const idVehiculo = req.params.id;

    // Obtener los datos del vehículo
    pool.query("SELECT * FROM Vehiculos WHERE id_vehiculo = ?", [idVehiculo], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }

        if (results.length === 0) {
            return res.status(404).render('error404', { url: req.url });
        }

        res.render('reservar', { vehicle: results[0], error: null });
    });
});

// Procesar la reserva
router.post('/reservar', (req, res) => {
    const { id_vehiculo, fecha_inicio, fecha_fin } = req.body;
    const usuarioId = req.session.usuarioId;


    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {// Validación de fechas
        pool.query("SELECT * FROM Vehiculos WHERE id_vehiculo = ?", [id_vehiculo], (err, results) => {// Obtener los datos del vehículo
            return res.render('reservar', { vehicle: results[0], error: "La fecha de fin debe ser posterior a la de inicio." });// Renderizar el formulario con error
        });
        return;
    }

    pool.getConnection((err, connection) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
            }

            // Insertar la reserva
            const sqlReserva = "INSERT INTO Reservas (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, 'activa')";

            connection.query(sqlReserva, [usuarioId, id_vehiculo, fecha_inicio, fecha_fin], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error(err);
                        res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                    });
                }

                // Actualizar el estado del vehículo a 'reservado'
                const sqlUpdateVehiculo = "UPDATE Vehiculos SET estado = 'reservado' WHERE id_vehiculo = ?";

                connection.query(sqlUpdateVehiculo, [id_vehiculo], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error(err);
                            res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                            });
                        }
                        connection.release();
                        res.redirect('/empleado/dashboard');
                    });
                });
            });
        });
    });
});

// ------ MIS RESERVAS ---

// Listado de reservas del empleado
router.get('/reservas', (req, res) => {
    const usuarioId = req.session.usuarioId;

    // Obtener las reservas del usuario
    const sql = `
        SELECT R.*, V.marca, V.modelo, V.matricula, V.imagen 
        FROM Reservas R 
        JOIN Vehiculos V ON R.id_vehiculo = V.id_vehiculo 
        WHERE R.id_usuario = ? 
        ORDER BY R.fecha_inicio DESC
    `;

    pool.query(sql, [usuarioId], (err, reservas) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }
        res.render('empleado_reservas', { reservas: reservas });
    });
});

// Finalizar o cancelar una reserva
router.post('/reservas/finalizar', (req, res) => {
    const { id_reserva, kilometros, cancelada } = req.body;
    const nuevoEstado = cancelada ? 'cancelada' : 'finalizada';

    pool.getConnection((err, connection) => {
        if (err) return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
            }

            // Actualizar el estado de la reserva
            const sqlUpdateReserva = "UPDATE Reservas SET estado = ?, kilometros_recorridos = ? WHERE id_reserva = ?";
            
            connection.query(sqlUpdateReserva, [nuevoEstado, kilometros, id_reserva], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error(err);
                        res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                    });
                }

                // Obtener el id del vehículo asociado a la reserva
                const sqlGetVehiculo = "SELECT id_vehiculo FROM Reservas WHERE id_reserva = ?";
                
                connection.query(sqlGetVehiculo, [id_reserva], (err, results) => {
                    if (err || results.length === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).render('error500', { mensaje: "Error al buscar vehÃculo", pila: "" });
                        });
                    }

                    const idVehiculo = results[0].id_vehiculo;
                    // Actualizar el estado del vehículo a 'disponible'
                    const sqlUpdateVehiculo = "UPDATE Vehiculos SET estado = 'disponible' WHERE id_vehiculo = ?";

                    connection.query(sqlUpdateVehiculo, [idVehiculo], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error(err);
                                res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                            });
                        }

                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                                });
                            }
                            connection.release();
                            res.redirect('/empleado/reservas');
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;