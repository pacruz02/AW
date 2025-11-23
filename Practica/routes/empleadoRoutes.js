"use strict";

const express = require('express');
const router = express.Router();
const { checkEmpleado } = require('../middleware/auth');

router.use(checkEmpleado);

router.get('/dashboard', (req, res) => {
    res.render('empleado_dashboard');
});

module.exports = router;