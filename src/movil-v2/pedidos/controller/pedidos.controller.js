const { getDocDueDate } = require("./hana.controller")
const { postOrden } = require("./sld.controller")

const ordenVentaController = async (req, res) => {
    try {
        const { data } = req.body
        const GroupNum = data.GroupNum
        const DocDueDate = data.DocDueDate
        const dueDate = await getDocDueDate(DocDueDate, GroupNum)
        if (!dueDate || dueDate.length == 0) {
            return res.status(400).json({ mensaje: 'error  en obtener el doc due date' })
        }
        const newDueDate = dueDate[0].DocDueDate
        const dataFinal = {
            CardCode: data.CardCode,
            GroupNum: data.GroupNum,
            DocDueDate: newDueDate,
            DocumentLines: data.DocumentLines
        }
        const sapResponse = await postOrden({ ...dataFinal })
        return res.json({ sapResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

module.exports = {
    ordenVentaController
}