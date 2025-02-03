const { dmClientes, dmClientesPorCardCode, dmTiposDocumentos, 
    getListaPreciosOficiales, setPrecioOficial, getSucursales, getAreasPorSucursal, 
    getZonasPorArea, getListaPreciosByIdCadenas, setPrecioCadena, getZonasPorSucursal,
    actualizarCliente, descuentoOfertasPorLinea, getAllLineas, setDescuentoOfertasPorCantidad,
    getArticulos, findCliente } = require("./hana.controller")
const { grabarLog } = require("../../shared/controller/hana.controller");
const { patchBusinessPartners, getBusinessPartners } = require("./sld.controller");

const dmClientesController = async (req, res) => {
    try {
        const SucName = req.query.SucName
        const listaDmClientes = await dmClientes()
        let listaClientes = []
        for (const element of listaDmClientes) {
            if (element.SucName == SucName) {
                listaClientes.push(element)
            }
        }
        return res.json(listaClientes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error en el controlador'
        })
    }
}

const dmClientesPorCardCodeController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const cliente = await dmClientesPorCardCode(cardCode)
        const usuario = req.usuarioAutorizado
        if (!cliente[0]) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cliente por CardCode", `Error: No se encontro el cliente por el cardcode, se uso el cardcode: ${cardCode} `, ``, "datos-maestros/clientes-cardcode", process.env.PRD)
            return res.status(400).json({ mensaje: 'el cliente no existe' })
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cliente por CardCode", `Busqueda del cliente por cardcode realizada con exito ${cardCode} `, ``, "datos-maestros/clientes-cardcode", process.env.PRD)
        return res.json({ ...cliente[0] })

    } catch (error) {
        console.log({ error })
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cliente por CardCode", `Error en el controlador. ${error.message || ''} `, ``, "datos-maestros/clientes-cardcode", process.env.PRD)
        return res.status(500).json({
            mensaje: 'error en el controlador'
        })
    }
}

const dmUpdateClienteController = async (req, res) => {
    try {

        const {
            CardCode,
            CardName,
            CardType,
            Phone1,
            Phone2,
            Cellular,
            Address,
            U_B_dni_type,
            U_B_compl,
            GroupCode,
            SucCode,
            AreaCode,
            ZoneCode,
            SlpCode,
            Dim1PrcCode,
            Dim2PrcCode,
            GroupNum,
            CreditLine,
            Balance,
            DNotesBal,
            OrdersBal,
            DebPayAcct,
            Notes,
            ...rest } = req.body

        const dataToUpdate = {
            AdditionalID: rest.AddID,
            CardName,
            CardType,
            Phone1,
            Phone2,
            Cellular,
            EmailAddress: rest.E_Mail,
            PriceListNum: rest.ListNum,
            CardForeignName: rest.CardFName,
            FederalTaxID: rest.LicTradNum,
            U_B_dni_type,
            U_B_compl,
            GroupCode,
            U_SucCode: SucCode,
            U_AreaCode: AreaCode,
            U_ZoneCode: ZoneCode,
            SalesPersonCode: SlpCode,
            U_DIM1: Dim1PrcCode,
            U_DIM2: Dim2PrcCode,
            PayTermsGrpCode: GroupNum,
            CreditLimit: CreditLine,
            DebitorAccount: DebPayAcct,
            FreeText: Notes
        }
        const response = await patchBusinessPartners(CardCode, dataToUpdate)
        // const response = await getBusinessPartners(CardCode)
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if (response.status == 400) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Actualizar Cliente", `Error: ${response.errorMessage || 'patchBusinessPartners()'} `, `https://srvhana:50000/b1s/v1/BusinessPartners`, "datos-maestros/update-cliente", process.env.PRD)
            return res.status(400).json({ mensaje: `error del SAP en Path Business Partners ${response.errorMessage.value || ''}` })
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Actualizar Cliente", `Exito en la operacion: ${response.message || ''} `, `https://srvhana:50000/b1s/v1/BusinessPartners`, "datos-maestros/update-cliente", process.env.PRD)
        return res.json({ mensaje: `${response.message || 'operacion realizada con exito'}` })
    } catch (error) {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Actualizar Cliente", `Error en el controlador dmUpdateClienteController: ${error.message || ''} `, ``, "datos-maestros/update-cliente", process.env.PRD)
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador dmUpdateClienteController' })

    }
}

