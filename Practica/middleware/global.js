"use strict";

// Inyectar usuario en todas las vistas
const loadUser = (req, res, next) => {
    res.locals.user = req.session.usuarioId ? { 
        id: req.session.usuarioId, 
        rol: req.session.usuarioRol 
    } : null;
    next();
};

// Inyectar accesibilidad y clases del body
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