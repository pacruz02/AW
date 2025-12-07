document.addEventListener('DOMContentLoaded', () => {
    
    const savePreferences = (settings) => {
        fetch('/api/accessibility', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        }).catch(err => console.error('Error guardando preferencias:', err));
    };

    document.getElementById('btn-contrast-normal').addEventListener('click', () => {
        document.body.classList.remove('high-contrast');
        savePreferences({ contrast: 'normal' });
    });

    document.getElementById('btn-contrast-high').addEventListener('click', () => {
        document.body.classList.add('high-contrast');
        savePreferences({ contrast: 'high' });
    });

    document.getElementById('btn-font-small').addEventListener('click', () => {
        document.body.classList.remove('font-large');
        document.body.classList.add('font-small');
        savePreferences({ fontSize: 'small' });
    });

    document.getElementById('btn-font-normal').addEventListener('click', () => {
        document.body.classList.remove('font-large', 'font-small');
        savePreferences({ fontSize: 'normal' });
    });

    document.getElementById('btn-font-large').addEventListener('click', () => {
        document.body.classList.remove('font-small');
        document.body.classList.add('font-large');
        savePreferences({ fontSize: 'large' });
    });
});