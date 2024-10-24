const { asientoContable } = require("./sld.controller")

const asientoContableController = async (req, res) => {
    try {
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            JournalEntryLines, } = req.body

        const response = await asientoContable({
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            JournalEntryLines
        })

        return res.json({ response })
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error en asientoContableController no controlado' })
    }
}

module.exports = {
    asientoContableController,
}