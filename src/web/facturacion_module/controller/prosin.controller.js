const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false })

const postFacturacionProsin = async (body) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic SUZBOkdlbmVzaXM6eg==`
        }
        const url = `${process.env.API_PROSIN}/api/sfl/FacturaCompraVenta`
        
        console.log({ url, body });
        const responseProsin = await axios.post(url, { ...body }, {
            httpsAgent: agent,
            headers: headers
        })
        
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