"use strict";
const pool = require('../config/db');

const dao = {
    // ------ CONCESIONARIOS

    /**
     * Obtiene el id del concesionario por su nombre
     * @param {*} nombre 
     * @param {*} callback 
     */
    getConcesionarioId: (nombre, callback) => {
        pool.query("SELECT id_concesionario FROM Concesionarios WHERE nombre = ?", [nombre], (err, res) => {
            if (err) return callback(err);
            if (res.length === 0) return callback(null, null);
            callback(null, res[0].id_concesionario);
        });
    },

    /**
     * Crea un nuevo concesionario si no existe con los datos proporcionados
     * @param {*} datos 
     * @param {*} callback 
     */
    crearConcesionario: (datos, callback) => {
        dao.getConcesionarioId(datos.nombre, (err, id) => { // Verificar si ya existe
            if (err) return callback(err);
            if (id) return callback(null, id);

            const sql = "INSERT INTO Concesionarios (nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?)";
            pool.query(sql, [datos.nombre, datos.ciudad, datos.direccion, datos.telefono_contacto], (err, result) => {
                if (err) return callback(err);
                callback(null, result.insertId);
            });
        });
    },

    /**
     * Crea concesionarios de forma recursiva
     * @param {*} lista 
     * @param {*} logs 
     * @param {*} callback 
     * @returns 
     */
    procesarListaConcesionarios: (lista, logs, callback) => {
        if (lista.length === 0) return callback();

        const conce = lista.shift();
        dao.crearConcesionario(conce, (err, id) => {
            if (err) logs.push(`Error sede ${conce.nombre}: ${err.message}`);
            dao.procesarListaConcesionarios(lista, logs, callback);
        });
    },

    // ------ VEHÍCULOS

    /**
     * Guarda o actualiza un vehículo 
     * @param {*} v 
     * @param {*} callback 
     */
    guardarVehiculo: (v, callback) => {
        dao.getConcesionarioId(v.concesionario_nombre, (err, vId) => {// Obtener id del concesionario
            if (err) return callback(err);
            if (!vId) return callback(new Error(`Concesionario '${v.concesionario_nombre}' no encontrado`));

            /**
             * Intenta insertar un nuevo registro con todos los detalles.
             * Si la matrícula ya existe, actualiza únicamente la marca, modelo,
             * estado y concesionario,
             */
            const sql = `
                INSERT INTO Vehiculos (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                marca=VALUES(marca), modelo=VALUES(modelo), estado=VALUES(estado), id_concesionario=VALUES(id_concesionario)
            `;

            const params = [
                v.matricula, v.marca, v.modelo, v.año_matriculacion,
                v.numero_plazas, v.autonomia_km, v.color, v.imagen,
                v.estado || 'disponible', vId
            ];

            pool.query(sql, params, (err, result) => {
                if (err) return callback(err);
                callback(null, result.affectedRows === 1 ? 'INSERTADO' : 'ACTUALIZADO');
            });
        });
    },

    /**
     * Guarda o actualiza vehículos de forma recursiva
     * @param {*} lista 
     * @param {*} logs 
     * @param {*} callback 
     * @returns 
     */
    procesarListaVehiculos: (lista, logs, callback) => {
        if (lista.length === 0) return callback();

        const vehiculo = lista.shift();
        dao.guardarVehiculo(vehiculo, (err, accion) => {
            if (err) logs.push(`Error ${vehiculo.matricula}: ${err.message}`);
            else logs.push(`Vehículo ${vehiculo.matricula}: ${accion}`);

            dao.procesarListaVehiculos(lista, logs, callback);
        });
    }
};

module.exports = dao;