const dmTipoDocumentosController = async (req, res) => {
    try {
        const tipoDoc = await dmTiposDocumentos()
        return res.json( tipoDoc )
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const getListaPreciosOficialesController = async (req, res) => {
    try {
        const lista = await getListaPreciosOficiales()
        if(lista.status!=200){
            return res.status(400).json({mensaje: `${lista.message || 'Error en getListaPreciosOficiales'}`})
        }
        lista.data.forEach(element => {
            element.CreateDate = element.CreateDate.split(' ')[0]
        });
        return res.json({precios: lista.data})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getListaPreciosOficialesController: ${error.message || ''}` })
    }
}

const setPrecioOficialController = async (req, res) => {
    try {
        const body = req.body
        console.log({body})
        // return res.json({body})
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let lista=[];
        for(const line of body.items){
            const response = await setPrecioOficial(line.ItemCode, line.Price, body.IdVendedorSap, body.Glosa)
            if(response.status!=200){
                grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Oficiales", `Error: ${response.message || 'setPrecioOficial()'} `, `call ifa_dm_agregar_precio_oficial()`, "datos-maestros/set-precio-item", process.env.PRD)
                return res.status(400).json({mensaje: `${response.message || 'Error en setPrecioOficial'}`})
            }
            lista.push(response.data)
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Oficiales", `Precios oficiales grabados con exito`, ``, "datos-maestros/set-precio-item", process.env.PRD)
        return res.json(lista)
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Oficiales", `Error en el controlador setPrecioOficialController: ${error.message || ''} `, `catch del controller`, "datos-maestros/set-precio-item", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en el controlador setPrecioOficialController: ${error.message || ''}` })
    }
}

const getSucursalesController = async (req, res) => {
    try {
        const sucursales = await getSucursales()
        if(sucursales.status!=200){
            return res.status(400).json({mensaje: `${sucursales.message || 'Error en getSucursales'}`})
        }
        sucursales.data = sucursales.data.filter(element => 
            element.SucCode != null
        );
        return res.json({sucursales:sucursales.data})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getSucursalesController: ${error.message || ''}` })
    }
}

const getAreasPorSucursalController = async (req, res) => {
    try {
        const sucCode = req.query.code
        const areas = await getAreasPorSucursal(sucCode)
        if(areas.status!=200){
            return res.status(400).json({mensaje: `${areas.message || 'Error en getAreasPorSucursal'}`})
        }
        // areas.data = areas.data.filter(element => 
        //     element.SucCode != null
        // );
        return res.json({areas:areas.data})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getAreasPorSucursalController: ${error.message || ''}` })
    }
}

const getZonasPorAreaController = async (req, res) => {
    try {
        const areaCode = req.query.code
        const zonas = await getZonasPorArea(areaCode)
        if(zonas.status!=200){
            return res.status(400).json({mensaje: `${zonas.message || 'Error en getZonasPorArea'}`})
        }
        // zonas.data = zonas.data.filter(element => 
        //     element.SucCode != null
        // );
        return res.json({zonas:zonas.data})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getZonasPorAreaController: ${error.message || ''}` })
    }
}

const getListaPreciosByIdCadenasController = async (req, res) => {
    try {
        const listCode = req.query.listCode
        console.log(listCode)
        const lista = await getListaPreciosByIdCadenas(listCode)
        if(lista.status!=200){
            return res.status(400).json({mensaje: `${lista.message || 'Error en getListaPreciosByIdCadenas'}`})
        }
        lista.data.forEach(element => {
            element.CreateDate = element.CreateDate.split(' ')[0]
        });
        return res.json({precios: lista.data})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getListaPreciosByIdCadenasController: ${error.message || ''}` })
    }
}

const setPrecioCadenaController = async (req, res) => {
    try {
        const body = req.body
        console.log({body})
        // return res.json({body})
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let lista=[];
        for(const line of body.items){
            const response = await setPrecioCadena(line.PriceList, line.ItemCode, line.Price, body.IdVendedorSap, body.Glosa)
            if(response.status!=200){
                grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Cadenas", `Error: ${response.message || 'setPrecioCadena()'} `, ``, "datos-maestros/set-precio-cadena", process.env.PRD)
                return res.status(400).json({mensaje: `${response.message || 'Error en setPrecioCadena'}`})
            }
            lista.push(response.data)
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Cadenas", `Precios oficiales grabados con exito`, ``, "datos-maestros/set-precio-cadena", process.env.PRD)
        return res.json(lista)
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Cadenas", `Error en el controlador setPrecioCadenaController: ${error.message || ''} `, `catch del controller`, "datos-maestros/set-precio-cadena", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en el controlador setPrecioCadenaController: ${error.message || ''}` })
    }
}

const getZonasPorSucursalController = async (req, res) => {
    try {
        const areaCode = req.query.code
        const zonas = await getZonasPorSucursal(areaCode)
        if(zonas.status!=200){
            return res.status(400).json({mensaje: `${zonas.message || 'Error en getZonasPorSucursal'}`})
        }
        return res.json({zonas:zonas.data})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getZonasPorSucursalController: ${error.message || ''}` })
    }
}

const actualizarDatosClienteController = async (req, res) => {
    try {
        const {
            CardCode,
            U_B_dni_type,
            SucCode,
            AreaCode,
            ZoneCode,
            CreditLine} = req.body
        console.log({body: req.body})
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }

        let response = await actualizarCliente(CardCode, `U_B_dni_type`, U_B_dni_type, 0)
        response = await actualizarCliente(CardCode, `SucCode`, '', SucCode)
        response = await actualizarCliente(CardCode, `AreaCode`, '', AreaCode)
        response = await actualizarCliente(CardCode, `ZoneCode`, '', ZoneCode)
        response = await actualizarCliente(CardCode, `CreditLine`, '', CreditLine)
        if (response.status == 400) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Actualizar Datos Cliente", `Error: ${response.errorMessage || 'actualizarCliente()'} `, ``, "datos-maestros/actualizar-cliente", process.env.PRD)
            return res.status(400).json({ mensaje: `${response.errorMessage.value || 'Error en actualizarCliente'}` })
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Actualizar Datos Cliente", `Exito en la operacion: ${response.message || ''} `, ``, "datos-maestros/actualizar-cliente", process.env.PRD)
        return res.json({ mensaje: `${response.message || 'operacion realizada con exito'}` })
    } catch (error) {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Actualizar Datos Cliente", `Error en el controlador actualizarDatosClienteController: ${error.message || ''}`, `${error.query || ''}`, "datos-maestros/actualizar-cliente", process.env.PRD)
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador actualizarDatosClienteController: ${error.message || ''}` })
    }
}

