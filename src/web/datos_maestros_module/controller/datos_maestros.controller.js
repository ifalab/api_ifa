const { dmClientes, dmClientesPorCardCode, dmTiposDocumentos } = require("./hana.controller")
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
        if (response.status == 400) {
            return res.status(400).json({ mensaje: `error del SAP en Path Business Partners ${response.errorMessage.value || ''}` })
        }

        return res.json({ mensaje: `${response.message || 'operacion realizada con exito'}` })
    } catch (error) {

        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })

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

module.exports = {
    dmClientesController,
    dmClientesPorCardCodeController,
    dmUpdateClienteController,
    dmTipoDocumentosController
}