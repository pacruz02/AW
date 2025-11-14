"use strict";

const fs = require('fs');
const path = require('path');
const pool = require('./db');

const jsonPath = path.join(__dirname, '..', 'data', 'initial_data.json');


const concesionariosMap = new Map();

function insertarVehiculos(connection, data, index) {
    if (index >= data.vehiculos.length) {
        console.log("Todos los vehículos insertados.");
        console.log("¡Carga de datos iniciales completada con éxito!");
        connection.release();
        console.log("Conexión a la BD liberada.");
        return;
    }

    const v = data.vehiculos[index];
    const concesionarioId = concesionariosMap.get(v.concesionario_nombre);

    if (!concesionarioId) {
        console.warn(`No se encontró el concesionario: ${v.concesionario_nombre}. Saltando vehículo ${v.matricula}.`);
        insertarVehiculos(connection, data, index + 1);
        return;
    }

    const sql = "INSERT INTO Vehiculos (matricula, marca, modelo, año_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const params = [
        v.matricula, v.marca, v.modelo, v.año_matriculacion,
        v.numero_plazas, v.autonomia_km, v.color, v.imagen,
        v.estado, concesionarioId
    ];

    connection.query(sql, params, function(err, result) {
        if (err) {
            console.error(`Error al insertar vehículo ${v.matricula}:`, err.message);
            connection.release();
            return;
        }
        insertarVehiculos(connection, data, index + 1);
    });
}

function insertarConcesionarios(connection, data, index) {
    if (index >= data.concesionarios.length) {
        console.log("Todos los concesionarios insertados.");
        insertarVehiculos(connection, data, 0);
        return;
    }

    const conce = data.concesionarios[index];
    const sql = "INSERT INTO Concesionarios (nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?)";
    
    connection.query(sql, [conce.nombre, conce.ciudad, conce.direccion, conce.telefono_contacto], function(err, result) {
        if (err) {
            console.error(`Error al insertar concesionario ${conce.nombre}:`, err.message);
            connection.release();
            return;
        }
        
        concesionariosMap.set(conce.nombre, result.insertId);
        
        insertarConcesionarios(connection, data, index + 1);
    });
}

function cargarDatosIniciales() {
    console.log("Iniciando la carga de datos iniciales...");

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Error al obtener la conexión:", err.message);
            return;
        }
        console.log("Conexión a la BD obtenida.");

        connection.query("SELECT COUNT(*) AS total FROM Vehiculos", function(err, results) {
            if (err) {
                console.error("Error al verificar vehículos:", err.message);
                connection.release();
                return;
            }

            if (results[0].total > 0) {
                console.log("La base de datos ya contiene datos. No se requiere carga inicial.");
                connection.release();
                return;
            }

            console.log("Base de datos vacía. Iniciando carga desde JSON.");
            let data;
            try {
                const jsonData = fs.readFileSync(jsonPath, 'utf-8');
                data = JSON.parse(jsonData);
            } catch (readErr) {
                console.error("Error al leer o parsear el JSON:", readErr.message);
                connection.release();
                return;
            }

            insertarConcesionarios(connection, data, 0);
        });
    });
}

module.exports = { cargarDatosIniciales };