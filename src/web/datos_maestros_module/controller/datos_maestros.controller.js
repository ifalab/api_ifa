const fs = require('fs')
const XLSX = require('xlsx');
const path = require('path');

const { dmClientes, dmClientesPorCardCode, dmTiposDocumentos,
    getListaPreciosOficiales, setPrecioOficial, getSucursales, getAreasPorSucursal,
    getZonasPorArea, getListaPreciosByIdCadenas, setPrecioCadena, getZonasPorSucursal,
    actualizarCliente, descuentoOfertasPorLinea, getAllLineas, setDescuentoOfertasPorCantidad,
    getArticulos, findCliente, getDescuentosCantidad, getIdDescuentosCantidad,
    getArticuloByCode, setDescuentoEspecial, getAllDescuentosLinea, deleteDescuentoLinea,
    setDescuentoEspecialPorArticulo, obtenerTipos, obtenerDescuetosEspeciales,
    getIdsDescuentoEspecial, getDescuentosEspecialesById, getVendedores, getZonas, getAllTipos,
    getZonasTiposPorVendedor, asignarZonasYTiposAVendedores, deleteZonasYTiposAVendedores,
    getDescuentosEspecialesLinea, deleteDescuentosEspecialesLinea,
    articuloByItemCode,
    updateListaPrecios,
    desactivePriceList,
    getIdDescuentosCortoCantidad,
    getDescuentosCantidadCorto,
    setDescuentoOfertasPorCantidadCortoVencimiento,
    lineaByCode, 
    sucursalBySucCode,
    tipoByGroupCode,
    dmSearchClientes,
    findAllArticulos,
    searchArticulos} = require("./hana.controller")
const { grabarLog } = require("../../shared/controller/hana.controller");
const { patchBusinessPartners, getBusinessPartners } = require("./sld.controller");
const { validateDataExcel } = require('./helpers');

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
            mensaje: `Error en el controlador: ${error.message || ''}`
        })
    }
}

const dmSearchClientesController = async (req, res) => {
    try {
        let search = req.query.search
        if(search == undefined || search == null){
            console.log({search})
            return res.status(400).json({ mensaje: 'debe existir un parametro de busqueda' })
        }
        search = search.toUpperCase()
        const listaDmClientes = await dmSearchClientes(search)
        return res.json(listaDmClientes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el controlador: ${error.message || ''}`
        })
    }
}

const dmClientesPorCardCodeController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const cliente = await dmClientesPorCardCode(cardCode)
        // console.log({ cliente })
        if (!cliente[0]) {
            return res.status(400).json({ mensaje: 'el cliente no existe' })
        }
        return res.json({ ...cliente[0] })
    } catch (error) {
        console.log({ error })
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
        return res.json(tipoDoc)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const getListaPreciosOficialesController = async (req, res) => {
    try {
        const lista = await getListaPreciosOficiales()
        if (lista.status != 200) {
            return res.status(400).json({ mensaje: `${lista.message || 'Error en getListaPreciosOficiales'}` })
        }
        lista.data.forEach(element => {
            element.CreateDate = element.CreateDate.split(' ')[0]
        });
        return res.json({ precios: lista.data })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getListaPreciosOficialesController: ${error.message || ''}` })
    }
}

const setPrecioOficialController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        // return res.json({body})
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let lista = [];
        for (const line of body.items) {
            const response = await setPrecioOficial(line.ItemCode, line.Price, body.IdVendedorSap, body.Glosa)
            if (response.status != 200) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Oficiales", `Error: ${response.message || 'setPrecioOficial()'} `, `call ifa_dm_agregar_precio_oficial()`, "datos-maestros/set-precio-item", process.env.PRD)
                return res.status(400).json({ mensaje: `${response.message || 'Error en setPrecioOficial'}` })
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
        if (sucursales.status != 200) {
            return res.status(400).json({ mensaje: `${sucursales.message || 'Error en getSucursales'}` })
        }
        sucursales.data = sucursales.data.filter(element =>
            element.SucCode != null
        );
        return res.json({ sucursales: sucursales.data })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getSucursalesController: ${error.message || ''}` })
    }
}

const sucursalBySucCodeController = async (req, res) => {
    try {
        const sucCode = req.query.sucCode
        if(!sucCode || sucCode ==0){
            return res.status(400).json({ mensaje: `el codigo de sucursal es obligatorio` })
        }
        const response = await sucursalBySucCode(sucCode)
        if (response.status != 200) {
            return res.status(400).json({ mensaje: `Hubo un error, ${response.message || 'No Definido'}` })
        }
        const data = response.data

        if(data.length==0){
            return res.status(400).json({ mensaje: `No se encontro la sucursal` })
        }
        const sucursal = data[0]
        return res.json(sucursal)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador sucursalBySucCodeController: ${error.message || ''}` })
    }
}

