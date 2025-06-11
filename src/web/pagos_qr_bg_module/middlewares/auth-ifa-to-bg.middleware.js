const {
    autenticarConBanco,
    getToken
} = require('../services/banco-qr-client');

/**
 * Middleware para verificar el token del banco
 * - Verifica si se recibe un token Bearer válido
 * - Si no hay token, intenta autenticar con el banco
 * - Almacena el token en req para que esté disponible en los controladores
 */
const verificarTokenDelBanco = async (req, res, next) => {
    try {
        // Verificar si hay un token Bearer en el header
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Extraer el token de Authorization: Bearer xxx
            token = authHeader.substring(7);
            console.log('[MIDDLEWARE] Token Bearer recibido en la petición');
        }

        // Si no hay token en la petición o en el cliente, intentar autenticar
        if (!token && !getToken()) {
            console.log('[MIDDLEWARE] No hay token del banco, intentando autenticar...');
            const authResult = await autenticarConBanco();

            if (!authResult || authResult.result !== 'COD000') {
                console.log('[MIDDLEWARE] Falló la autenticación con el banco');
                return res.status(401).json({
                    result: 'ERROR',
                    message: 'No se pudo autenticar con el banco'
                });
            }

            // Usar el token obtenido de la autenticación
            token = authResult.token;
            console.log('[MIDDLEWARE] Autenticación exitosa con el banco');
        } else if (!token) {
            // Si no hay token en la petición pero sí en el cliente
            token = getToken();
            console.log('[MIDDLEWARE] Usando token existente del cliente');
        }

        // Almacenar el token en req para que esté disponible en los controladores
        req.bancoToken = token;

        next();
    } catch (error) {
        console.error('[MIDDLEWARE] Error al verificar token del banco:', error);
        return res.status(500).json({
            result: 'ERROR',
            message: 'Error al verificar autenticación con el banco'
        });
    }
};

module.exports = { verificarTokenDelBanco };