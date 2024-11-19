const { tipoDeCambion, empleadosHana, findEmpleadoByCode } = require("./hana.controller")
const { asientoContable, findOneAsientoContable, asientoContableCentroCosto } = require("./sld.controller")

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
        console.log({ response })
        const status = response.status
        const orderNumber = response.orderNumber
        if (!status) {
            if (response.value == 'Posting period locked; specify an alternative date') return res.status(400).json({ mensaje: 'El período de contabilizacion está bloqueado; especifique una fecha alternativa' })
            if (response.value == `CServiceData::SetPropertyValueString failed; Value too long in property 'Indicator' of 'JournalEntry'`) return res.status(400).json({ mensaje: 'el valor es demasiado largo en la propiedad Indicador' })
            return res.status(400).json({ mensaje: 'Error no controlado' })
        }
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
        if (result.lang) return res.status(404).json({ mensaje: result.value })
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

const asientoContableCC_Controller = async (req, res) => {
    try {
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines,
        } = req.body

        const JournalVoucher = {
            JournalEntry: {
                ReferenceDate,
                DueDate,
                Memo,
                Reference,
                Reference2,
                Reference3,
                Indicator,
                JournalEntryLines,
            },
        }

        const result = await asientoContableCentroCosto(JournalVoucher)
        const status = result.status
        console.log({ result })
        if (result !== 'creado con exito') {
            if (result.value == 'Update the exchange rate ') return res.status(400).json({ mensaje: 'El período de contabilizacion está bloqueado; especifique una fecha alternativa' })
            if (result.value == `CServiceData::SetPropertyValueString failed; Value too long in property 'Indicator' of 'JournalEntry'`) return res.status(400).json({ mensaje: 'el valor es demasiado largo en la propiedad Indicador' })
            return res.status(400).json({ mensaje: 'Error no controlado.' })
        }
        return res.status(200).json({ result })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en asientoContableCC_Controller' })
    }
}

const createAsientoContableController = async (req, res) => {
    try {
        const {
            ReferenceDate,
            Memo,
            Indicator,
            JournalEntryLines, } = req.body


        console.log({
            ReferenceDate,
            Memo,
            Indicator,
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
                const newContraJournal = {
                    ...restData,
                    Credit: 0,
                    Debit: Credit,
                    DebitSys: parseFloat(newValue.toFixed(2)),
                    CreditSys: 0
                }
                journalList.push(newJournal)
                journalList.push(newContraJournal)
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
                const newContraJournal = {
                    ...restData,
                    Credit: Debit,
                    Debit: 0,
                    DebitSys: 0,
                    CreditSys: parseFloat(newValue.toFixed(2)),
                }
                journalList.push(newJournal)
                journalList.push(newContraJournal)
            }
        })

        const data = {
            ReferenceDate,
            Memo,
            Indicator,
            JournalEntryLines: journalList,
        }
        console.log('final data -----------------------------------------------')
        console.log({ data })

        const response = await asientoContable({
            ...data
        })
        return res.json({ ...response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en createAsientoContableController' })
    }
}

const empleadosController = async (req, res) => {
    try {
        const response = await empleadosHana()
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en emplados controller' })
    }
}

const empleadosByCodeController = async (req, res) => {
    try {
        const code = req.params.code
        const response = await findEmpleadoByCode(code)
        if(response.length == 0) return res.status(404).json({mensaje:'El empleado no fue encontrado' }) 
        return res.json({ ...response[0] })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en emplados controller' })
    }
}

module.exports = {
    asientoContableController,
    findByIdAsientoController,
    asientoContableCC_Controller,
    createAsientoContableController,
    empleadosController,
    empleadosByCodeController
}