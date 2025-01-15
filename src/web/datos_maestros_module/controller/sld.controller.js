const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false })

let session = null

const connectSLD = async () => {
    try {
        const url = 'https://172.16.11.25:50000/b1s/v1/Login';
        const data = {
            CompanyDB: process.env.DBSAPPRD,
            UserName: process.env.USERSAP,
            Password: process.env.PASSSAP
        }
        const response = await axios.post(url, data, { httpsAgent: agent });
        session = response.data;

        return response.data;
    } catch (error) {
        console.error('Error de logueo al SLD', error.message);
        throw new Error('Error de logueo al SLD');
    }
}

const validateSession = async () => {
    if (!session || !session.SessionId) {
        return await connectSLD();
    }
    return session;
};

const patchBusinessPartners = async (cardCode, body) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        console.error({ cardCode, body })
        const url = `https://srvhana:50000/b1s/v1/BusinessPartners('${cardCode}')`
        const sapResponse = await axios.patch(url, { ...body }, {
            httpsAgent: agent,
            headers: headers
        });

        return {
            message: 'Patch Business Partners grabada con éxito',
            status: sapResponse.status || 200,
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Patch Business Partners';
        console.error('Error en la solicitud Patch Business Partners:', error.response?.data || error.message);
        return {
            errorMessage,
            status: 400,
        }
    }
};

const getBusinessPartners = async (cardCode) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        console.error({ cardCode })
        const url = `https://srvhana:50000/b1s/v1/BusinessPartners('${cardCode}')`
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers
        });
        console.log({ sapResponse })
        return {
            message: 'get Business Partners grabada con éxito',
            status: sapResponse.status || 200,
            data:sapResponse.data||{}
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud get Business Partners';
        console.error('Error en la solicitud get Business Partners:', error.response?.data || error.message);
        return {
            errorMessage,
            status: 400,
        }
    }
};

module.exports = {
    patchBusinessPartners,
    getBusinessPartners
}
