document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * Guarda las preferencias de accesibilidad del usuario en el servidor
     * @param {*} settings 
     */
    const savePreferences = (settings) => {
        fetch('/api/accessibility', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        }).catch(err => console.error('Error guardando preferencias:', err));
    };

    // Contraste normal
    document.getElementById('btn-contrast-normal').addEventListener('click', () => {
        document.body.classList.remove('high-contrast');
        savePreferences({ contrast: 'normal' });
    });

    // Contraste alto
    document.getElementById('btn-contrast-high').addEventListener('click', () => {
        document.body.classList.add('high-contrast');
        savePreferences({ contrast: 'high' });
    });

    // Tamaño de fuente pequeño
    document.getElementById('btn-font-small').addEventListener('click', () => {
        document.body.classList.remove('font-large');
        document.body.classList.add('font-small');
        savePreferences({ fontSize: 'small' });
    });

    // Tamaño de fuente normal
    document.getElementById('btn-font-normal').addEventListener('click', () => {
        document.body.classList.remove('font-large', 'font-small');
        savePreferences({ fontSize: 'normal' });
    });

    // Tamaño de fuente grande
    document.getElementById('btn-font-large').addEventListener('click', () => {
        document.body.classList.remove('font-small');
        document.body.classList.add('font-large');
        savePreferences({ fontSize: 'large' });
    });
});