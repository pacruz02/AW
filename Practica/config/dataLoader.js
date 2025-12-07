"use strict";
const fs = require('fs');
const path = require('path');
const pool = require('./db');
const dao = require('./dao');

const jsonPath = path.join(__dirname, '..', 'data', 'initial_data.json');

function cargarDatosIniciales() {
    console.log("Verificando estado de la Base de Datos...");
    
    pool.getConnection((err, connection) => {
        if (err) return console.error("Error BD:", err);

        connection.query("SELECT COUNT(*) AS total FROM Vehiculos", (err, results) => {
            connection.release();
            
            if (err) return console.error("Error consulta:", err);
            
            if (results[0].total > 0) {
                console.log(">> La BD ya contiene datos. Salto carga inicial.");
                return;
            }

            console.log(">> BD vacía. Iniciando carga desde JSON...");
            
            fs.readFile(jsonPath, 'utf8', (err, dataStr) => {
                if (err) return console.error("Error leyendo JSON:", err);
                
                try {
                    const data = JSON.parse(dataStr);
                    const logs = [];
                    
                    const concesionarios = [...data.concesionarios];
                    const vehiculos = [...data.vehiculos];

                    dao.procesarListaConcesionarios(concesionarios, logs, () => {
                        dao.procesarListaVehiculos(vehiculos, logs, () => {
                            console.log(">> Carga inicial completada.");
                            console.log(logs.join('\n'));
                        });
                    });

                } catch (parseErr) {
                    console.error("Error parseando JSON:", parseErr);
                }
            });
        });
    });
}

module.exports = { cargarDatosIniciales };