const descuentoOfertasPorLineaController = async (req, res) => {
    try {
        console.log({body: req.body})
        const {lineaItem, desc, fechaInicial, fechaFinal} = req.body
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await descuentoOfertasPorLinea(lineaItem, desc, fechaInicial, fechaFinal)
        if(response.status!=200){
            // grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Linea", `Error: ${response.message || 'descuentoOfertasPorLinea()'} `, `${response.query || 'descuentoOfertasPorLinea'}`, "datos-maestros/descuento-linea", process.env.PRD)
            return res.status(400).json({mensaje: `${response.message || 'Error en descuentoOfertasPorLinea'}`})
        }
        // grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Linea", `Exito en la actualizacion de descuentos por linea`, `${response.query || 'descuentoOfertasPorLinea'}`, "datos-maestros/descuento-linea", process.env.PRD)
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador descuentoOfertasPorLineaController: ${error.message || ''}`
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Linea", mensaje, ``, "datos-maestros/descuento-linea", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const getAllLineasController = async (req, res) => {
    try {
        const response = await getAllLineas()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getAllLineasController: ${error.message || ''}` })
    }
}

const getArticulosController = async (req, res) => {
    try {
        const lineCode= req.query.lineCode
        const response = await getArticulos(lineCode)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getArticulosController: ${error.message || ''}` })
    }
}

const setDescuentoOfertasPorCantidadController = async (req, res) => {
    try {
        const {body}=req
        console.log({body})
        let responses =[]
        for(const descuento of body){
            const {ItemCode,CantMin, CantMax, Desc, FechaInicial, FechaFinal} = descuento
            const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
            const response = await setDescuentoOfertasPorCantidad(ItemCode,CantMin, CantMax, Desc, FechaInicial, FechaFinal)
            responses.push(response)
            if(response.status!=200){
                // grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Cantidad", `Error: ${response.message || 'setDescuentoOfertasPorCantidad()'} `, `${response.query || 'setDescuentoOfertasPorCantidad'}`, "datos-maestros/descuento-cantidad", process.env.PRD)
                return res.status(400).json({mensaje: `${response.message || 'Error en setDescuentoOfertasPorCantidad'}`})
            }
        }
        // grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Cantidad", `Exito en la actualizacion de descuentos por cantidad`, `${response.query || 'setDescuentoOfertasPorCantidad'}`, "datos-maestros/descuento-cantidad", process.env.PRD)
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador setDescuentoOfertasPorCantidadController: ${error.message || ''}`
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Cantidad", mensaje, ``, "datos-maestros/descuento-cantidad", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const findClienteController = async (req, res) => {
    try {
        const body= req.body
        console.log({body})
        const buscar = body.buscar.toUpperCase()
        console.log({buscar})
        const response = await findCliente(buscar)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador findClienteController: ${error.message || ''}` })
    }
}

module.exports = {
    dmClientesController,
    dmClientesPorCardCodeController,
    dmUpdateClienteController,
    dmTipoDocumentosController,
    getListaPreciosOficialesController,
    setPrecioOficialController,
    getSucursalesController,
    getAreasPorSucursalController,
    getZonasPorAreaController,
    getListaPreciosByIdCadenasController,
    setPrecioCadenaController,
    getZonasPorSucursalController,
    actualizarDatosClienteController,
    descuentoOfertasPorLineaController,
    getAllLineasController,
    setDescuentoOfertasPorCantidadController,
    getArticulosController,
    findClienteController
}