const getAreasPorSucursalController = async (req, res) => {
    try {
        const sucCode = req.query.code
        const areas = await getAreasPorSucursal(sucCode)
        if (areas.status != 200) {
            return res.status(400).json({ mensaje: `${areas.message || 'Error en getAreasPorSucursal'}` })
        }
        // areas.data = areas.data.filter(element => 
        //     element.SucCode != null
        // );
        return res.json({ areas: areas.data })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getAreasPorSucursalController: ${error.message || ''}` })
    }
}

const getZonasPorAreaController = async (req, res) => {
    try {
        const areaCode = req.query.code
        const zonas = await getZonasPorArea(areaCode)
        if (zonas.status != 200) {
            return res.status(400).json({ mensaje: `${zonas.message || 'Error en getZonasPorArea'}` })
        }
        // zonas.data = zonas.data.filter(element => 
        //     element.SucCode != null
        // );
        return res.json({ zonas: zonas.data })
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
        if (lista.status != 200) {
            return res.status(400).json({ mensaje: `${lista.message || 'Error en getListaPreciosByIdCadenas'}` })
        }
        lista.data.forEach(element => {
            element.CreateDate = element.CreateDate.split(' ')[0]
        });
        return res.json({ precios: lista.data })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getListaPreciosByIdCadenasController: ${error.message || ''}` })
    }
}

const setPrecioCadenaController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        // return res.json({body})
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let lista = [];
        for (const line of body.items) {
            const response = await setPrecioCadena(line.PriceList, line.ItemCode, line.Price, body.IdVendedorSap, body.Glosa)
            if (response.status != 200) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Cadenas", `Error: ${response.message || 'setPrecioCadena()'} `, `call ifa_dm_agregar_precios`, "datos-maestros/set-precio-cadena", process.env.PRD)
                return res.status(400).json({ mensaje: `${response.message || 'Error en setPrecioCadena'}` })
            }
            lista.push(response.data)
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Cambiar Precios Cadenas", `Precios oficiales grabados con exito`, `call ifa_dm_agregar_precios`, "datos-maestros/set-precio-cadena", process.env.PRD)
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
        if (zonas.status != 200) {
            return res.status(400).json({ mensaje: `${zonas.message || 'Error en getZonasPorSucursal'}` })
        }
        return res.json({ zonas: zonas.data })
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
            CreditLine,
            GroupCode,
            LicTradNum,
            CardFName
        } = req.body
        console.log({ body: req.body })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }

        let response = await actualizarCliente(CardCode, `U_B_dni_type`, U_B_dni_type, 0)
        response = await actualizarCliente(CardCode, `SucCode`, '', SucCode)
        response = await actualizarCliente(CardCode, `AreaCode`, '', AreaCode)
        response = await actualizarCliente(CardCode, `ZoneCode`, '', ZoneCode)
        response = await actualizarCliente(CardCode, `CreditLine`, '', CreditLine)
        response = await actualizarCliente(CardCode, `GroupCode`, '', GroupCode)
        response = await actualizarCliente(CardCode, `LicTradNum`, '', LicTradNum)
        response = await actualizarCliente(CardCode, `CardFName`, CardFName, 0)

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
        console.log({ body: req.body })
        const { lineaItem, desc, fechaInicial, fechaFinal, id_sap } = req.body
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await descuentoOfertasPorLinea(lineaItem, desc, fechaInicial, fechaFinal, id_sap)
        if (response.status != 200) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Linea", `Error: ${response.message || 'descuentoOfertasPorLinea()'} `, `${response.query || 'descuentoOfertasPorLinea'}`, "datos-maestros/descuento-linea", process.env.PRD)
            return res.status(400).json({ mensaje: `${response.message || 'Error en descuentoOfertasPorLinea'}` })
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Linea", `Exito en la actualizacion de descuentos por linea`, `${response.query || 'descuentoOfertasPorLinea'}`, "datos-maestros/descuento-linea", process.env.PRD)
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador descuentoOfertasPorLineaController: ${error.message || ''}`
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Linea", mensaje, ``, "datos-maestros/descuento-linea", process.env.PRD)
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

const lineasByLineCodeController = async (req, res) => {
    try {
        const lineCode = req.query.lineCode
        if (!lineCode || lineCode == 0) {
            return res.status(400).json({ mensaje: `El codigo de linea es obligatorio` })
        }
        const response = await lineaByCode(lineCode)
        if(response.length == 0){
            return res.status(400).json({ mensaje: `No se encontro la linea` })
        }
        const linea = response[0]
        return res.json(linea)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador lineasByLineCodeController: ${error.message || ''}` })
    }
}

