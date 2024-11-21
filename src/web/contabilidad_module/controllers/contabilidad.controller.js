const { tipoDeCambion, empleadosHana, findEmpleadoByCode, findAllBancos } = require("./hana.controller")
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
            codEmp,
            date,
            monto,
            banckAccount,
            glosa,
            cheque
        } = req.body
        const tipoCambio = await tipoDeCambion()
        const usdRate = tipoCambio[0]
        const usd = +usdRate.Rate
        if (monto == 0) return res.status(400).json({ mensaje: 'El monto no puede ser cero' })
        if (usd == 0) return res.status(400).json({ mensaje: 'El tipo de cambio no puede ser cero' })
        const newValue = +monto / usd
        let firstAccount = {
            AccountCode: '1120501',
            ShortName: `${codEmp}`,
            Credit: 0,
            Debit: monto,
            CreditSys: 0,
            DebitSys: parseFloat(newValue.toFixed(2)),
            ContraAccount: `${banckAccount}`,
            LineMemo: `${glosa}`,
            Reference1: '',
            Reference2: ''
        }
        let contraAccount = {
            AccountCode: `${banckAccount}`,
            ShortName: `${banckAccount}`,
            Credit: monto,
            Debit: 0,
            CreditSys: parseFloat(newValue.toFixed(2)),
            DebitSys: 0,
            ContraAccount: '',
            LineMemo: glosa,
            Reference1: `${cheque}`,
            Reference2: '',
        }

        let JournalEntryLines = []
        JournalEntryLines.push(firstAccount)
        JournalEntryLines.push(contraAccount)
        let data = {
            ReferenceDate: date,
            Memo: glosa,
            Indicator: '11',
            JournalEntryLines
        }

        console.log({...data})
        // return
        // return res.status(400).json({ mensaje: `Hubo un error al crear la apertura de caja` })
        const response = await asientoContable({
            ...data
        })
        if (response.value) {
            return res.status(400).json({ mensaje: `Hubo un error al crear la apertura de caja` })
            // return res.status(400).json({ mensaje: `${response.value}` })
            //{ lang: 'en-us', value: '10000415 - Linked value 11 does not exist' }
            // value: "Enter valid code  [JournalEntryLines.ContraAccount][line: 2] , '1120501'"
        }
        return res.json({mensaje:'Apertura de Caja creado con exito' })



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
        if (response.length == 0) return res.status(404).json({ mensaje: 'El empleado no fue encontrado' })
        return res.json({ ...response[0] })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en emplados controller' })
    }
}

const findAllBancoController = async (req, res) => {
    try {
        const listBank = await findAllBancos()
        return res.json({ listBank })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el find all bank controlador' })
    }
}
module.exports = {
    asientoContableController,
    findByIdAsientoController,
    asientoContableCC_Controller,
    createAsientoContableController,
    empleadosController,
    empleadosByCodeController,
    findAllBancoController
}