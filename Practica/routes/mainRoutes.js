"use strict";

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const crypto = require('crypto');

const iteraciones = 10000;
const keylen = 64;
const digest = 'sha512';
const UCM_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@ucm\.es$/;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.get('/registro', (req, res) => {
    pool.query("SELECT id_concesionario, nombre FROM Concesionarios", (err, concesionarios) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }
        res.render('registro', { error: null, concesionarios: concesionarios });
    });
});

router.post('/registro', (req, res) => {
    const { nombre, correo, password, telefono, concesionario } = req.body;

    if (!UCM_EMAIL_REGEX.test(correo)) {
        return pool.query("SELECT id_concesionario, nombre FROM Concesionarios", (err, concesionarios) => {
            res.render('registro', { error: "El correo debe ser del dominio @ucm.es.", concesionarios: concesionarios });
        });
    }

    if (!PASS_REGEX.test(password)) {
        return pool.query("SELECT id_concesionario, nombre FROM Concesionarios", (err, concesionarios) => {
            res.render('registro', { error: "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número", concesionarios: concesionarios });
        });
    }

    const salt = crypto.randomBytes(16).toString('hex');

    crypto.pbkdf2(password, salt, iteraciones, keylen, digest, (err, derivedKey) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }

        const hash = derivedKey.toString('hex');
        const storedPassword = `${salt}:${hash}`;

        const sql = "INSERT INTO Usuarios (nombre, correo, contraseña, telefono, id_concesionario, rol) VALUES (?, ?, ?, ?, ?, 'empleado')";
        const params = [nombre, correo, storedPassword, telefono || null, concesionario];

        pool.query(sql, params, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return pool.query("SELECT id_concesionario, nombre FROM Concesionarios", (dbErr, concesionarios) => {
                        res.render('registro', { error: "El correo electrónico ya está registrado.", concesionarios: concesionarios });
                    });
                }
                console.error(err);
                return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
            }
            res.redirect('/login');
        });
    });
});

router.post('/login', (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.render('login', { error: "Correo y contraseña son obligatorios." });
    }

    pool.query("SELECT * FROM Usuarios WHERE correo = ?", [correo], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
        }

        if (results.length === 0) {
            return res.render('login', { error: "Correo o contraseña incorrectos." });
        }

        const usuario = results[0];

        if (!usuario.contraseña) {
            return res.render('login', { error: "Error en los datos del usuario." });
        }

        const [salt, storedHash] = usuario.contraseña.split(':');

        crypto.pbkdf2(password, salt, iteraciones, keylen, digest, (err, derivedKey) => {
            if (err) {
                console.error(err);
                return res.status(500).render('error500', { mensaje: err.message, pila: err.stack });
            }

            const newHashBuffer = derivedKey;
            const storedHashBuffer = Buffer.from(storedHash, 'hex');

            const sonIguales = crypto.timingSafeEqual(newHashBuffer, storedHashBuffer);

            if (sonIguales) {
                req.session.usuarioId = usuario.id_usuario;
                req.session.usuarioRol = usuario.rol;
                req.session.usuarioNombre = usuario.nombre;

                if (usuario.preferencias_accesibilidad) {
                    try {
                        let prefs = usuario.preferencias_accesibilidad;
                        if (typeof prefs === 'string') {
                            prefs = JSON.parse(prefs);
                        }
                        req.session.accessibility = prefs;
                    } catch (parseError) {
                        console.error("Error al parsear preferencias:", parseError);
                        req.session.accessibility = { contrast: 'normal', fontSize: 'normal' };
                    }
                } else {
                    req.session.accessibility = { contrast: 'normal', fontSize: 'normal' };
                }

                if (usuario.rol === 'admin') {
                    res.redirect('/admin/dashboard');
                } else {
                    res.redirect('/empleado/dashboard');
                }
            } else {
                res.render('login', { error: "Correo o contraseña incorrectos." });
            }
        });
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).render('error500', { mensaje: "No se pudo cerrar la sesión", pila: err.stack });
        }

        res.clearCookie('connect.sid');

        res.redirect('/login');
    });
});

router.post('/accessibility', (req, res) => {
    const { contrast, fontSize } = req.body;

    if (contrast) req.session.accessibility.contrast = contrast;
    if (fontSize) req.session.accessibility.fontSize = fontSize;

    if (req.session.usuarioId) {
        const prefs = JSON.stringify(req.session.accessibility);
        const sql = "UPDATE Usuarios SET preferencias_accesibilidad = ? WHERE id_usuario = ?";

        pool.query(sql, [prefs, req.session.usuarioId], (err) => {
            if (err) console.error("Error guardando preferencias en BD:", err);
        });
    }

    res.json({ success: true });
});

router.post('/api/accessibility', (req, res) => {
    const { contrast, fontSize } = req.body;

    if (!req.session.accessibility) {
        req.session.accessibility = { contrast: 'normal', fontSize: 'normal' };
    }

    if (contrast) req.session.accessibility.contrast = contrast;
    if (fontSize) req.session.accessibility.fontSize = fontSize;

    if (req.session.usuarioId) {
        const prefs = JSON.stringify(req.session.accessibility);
        const sql = "UPDATE Usuarios SET preferencias_accesibilidad = ? WHERE id_usuario = ?";

        pool.query(sql, [prefs, req.session.usuarioId], (err) => {
            if (err) console.error("Error guardando preferencias en BD:", err);
        });
    }

    res.json({ success: true });
});

module.exports = router;