const getArticulosController = async (req, res) => {
    try {
        const lineCode = req.query.lineCode
        const response = await getArticulos(lineCode)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getArticulosController: ${error.message || ''}` })
    }
}

const searchArticulosController = async (req, res) => {
    try {
        let search = req.query.search
        search = search.toUpperCase()
        const response = await searchArticulos(search)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador searchArticulosController: ${error.message || ''}` })
    }
}

const findAllArticulosController = async (req, res) => {
    try {
        
        const response = await findAllArticulos()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador findAllArticulosController: ${error.message || ''}` })
    }
}

const setDescuentoOfertasPorCantidadController = async (req, res) => {
    try {
        const { body } = req
        console.log({ body })
        let responses = []
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        for (const descuento of body) {
            const { Row, ItemCode, CantMin, CantMax, Desc, FechaInicial, FechaFinal, id_sap, Delete } = descuento
            const response = await setDescuentoOfertasPorCantidad(Row, ItemCode, CantMin, CantMax, Desc, FechaInicial, FechaFinal, id_sap, Delete)
            responses.push(response)
            if (response.status != 200) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Cantidad", `Error: ${response.message || 'setDescuentoOfertasPorCantidad()'} `, `${response.query || 'setDescuentoOfertasPorCantidad'}`, "datos-maestros/descuento-cantidad", process.env.PRD)
                return res.status(400).json({ mensaje: `${response.message || 'Error en setDescuentoOfertasPorCantidad'}` })
            }
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Cantidad", `Exito en la actualizacion de descuentos por cantidad`, ``, "datos-maestros/descuento-cantidad", process.env.PRD)
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador setDescuentoOfertasPorCantidadController: ${error.message || ''}`
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Cantidad", mensaje, ``, "datos-maestros/descuento-cantidad", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const setDescuentoOfertasPorCortoVencimientoController = async (req, res) => {
    try {
        const { body } = req
        console.log({ body })
        let responses = []
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        for (const descuento of body) {
            const { Row, ItemCode, CantMin, CantMax, Desc, FechaInicial, FechaFinal, id_sap, Delete } = descuento
            const response = await setDescuentoOfertasPorCantidadCortoVencimiento(Row, ItemCode, CantMin, CantMax, Desc, FechaInicial, FechaFinal, id_sap, Delete)
            responses.push(response)
            if (response.status != 200) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Corto Vencimiento", `Error: ${response.message || 'setDescuentoOfertasPorCortoVencimiento'} `, `${response.query || 'setDescuentoOfertasPorCantidad'}`, "datos-maestros/descuento-corto-vencimiento", process.env.PRD)
                return res.status(400).json({ mensaje: `${response.message || 'Error en setDescuentoOfertasPorCortoVencimiento'}` })
            }
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Corto Vencimiento", `Exito en la actualizacion de descuentos por Corto Vencimiento`, ``, "datos-maestros/descuento-corto-vencimiento", process.env.PRD)
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador setDescuentoOfertasPorCortoVencimientoController: ${error.message || ''}`
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Ofertas Corto Vencimiento", mensaje, ``, "datos-maestros/descuento-cantidad", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const findClienteController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        const buscar = body.buscar.toUpperCase()
        console.log({ buscar })
        const response = await findCliente(buscar)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador findClienteController: ${error.message || ''}` })
    }
}

