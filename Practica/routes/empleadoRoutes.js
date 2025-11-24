"use strict";

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkEmpleado } = require('../middleware/auth');

router.use(checkEmpleado);

router.get('/dashboard', (req, res) => {
    res.render('empleado_dashboard');
});

router.get('/vehiculos', (req, res) => {
    const usuarioId = req.session.usuarioId;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }

        const sqlUsuario = "SELECT id_concesionario FROM Usuarios WHERE id_usuario = ?";
        
        connection.query(sqlUsuario, [usuarioId], (err, results) => {
            if (err) {
                connection.release();
                console.error(err);
                return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
            }

            const idConcesionario = results[0].id_concesionario;

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

router.get('/reservar/:id', (req, res) => {
    const idVehiculo = req.params.id;

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

router.post('/reservar', (req, res) => {
    const { id_vehiculo, fecha_inicio, fecha_fin } = req.body;
    const usuarioId = req.session.usuarioId;

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
         pool.query("SELECT * FROM Vehiculos WHERE id_vehiculo = ?", [id_vehiculo], (err, results) => {
            return res.render('reservar', { vehicle: results[0], error: "La fecha de fin debe ser posterior a la de inicio." });
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

            const sqlReserva = "INSERT INTO Reservas (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, 'activa')";
            
            connection.query(sqlReserva, [usuarioId, id_vehiculo, fecha_inicio, fecha_fin], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error(err);
                        res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
                    });
                }

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

// --- MIS RESERVAS ---

router.get('/reservas', (req, res) => {
    const usuarioId = req.session.usuarioId;
    
    // Obtenemos las reservas del usuario junto con los datos del vehículo asociado
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

module.exports = router;