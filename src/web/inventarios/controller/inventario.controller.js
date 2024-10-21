const { json } = require("express")
const { almacenesPorDimensionUno, clientesPorDimensionUno, inventarioHabilitacion } = require("./hana.controller")
const { postSalidaHabilitacion, postEntradaHabilitacion } = require("./sld.controller")

const clientePorDimensionUnoController = async (req, res) => {
    try {
        const { dimension } = req.body
        const list = []
        for (const iterator of dimension) {
            const result = await clientesPorDimensionUno(iterator)
            result.map((itemResult) => {
                list.push(itemResult)
            })
        }
        return res.status(200).json({ list })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el clientePorDimensionUnoController',
            error
        })

    }
}
const almacenesPorDimensionUnoController = async (req, res) => {
    try {
        const { dimension } = req.body
        const list = []
        for (const iterator of dimension) {
            const result = await almacenesPorDimensionUno(iterator)
            result.map((itemResult) => {
                list.push(itemResult)
            })
        }
        return res.status(200).json({ list })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el almacenesPorDimensionUnoController',
            error
        })
    }
}

const postHabilitacionController = async (req, res) => {
    try {
        const { userLocal, formulario } = req.body
        const code = formulario.cliente.CardCode
        const concepto = formulario.concepto
        const inventario = formulario.inventario
        const warehouseCode = formulario.almacen.WhsCode
        let listItem = []
        let index = 0
        inventario.map((item) => {
            // console.log({ item })
            const itemInventario = {
                "ItemCode": `${item.articulo}`,
                "WarehouseCode": `${warehouseCode}`,
                "Quantity": `${item.cantidadSalida}`,
                "AccountCode": "6110401",
                "BatchNumbers": [
                    {
                        "BatchNumber": `${item.lote}`,
                        "Quantity": `${item.cantidadSalida}`,
                        "BaseLineNumber": index,
                        "ItemCode": `${item.articulo}`
                    }
                ]
            }
            index++
            listItem.push(itemInventario)
        })
        // console.log({ warehouseCode })
        // console.log({userLocal,formulario})
        const data = {
            "U_CardCode": `${code}`,
            "U_Tipo_salidas": "033",
            "Reference1": null,
            "Reference2": null,
            "Comments": `${concepto}`,
            "JournalMemo": "Salida por Habilitacion",
            "U_UserCode": `${userLocal.UserCode}`,
            "DocumentLines": listItem
        }
        const response = await postSalidaHabilitacion(data)
        if (response.lang) return res.status(400).json({ response })
        //todo-------------------------------------------------------------
        const orderNumber = response.orderNumber
        const responseHana = await inventarioHabilitacion(orderNumber)

        const cabecera = {
            // DocEntry: responseHana[0].DocEntry,
            Ref2: responseHana[0].Ref2,
            U_CardCode: responseHana[0].U_CardCode,
            U_Tipo_entradas: responseHana[0].U_Tipo_entradas,
            Comments: responseHana[0].Comments,
            U_UserCode: responseHana[0].U_UserCode,
            JrnlMemo: responseHana[0].JrnlMemo,
        }
        const DocumentLines = []
       
        responseHana.map((item) => {
            const BatchNumbers = []
            const batch = {
                BatchNumber: item.BatchNumber,
                Quantity: item.Quantity,
                BaseLineNumber: item.DocLineNum,
                ItemCode: item.ItemCode,
            }
            BatchNumbers.push(batch)
            const linea = {
                DocLineNum: item.DocLineNum,
                ItemCode: item.ItemCode,
                Dscription: item.Dscription,
                WhsCode: item.WhsCode,
                Quantity: item.Quantity,
                Price: item.Price,
                LineTotal: item.LineTotal,
                AccountCode: item.AccountCode,
                BatchNumbers
            }

            DocumentLines.push(linea)
        })


        const dataFinal = {
            ...cabecera,
            DocumentLines
        }
        const responseEntradaHabilitacion = await postEntradaHabilitacion(dataFinal)
        return res.json(responseEntradaHabilitacion)
        //return res.json({...dataFinal})
    } catch (error) {
        return res.status(500), json({
            mensaje: 'Error en postSalidaController ',
            error,
        })
    }
}
module.exports = {
    clientePorDimensionUnoController,
    almacenesPorDimensionUnoController,
    postHabilitacionController
}