const getIdDescuentosCantidadController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await getIdDescuentosCantidad(itemCode)
        console.log(response)
        response.sort((a, b) => a.Id - b.Id);
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getIdDescuentosCantidadController: ${error.message || ''}` })
    }
}

const getIdDescuentosCantidadCortoController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await getIdDescuentosCortoCantidad(itemCode)
        console.log(response)
        response.sort((a, b) => a.Id - b.Id);
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getIdDescuentosCantidadCortoController: ${error.message || ''}` })
    }
}
const getDescuentosCantidadController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        const response = await getDescuentosCantidad(body.Id, body.ItemCode)
        // console.log(response)
        response.forEach((value) => {
            value.ToDate = value.ToDate.split(' ')[0]
            value.FromDate = value.FromDate.split(' ')[0]
        })
        response.sort((a, b) => a.Row - b.Row);

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getDescuentosCantidadController: ${error.message || ''}` })
    }
}

const getDescuentosCantidadCortoController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        const response = await getDescuentosCantidadCorto(body.Id, body.ItemCode)
        // console.log(response)
        response.forEach((value) => {
            value.ToDate = value.ToDate.split(' ')[0]
            value.FromDate = value.FromDate.split(' ')[0]
        })
        response.sort((a, b) => a.Row - b.Row);

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getDescuentosCantidadCortoController: ${error.message || ''}` })
    }
}

const getArticuloByCodeController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await getArticuloByCode(itemCode)
        console.log(response)
        if (response.length > 0)
            return res.json(response[0])
        else
            return res.status(400).json({ mensaje: 'No existe item con ese codigo' })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getArticuloByCodeController: ${error.message || ''}` })
    }
}

const setDescuentoEspecialController = async (req, res) => {
    try {
        const { body } = req
        console.log({ body })
        const { cardCode, lineaItem, desc, fechaInicial, fechaFinal, id_sap } = body
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await setDescuentoEspecial(cardCode, lineaItem, desc, fechaInicial, fechaFinal, id_sap)
        if (response.status != 200) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Especial", `Error: ${response.message || 'setDescuentoEspecial()'}`, `${response.query || 'setDescuentoEspecial'}`, "datos-maestros/descuento-especial", process.env.PRD)
            return res.status(400).json({ mensaje: `${response.message || 'Error en setDescuentoEspecial'}` })
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Especial", `Exito en la actualizacion de descuento especial por linea`, `${response.query || 'setDescuentoEspecial'}`, "datos-maestros/descuento-especial", process.env.PRD)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador setDescuentoEspecialController: ${error.message || ''}`
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Oferta Especial", mensaje, `catch del controller`, "datos-maestros/descuento-especial", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const getAllDescuentosLineaController = async (req, res) => {
    try {
        const response = await getAllDescuentosLinea()
        // console.log(response)
        response.forEach((value) => {
            value.ToDate = value.ToDate.split(' ')[0]
            value.FromDate = value.FromDate.split(' ')[0]
        })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getAllDescuentosLineaController: ${error.message || ''}` })
    }
}

const deleteDescuentoLineaController = async (req, res) => {
    try {
        const { id, lineItem, id_sap } = req.body
        console.log({ id, lineItem, id_sap })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await deleteDescuentoLinea(id, lineItem, id_sap)
        console.log(response)
        if (response.status != 200) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Oferta Linea", `Error: ${response.message || 'deleteDescuentoLinea()'}`, `${response.query || 'deleteDescuentoLinea'}`, "datos-maestros/delete-desc-linea", process.env.PRD)
            return res.status(400).json({ mensaje: response.message || 'Error desconocido en deleteDescuentoLinea' })
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Oferta Linea", `Exito al eliminar el descuento`, `${response.query || 'deleteDescuentoLinea'}`, "datos-maestros/delete-desc-linea", process.env.PRD)
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Oferta Linea", `Error en controlador deleteDescuentoLineaController: ${error.message || ''} `, `catch del controller`, "datos-maestros/delete-desc-linea", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en el controlador deleteDescuentoLineaController: ${error.message || ''}` })
    }
}

