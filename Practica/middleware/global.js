"use strict";

// Carga los usuarios 
const loadUser = (req, res, next) => {
    res.locals.user = req.session.usuarioId ? { 
        id: req.session.usuarioId, 
        rol: req.session.usuarioRol,
        name: req.session.usuarioNombre
    } : null;
    next();
};

// Carga accesibilidad y clases del body
const loadAccessibility = (req, res, next) => {
    if (!req.session.accessibility) {
        req.session.accessibility = { contrast: 'normal', fontSize: 'normal' };
    }
    
    res.locals.accessibility = req.session.accessibility;
    
    let bodyClasses = [];
    if (req.session.accessibility.contrast === 'high') bodyClasses.push('high-contrast');
    if (req.session.accessibility.fontSize === 'small') bodyClasses.push('font-small');
    if (req.session.accessibility.fontSize === 'large') bodyClasses.push('font-large');
    
    res.locals.bodyClass = bodyClasses.join(' ');
    next();
};

module.exports = { loadUser, loadAccessibility };