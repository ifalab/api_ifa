const { grabarLog } = require("../../shared/controller/hana.controller");
const { obtenerimportacionStatus, obtenerDetalleParaResInvoice,  } = require("./hana.controller");
const { postPurchaseInvoices, postCrearPedido, patchLiberarInvoice } = require("../../service/sapService");

const importacionStatusController = async (req, res) => {
    try {
        const data = await obtenerimportacionStatus()
        return res.json(data)
        

    } catch (error) {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Importaciones Status", `${error.message || 'Error al obtener impotationStatus'}`, `importacion status controller`, "importacion-status", process.env.PRD)
        console.log('error en importacionStatusController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}


const createReserveInvoiceController = async (req, res) => {
    try {
        // 1. Obtener id del body
        const docentry = req.query.DocEntry;

        if (!docentry) {
            return res.status(400).json({ mensaje: 'DocEntry es requerido en el query' });
        }

        // 2. Obtener detalle de la db
        const data = await obtenerDetalleParaResInvoice(docentry);

        if (!data || data.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para el DocEntry proporcionado' });
        }

        // 3. Procesar la informacion para mandar al service layer
        // transformar o formatear al body que resuve el service la
        const firstItem = data[0];
        const userSap = req.usuarioAutorizado.ID_SAP || '387'; // Valor por defecto si no existe
        
        
        const formattedData = {
            DocDate: new Date(firstItem.DocDate).toISOString().split('T')[0],
            CardCode: firstItem.CardCode,
            DocCurrency: firstItem.DocCurrency,
            DocTotalFc: parseFloat(firstItem.DocTotalFC),
            ReserveInvoice: firstItem.ReserveInvoice,

            //cambiar si o si cuando se pueda al ID SAP del usuario
            
            U_UserCode: userSap,
            U_UserSign: userSap,
            // PriceMode: firstItem.PriceMode,
            DocumentLines: data.map(item => ({
                LineNum: item.LineNum,
                ItemCode: item.ItemCode,
                Quantity: parseFloat(item.Quantity),
                WarehouseCode: item.WarehouseCode,
                BaseType: item.BaseType,
                BaseEntry: item.BaseEntry,
                BaseLine: item.BaseLine
            }))
        };

        // 4. datos formateados  mandar al service layer
        const serviceResponse = await postPurchaseInvoices(formattedData);

        // 5. Manejar la respuesta del service layer
        if (serviceResponse.status > 299) {
            return res.status(500).json({ code: serviceResponse.status , ms: 'Error en el service layer', mensaje: serviceResponse.errorMessage.value || 'Error al crear factura de reserva en SAP' });
        }

        // 6. Responder al cliente con el resultado
        return res.json({
            message: 'Factura de reserva creada exitosamente',
            data: formattedData,
            reserveInvoiceId: serviceResponse.idReserveInvoice
        });

    } catch (error) {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Import Crear Factura de reserva", `${error.message || 'Error al crear factura de reserva de importaciones'}`, `createReserveInvoiceController`, "create-reserve-invoice", process.env.PRD);
        console.log('error en createReserveInvoiceController');
        console.log({ error });
        return res.status(500).json({ mensaje: 'Error en el controlador' });
    }
}

const createPedidoController = async (req, res) => {
    try {

        const body = req.body;

        // 4. datos formateados  mandar al service layer
        const serviceResponse = await postCrearPedido(body);

        // 5. Manejar la respuesta del service layer
        if (serviceResponse.status > 299) {
            return res.status(500).json({ code: serviceResponse.status , ms: 'Error en el service layer', mensaje: serviceResponse.errorMessage.value || 'Error al crear pedido en SAP' });
        }

        // 6. Responder al cliente con el resultado
        return res.json({
            message: 'Pedido creado exitosamente',
            data: serviceResponse.dataResponse,
        });

    } catch (error) {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Import Crear Factura de reserva", `${error.message || 'Error al crear factura de reserva de importaciones'}`, `createReserveInvoiceController`, "create-reserve-invoice", process.env.PRD);
        console.log('error en createReserveInvoiceController');
        console.log({ error });
        return res.status(500).json({ mensaje: 'Error en el controlador' });
    }
}

const patchLiberarInvoiceController = async (req, res) => {
    try {

        const {idInvoice} = req.body;

        const body = {
            U_SO1_01RETAILONE: 'Y'
        }

        // 4. datos formateados  mandar al service layer
        const serviceResponse = await patchLiberarInvoice(idInvoice, body);

        // 5. Manejar la respuesta del service layer
        if (serviceResponse.status > 299) {
            return res.status(500).json({ code: serviceResponse.status , ms: 'Error en el service layer', mensaje: serviceResponse.errorMessage.value || 'Error al crear pedido en SAP' });
        }

        // 6. Responder al cliente con el resultado
        return res.json({
            message: 'Liberado exitosamente',
            data: serviceResponse.dataResponse,
        });

    } catch (error) {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Error al Liberar", `${error.message || 'Error al liberar las importaciones'}`, `patchLiberarInvoiceController`, "patch-liberar-invoice", process.env.PRD);
        console.log('error en patchLiberarInvoiceController');
        console.log({ error });
        return res.status(500).json({ mensaje: 'Error en el controlador' });
    }
}

module.exports = {
   importacionStatusController,
   createReserveInvoiceController,
   createPedidoController,
   patchLiberarInvoiceController
}