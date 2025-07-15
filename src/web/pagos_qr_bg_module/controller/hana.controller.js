const hana = require('@sap/hana-client');

// Configura la conexión a la base de datos HANA
const connOptions = {
    serverNode: `${process.env.HANASERVER}:${process.env.HANAPORT}`,
    uid: process.env.HANAUSER,
    pwd: process.env.HANAPASS
};

// Variable para almacenar la conexión a la base de datos
let connection = null;

// Función para conectar a la base de datos HANA
const connectHANA = () => {
    return new Promise((resolve, reject) => {
        connection = hana.createConnection();
        connection.connect(connOptions, (err) => {
            if (err) {
                console.error('Error de conexión a HANA:', err.message);
                reject(err);
            } else {
                console.log('Conectado a la base de datos HANA');
                resolve(connection);
            }
        });
    });
};

const executeQuery = async (query, params = []) => {
    // console.log('Ejecutando query:', query);
    console.log('Parámetros:', params);

    return new Promise((resolve, reject) => {
        connection.exec(query, params, (err, result) => {
            if (err) {
                console.log('Error en la consulta:', err.message);
                reject(new Error('Error en la consulta'));
            } else {
                console.log('Datos obtenidos con éxito');
                resolve(result);
            }
        });
    });
};



/**
 * Registra una notificación de pago en la base de datos
 * @param {number} qrId - Identificador del QR
 * @param {number} transactionId - Identificador de la transacción
 * @param {string} fechaPago - Fecha de pago en formato YYYY-MM-DD
 * @returns {Promise<Object>} Resultado de la operación
 */
const registrarNotificacionPago = async (qrId, transactionId, fechaPago) => {
    try {
        console.log("[PAGO-QR] Iniciando registro de pago:", qrId, transactionId, fechaPago);

        if (!connection) {
            console.log("[PAGO-QR] Conectando a HANA...");
            await connectHANA();
        }


        // Verificar si ya existe esta notificación
        const checkResult = await findPagoQrByIds(qrId, transactionId);
        console.log("[PAGO-QR] Resultado de verificación:", JSON.stringify(checkResult));

        // Verificar si ya existe (nota: el campo se llama 'total', no 'count')
        if (checkResult && checkResult[0] && checkResult[0].TOTAL > 0) {
            console.log(`[PAGO-QR] Notificación ya registrada: QR=${qrId}, Transacción=${transactionId}`);
            throw Error('Notificación ya registrada');
        }

        // Insertar nueva notificación
        console.log("[PAGO-QR] Insertando nueva notificación...");
        const insertQuery = `
            INSERT INTO "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_NOTIFICACION" 
            (QR_ID, TRANSACTION_ID, PAY_DATE) 
            VALUES (?, ?,  ADD_SECONDS(
                    TO_TIMESTAMP(?, 'YYYY-MM-DD'),
                    SECONDS_BETWEEN('00:00:00', CURRENT_TIME)
                ))
        `;

        await executeQuery(insertQuery, [qrId, transactionId, fechaPago]);
        console.log("[PAGO-QR] Notificación insertada correctamente");

        return {
            result: true,
            message: 'Notificación de pago registrada correctamente'
        };
    } catch (error) {
        console.error("[PAGO-QR] Error en registrarNotificacionPago:", error);

        return {
            result: false,
            message: `Error al registrar el pago: ${error.message}`
        };
    }
};

/**
 * Consulta las notificaciones de pago para un QR específico
 * @param {number} qrId - Identificador del QR
 * @returns {Promise<Object>} Notificaciones encontradas
 */
const consultarNotificacionesPorQRId = async (qrId) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `
            SELECT * 
            FROM "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_NOTIFICACION" 
            WHERE QR_Id = ?
            ORDER BY CREATED_AT DESC
        `;

        return await executeQuery(query, [qrId]);
    } catch (error) {
        console.error('Error en consultarNotificacionesPorQR:', error);
        throw new Error('Error al procesar la solicitud: consultarNotificacionesPorQRId');
    }
};

/**
 * Lista todas las notificaciones de pago
 * @returns {Promise<Object>} Lista de notificaciones
 */
