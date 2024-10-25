const { tipoDeCambion } = require("./hana.controller")
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


        console.log({
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            JournalEntryLines,
        })
        const tipoCambio = await tipoDeCambion()
        const usd = tipoCambio[0]
        console.log({ usd })
        const journalList = []
        JournalEntryLines.map((item) => {
            const { Credit, Debit, ...restData } = item
            const cambio = +usd.Rate
            if (Credit !== 0 && Debit == 0) {
                const newValue = +Credit / cambio
                const newJournal = {
                    ...restData,
                    Credit,
                    Debit: 0,
                    DebitSys: 0,
                    CreditSys: parseFloat(newValue.toFixed(2))
                }
                journalList.push(newJournal)
            }

            if(Credit == 0 && Debit !== 0){
                const newValue = +Debit / cambio
                const newJournal = {
                    ...restData,
                    Credit: 0,
                    Debit,
                    DebitSys: parseFloat(newValue.toFixed(2)),
                    CreditSys: 0
                }
                journalList.push(newJournal)
            }
        })
        
        const data = {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            JournalEntryLines:journalList, 
        }
        console.log('final data -----------------------------------------------')
        console.log({data})
        return res.json({data})
        const response = await asientoContable({
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            JournalEntryLines
        })

        const status = response.status
        if (!status) return res.status(400).json({ mensaje: 'Hubo un error al guardar el asiento contable' })
        return res.json({ response })
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error en asientoContableController no controlado' })
    }
}

module.exports = {
    asientoContableController,
}