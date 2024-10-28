const { tipoDeCambion } = require("./hana.controller")
const { asientoContable, findOneAsientoContable } = require("./sld.controller")

const asientoContableController = async (req, res) => {
    try {
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
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

            if (Credit == 0 && Debit !== 0) {
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
            Indicator,
            JournalEntryLines: journalList,
        }
        // console.log('final data -----------------------------------------------')
        // console.log({data})

        const response = await asientoContable({
            ...data
        })
        const status = response.status
        const orderNumber = response.orderNumber
        if (!status) return res.status(400).json({ mensaje: 'Hubo un error al guardar el asiento contable' })
        return res.json({ status, orderNumber })
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error en asientoContableController no controlado' })
    }
}

const findByIdAsientoController = async (req, res) => {
    try {

        const id = req.params.id
        const result = await findOneAsientoContable(id)
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines: journal
        } = result
        // return res.json({ result})
        if(result.lang) return res.status(404).json({ error:result.value})
        const JournalEntryLines = []
        journal.map((item) => {
            const {
                AccountCode,
                ShortName,
                Credit,
                Debit,
                ContraAccount,
                LineMemo,
                Reference1,
                Reference2, 
            } = item
            JournalEntryLines.push({
                AccountCode,
                ShortName,
                Credit,
                Debit,
                ContraAccount,
                LineMemo,
                Reference1,
                Reference2, 
            })
        })
        return res.json({
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en findByIdAsientoController' })
    }
}

module.exports = {
    asientoContableController,
    findByIdAsientoController
}