const listarNotificacionesPago = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `
            SELECT * 
            FROM "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_NOTIFICACION" 
            WHERE ISACTIVE = TRUE
            ORDER BY CREATED_AT DESC
        `;

        return await executeQuery(query);
    } catch (error) {
        console.error('Error en listarNotificacionesPago:', error);
        throw new Error('Error al procesar la solicitud: listarNotificacionesPago');
    }
};


/**
 * Busca notificaciones de pago por QR_ID y TRANSACTION_ID
 */
const findPagoQrByIds = async (qrId, transactionId) => {
    try {
        const checkQuery = `
            SELECT COUNT(*) as TOTAL 
            FROM "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_NOTIFICACION" 
            WHERE QR_ID = ? AND TRANSACTION_ID = ?
        `;
        return await executeQuery(checkQuery, [qrId, transactionId]);
    } catch (error) {
        console.error("[PAGO-QR] Error en findPagoQrByIds:", error);
        throw error; // Relanzar el error para manejarlo en la función llamadora
    }
};



/*********************************************************************************************
 ************************ "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_MODULO" *****************************
 *********************************************************************************************
*/

/**
 * Busca notificaciones de pago por QR_ID y TRANSACTION_ID
 */
const findQrModuloByIds = async (qrId) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const checkQuery = `
            SELECT COUNT(*) as TOTAL 
            FROM "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_MODULO" 
            WHERE QR_ID = ?
        `;
        return await executeQuery(checkQuery, [qrId]);
    } catch (error) {
        console.error("[PAGO-QR-MODULO] Error en findQrModuloByIds:", error);
        throw error; // Relanzar el error para manejarlo en la función llamadora
    }
};



const registrarPagoBgMoludo = async (qrId, idSap, idUser, nombreModulo, isPaid) => {
    try {

        if (!connection) {
            await connectHANA();
        }

        const checkResult = await findQrModuloByIds(qrId);

        if (checkResult && checkResult[0] && checkResult[0].TOTAL > 0) {
            throw Error('Pago de QR ya registrado de modulo');
        }

        const insertQuery = `
            INSERT INTO "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_MODULO" 
            (QR_ID, ID_SAP, ID_USER, NOMBRE_MODULO, IS_PAID) 
            VALUES (?, ?, ?, ?, ?)
        `;

        await executeQuery(insertQuery, [qrId, idSap, idUser, nombreModulo, isPaid]);

        return {
            result: true,
            message: 'Pago de QR registrado correctamente en el módulo'
        };
    } catch (error) {
        console.error("[PAGO-QR-MODULO] Error en registrarPagoBgMoludo: ", error);
        return {
            result: false,
            message: `Error al registrar el pago: ${error.message}`
        };
    }
};


const actualizarPagoBgMoludo = async (qrId, transaccionId, payDate, isPaid) => {
    try {

        if (!connection) {
            await connectHANA();
        }

        const checkResult = await findQrModuloByIds(qrId);

        if (checkResult && checkResult[0] && checkResult[0].TOTAL < 0) {
            throw Error('Pago de QR no se puede actualizar porque no existe');
        }

        const insertQuery = `
            UPDATE "LAB_IFA_LAPP"."IFA_PAGO_QR_BG_MODULO" 
            SET TRANSACTION_ID = ?, PAY_DATE = ADD_SECONDS(
                TO_TIMESTAMP(?, 'YYYY-MM-DD'),
                SECONDS_BETWEEN('00:00:00', CURRENT_TIME)
            ), IS_PAID = ?
            WHERE QR_ID = ? 
        `;

        await executeQuery(insertQuery, [transaccionId, payDate, isPaid, qrId]);

        return {
            result: true,
            message: 'Pago de QR registrado correctamente en el módulo'
        };
    } catch (error) {
        console.error("[PAGO-QR-MODULO] Error en registrarPagoBgMoludo: ", error);
        return {
            result: false,
            message: `Error al registrar el pago: ${error.message}`
        };
    }
};



module.exports = {
    registrarNotificacionPago,
    consultarNotificacionesPorQRId,
    listarNotificacionesPago,
    findPagoQrByIds,
    findQrModuloByIds,
    registrarPagoBgMoludo,
    actualizarPagoBgMoludo
};