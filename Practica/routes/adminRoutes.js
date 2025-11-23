"use strict";

const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../middleware/auth');

router.use(checkAdmin);

router.get('/dashboard', (req, res) => {
    res.render('admin_dashboard');
});

module.exports = router;