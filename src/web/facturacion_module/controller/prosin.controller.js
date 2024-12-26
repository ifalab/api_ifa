const axios = require('axios');
const https = require('https');

// Crear un agente HTTPS que ignore la validación del certificado
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
})

const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Basic SUZBOkdlbmVzaXM6eg==`
}

const postFacturacionProsin = async (body) => {
    try {
        const url = `${process.env.process.env.API_PROSIN}/api/sfl/FacturaCompraVenta`
        const responseProsin = await axios.pos(url, { ...body }, { headers, httpsAgent })
        return {
            statusCode: responseProsin.status,
            data: responseProsin.data,
        };
    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la postFacturacionProsin'
        return errorMessage

    }
}

module.exports = {
    postFacturacionProsin,
};