const setDescuentoEspecialPorArticuloController = async (req, res) => {
    try {
        const { body } = req
        console.log({ body })
        let responses = []
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        for (const descuento of body) {
            const { Row, CardCode, ItemCode, CantMin, CantMax, Desc, FechaInicial, FechaFinal, id_sap, Delete } = descuento
            const response = await setDescuentoEspecialPorArticulo(Row, CardCode, ItemCode, CantMin, CantMax, Desc, FechaInicial, FechaFinal, id_sap, Delete)
            responses.push(response)
            if (response.status != 200) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Especial Cantidad", `Error: ${response.message || 'setDescuentoEspecialPorArticulo()'} `, `${response.query || 'setDescuentoEspecialPorArticulo'}`, "datos-maestros/desc-especial-articulo", process.env.PRD)
                return res.status(400).json({ mensaje: `${response.message || 'Error en setDescuentoEspecialPorArticulo'}` })
            }
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Especial Cantidad", `Exito en la actualizacion de descuentos por cantidad`, ``, "datos-maestros/desc-especial-articulo", process.env.PRD)
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador setDescuentoEspecialPorArticuloController: ${error.message || ''}`
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "DM Descuento Especial", mensaje, `catch controller`, "datos-maestros/desc-especial-articulo", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}


const obtenerTiposController = async (req, res) => {
    try {
        const tipos = await obtenerTipos()
        return res.json(tipos)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador obtenerTiposController. ${error.message || ''}` })
    }
}

const tipoByGroupCodeController = async (req, res) => {
    try {
        const groupCode = req.query.groupCode
        if (!groupCode || groupCode == 0) {
            return res.status(400).json({ mensaje: `El codigo de tipo de cliente es obligatorio` })
        }
        const response = await tipoByGroupCode(groupCode)
        if(response.length == 0){
            return res.status(400).json({ mensaje: `No se encontro el tipo de cliente` })
        }
        const tipo = response[0]
        return res.json(tipo)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador obtenerTiposController. ${error.message || ''}` })
    }
}

const obtenerDescuetosEspecialesController = async (req, res) => {
    try {
        const descuentos = await obtenerDescuetosEspeciales()
        return res.json(descuentos)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador obtenerDescuetosEspecialesController. ${error.message || ''}` })
    }
}

const getIdsDescuentoEspecialController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const cardCode = req.query.cardCode
        const response = await getIdsDescuentoEspecial(cardCode, itemCode)
        console.log(response)
        response.sort((a, b) => a.Id - b.Id);
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getIdsDescuentoEspecialController: ${error.message || ''}` })
    }
}

const getDescuentosEspecialesByIdController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        const response = await getDescuentosEspecialesById(body.Id, body.ItemCode, body.CardCode)
        console.log(response)
        response.forEach((value) => {
            value.ToDate = value.ToDate.split(' ')[0]
            value.FromDate = value.FromDate.split(' ')[0]
        })
        response.sort((a, b) => a.Row - b.Row);

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getDescuentosEspecialesByIdController: ${error.message || ''}` })
    }
}

const getVendedoresController = async (req, res) => {
    try {
        const vendedores = await getVendedores()
        return res.json(vendedores)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getVendedoresController. ${error.message || ''}` })
    }
}

const getZonasController = async (req, res) => {
    try {
        const vendedores = await getZonas()
        return res.json(vendedores)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getZonasController. ${error.message || ''}` })
    }
}

const getAllTiposController = async (req, res) => {
    try {
        const vendedores = await getAllTipos()
        return res.json(vendedores)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getAllTiposController. ${error.message || ''}` })
    }
}

const getZonasTiposPorVendedorController = async (req, res) => {
    try {
        const id_vendedor = req.query.id
        const vendedores = await getZonasTiposPorVendedor(id_vendedor)
        return res.json(vendedores)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getZonasTiposPorVendedorController. ${error.message || ''}` })
    }
}

