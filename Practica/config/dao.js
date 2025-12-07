// models/dao.js
"use strict";
const pool = require('../config/db');

const dao = {
    // Función genérica para obtener ID de concesionario
    getConcesionarioId: (nombre, callback) => {
        pool.query("SELECT id_concesionario FROM Concesionarios WHERE nombre = ?", [nombre], (err, res) => {
            if (err || res.length === 0) return callback(null);
            callback(res[0].id_concesionario);
        });
    },

    // Función para insertar o actualizar vehículo
    guardarVehiculo: (v, callback) => {
        dao.getConcesionarioId(v.concesionario_nombre, (cId) => {
            if (!cId) return callback(new Error(`Concesionario '${v.concesionario_nombre}' no encontrado`));

            // Usamos INSERT ... ON DUPLICATE KEY UPDATE para simplificar
            const sql = `
                INSERT INTO Vehiculos (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                marca=VALUES(marca), modelo=VALUES(modelo), estado=VALUES(estado), id_concesionario=VALUES(id_concesionario)
            `;
            const params = [
                v.matricula, v.marca, v.modelo, v.año_matriculacion, 
                v.numero_plazas, v.autonomia_km, v.color, v.imagen, 
                v.estado || 'disponible', cId
            ];

            pool.query(sql, params, (err, result) => {
                if (err) return callback(err);
                // Devolvemos qué pasó: 1 (insert), 2 (update)
                callback(null, result.affectedRows === 1 ? 'INSERTADO' : 'ACTUALIZADO');
            });
        });
    },

    // Función para procesar una lista (recursiva para manejar asincronía secuencial)
    procesarListaVehiculos: (lista, logs, callback) => {
        if (lista.length === 0) return callback();
        
        const vehiculo = lista.shift(); // Sacamos el primero
        dao.guardarVehiculo(vehiculo, (err, accion) => {
            if (err) logs.push(`Error ${vehiculo.matricula}: ${err.message}`);
            else logs.push(`Vehículo ${vehiculo.matricula}: ${accion}`);
            
            // Llamada recursiva
            dao.procesarListaVehiculos(lista, logs, callback);
        });
    }
};

module.exports = dao;