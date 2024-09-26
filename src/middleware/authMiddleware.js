// authMiddleware.js
const checkToken = (req, res, next) => {
    const token = req.headers['authorization'];
    let validTokens = [];

    try {
        validTokens = JSON.parse(process.env.TOKENS).tokens;
    } catch (error) {
        console.error('Error parsing TOKENMOVIL:', error);
        return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('Authorization header:', token); // Para depuración
    console.log('Valid tokens:', validTokens); // Para depuración

    // Verifica si el token está presente y es válido
    if (!token || !validTokens.includes(token)) {
        return res.status(401).json({ message: 'No token provided or invalid token' });
    }

    // Continúa con la solicitud si el token es válido
    next();
};

module.exports = checkToken;