const asignarZonasYTiposAVendedoresController = async (req, res) => {
    try {
        const { id_vendedor, zona, tipo } = req.body
        console.log({ body: req.body })
        const respond = await asignarZonasYTiposAVendedores(id_vendedor, zona, tipo)
        if (respond.status != 200) {
            return res.status(400).json({ mensaje: `${respond.message || ''}` })
        }
        return res.json(respond.result)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador asignarZonasYTiposAVendedoresController. ${error.message || ''}` })
    }
}

const deleteZonasYTiposAVendedoresController = async (req, res) => {
    try {
        const { id_vendedor, zona, tipo } = req.body
        console.log({ body: req.body })
        const respond = await deleteZonasYTiposAVendedores(id_vendedor, zona, tipo)
        if (respond.status != 200) {
            return res.status(400).json({ mensaje: `${respond.message || ''}` })
        }
        return res.json(respond.result)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador deleteZonasYTiposAVendedoresController. ${error.message || ''}` })
    }
}

const getDescuentosEspecialesLineaController = async (req, res) => {
    try {
        const { cardCode } = req.query
        const respond = await getDescuentosEspecialesLinea(cardCode)
        respond.forEach(value => {
            value.Id = value.Code
            delete value.Code;
        })
        /* */
        return res.json(respond)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getDescuentosEspecialesLineaController. ${error.message || ''}` })
    }
}

const deleteDescuentosEspecialesLineaController = async (req, res) => {
    try {
        const { id } = req.query
        const respond = await deleteDescuentosEspecialesLinea(id)
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }

        if (respond.status == 400) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, `Descuentos Especiales Linea`, `Error al eliminar descuentos especiales: ${respond.message || ''}`, respond.query || '', `datos-maestros/delete-espc-linea`, process.env.PRD)
            return res.status(400).json({ mensaje: `${respond.message || 'Error desconocido en deleteDescuentosEspecialesLinea'}` })
        }

        grabarLog(usuario.USERCODE, usuario.USERNAME, `Descuentos Especiales Linea`, `Exito al eliminar el descuento especial por linea de id: ${id}. ${respond.result}`, respond.query || '', `datos-maestros/delete-espc-linea`, process.env.PRD)
        return res.json(respond.result)
    } catch (error) {
        console.log({ error })
        grabarLog(usuario.USERCODE, usuario.USERNAME, `Descuentos Especiales Linea`, `Error al eliminar descuentos especiales: ${error.message || ''}`, '', `datos-maestros/delete-espc-linea`, process.env.PRD)
        return res.status(500).json({ mensaje: `Error en el controlador deleteDescuentosEspecialesLineaController. ${error.message || ''}` })
    }
}

const cargarPreciosExcelController = async (req, res) => {
    try {
        const { comment } = req.body;
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // console.log(req.body);
        let listErrors = [];
        const processedItemCodes = new Set();

        if (!req.archivo) {
            console.log({ files: req.archivo });
            return res.status(400).json({
                mensaje: 'Archivo no obtenido',
                file: req.archivo
            });
        }
        console.log({ comment });
        const { path, originalname } = req.archivo;
        const filePath = path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        console.log(sheetName);
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const errorSet = new Set();
        let idx = 0

        const requiredHeaders = ['ItemCode', 'ItemName', 'Precio', 'ListName', 'PriceList'];

        const headers = [
            worksheet['A1']?.v, // PriceList
            worksheet['B1']?.v, // ListName
            worksheet['C1']?.v, // ItemCode
            worksheet['D1']?.v, // ItemName
            worksheet['E1']?.v  // Precio
        ];

        console.log(headers);

        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

        if (missingHeaders.length > 0) {
            return res.status(400).json({
                mensaje: `Formato de Excel incorrecto. Las siguientes cabeceras están faltando o son incorrectas: ${missingHeaders.join(', ')}`
            });
        }
        for (const element of jsonData) {
            let validate;
            const { ItemCode, ItemName, Precio, ListName, PriceList } = element
            if (processedItemCodes.has(ItemCode)) {
                listErrors.push({
                    PriceList,
                    ListName,
                    ItemCode,
                    ItemName,
                    Precio,
                    error: `El artículo con código ${ItemCode} en la posición ${idx} está duplicado en el archivo.`
                });
            } else {
                validate = validateDataExcel({ ItemCode, ItemName, Precio, ListName, PriceList }, listErrors, idx);

                const response = await articuloByItemCode(ItemCode);
                // console.log(response);
                if (!response.result || response.result.length === 0) {
                    listErrors.push({
                        PriceList,
                        ListName,
                        ItemCode,
                        ItemName,
                        Precio,
                        error: `El artículo con código ${ItemCode} en la posición ${idx} no existe o es incorrecto.`,
                    });
                } else {
                    const dbItem = response.result[0];

                    const dbItemName = dbItem.ItemName;
                    const excelItemName = ItemName;

                    if (dbItemName !== excelItemName) {
                        listErrors.push({
                            PriceList,
                            ListName,
                            ItemCode,
                            ItemName,
                            Precio,
                            error: `El artículo con código ${ItemCode} en la posición ${idx} tiene un nombre incorrecto.`
                        });
                    } else {
                        if (dbItem.validFor !== "Y") {
                            listErrors.push({
                                PriceList,
                                ListName,
                                ItemCode,
                                ItemName,
                                Precio,
                                error: `El artículo con código ${ItemCode} en la posición ${idx} no es válido.`
                            });
                        } else {

                        }
                    }
                }
            }

            if (validate.length > 0) {
                validate.forEach(error => errorSet.add(error));
            }
            ++idx
        }
        listErrors = Array.from(errorSet);

        console.log(listErrors);

        if (listErrors.length > 0) {

            const ws = XLSX.utils.json_to_sheet(listErrors);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Errores');

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

            fs.unlinkSync(filePath);
            // Establecer los encabezados para la descarga del archivo
            res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.set('Content-Disposition', 'attachment; filename=errores.xlsx');
            return res.status(200).end(excelBuffer);  // Enviar el archivo Excel
        } else {
            console.log("Primer valor excel", jsonData[0].PriceList);
            try {
                let result;
                const resultDesactive = await desactivePriceList(jsonData[0].PriceList);
                console.log(resultDesactive);

                if (resultDesactive.status === 200) {
                    result = await updateListaPrecios(jsonData, usuario.ID_SAP, comment);
                }

                fs.unlinkSync(filePath);
                res.set('Content-Type', 'application/json');
                return res.status(200).json({
                    mensaje: 'Archivo procesado correctamente, sin errores.',
                    result
                });
            } catch (error) {
                console.error('Error al actualizar precios:', error);
                return res.status(500).json({
                    mensaje: 'Error al actualizar la lista de precios.',
                    error: error.message || error
                });
            }

        }
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error en el controlador',
            error
        })
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
    findClienteController,
    getIdDescuentosCantidadController,
    getDescuentosCantidadController,
    getArticuloByCodeController,
    setDescuentoEspecialController,
    getAllDescuentosLineaController,
    deleteDescuentoLineaController,
    setDescuentoEspecialPorArticuloController,
    obtenerTiposController,
    obtenerDescuetosEspecialesController,
    getIdsDescuentoEspecialController,
    getDescuentosEspecialesByIdController,
    getVendedoresController,
    getZonasController,
    getAllTiposController,
    getZonasTiposPorVendedorController,
    asignarZonasYTiposAVendedoresController,
    deleteZonasYTiposAVendedoresController,
    getDescuentosEspecialesLineaController,
    deleteDescuentosEspecialesLineaController,
    cargarPreciosExcelController,
    setDescuentoOfertasPorCortoVencimientoController,
    getIdDescuentosCantidadCortoController,
    getDescuentosCantidadCortoController,
    lineasByLineCodeController,
    sucursalBySucCodeController,
    tipoByGroupCodeController,
    dmSearchClientesController,
    findAllArticulosController,
    searchArticulosController,
}