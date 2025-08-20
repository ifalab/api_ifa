const buildBodyCreditNotes = (ReturnDocEntry, DocEntry, devolucionDetalle) => {
    const cabeceraCN = []
    const DocumentLinesCN = []
    let DocumentAdditionalExpenses = []
    let numDev = 0
    for (const lineDevolucion of devolucionDetalle) {
        const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
            CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
            PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
            ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
            ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev,
            GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
            ...restDev
        } = lineDevolucion
        if (cabeceraCN.length == 0) {

            cabeceraCN.push({
                DocDate: DocDateDev,
                DocDueDate: DocDueDateDev,
                CardCode: CardCodeDev,
                NumAtCard,
                DocTotal: DocTotalDev,
                DocCurrency: DocCurrencyDev,
                Reference1: ReturnDocEntry,// DocEntry de la devolucion
                Reference2: DocEntry ?? '',// DocEntry de la factura
                Comments: CommentsDev,
                JournalMemo: JournalMemoDev,
                PaymentGroupCode,
                SalesPersonCode,
                Series: 361,
                U_UserCode,
                ControlAccount: 2110401
            })
        }
        if (DocumentAdditionalExpenses.length == 0) {
            DocumentAdditionalExpenses = [
                { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_GND' },
                { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_GND' },
            ]
        }

        const newLineDev = {
            LineNum: numDev,
            BaseLine: LineNumDev,
            BaseType: 16,
            BaseEntry: ReturnDocEntry,
            ItemCode: ItemCodeDev,
            Quantity: QuantityDev,
            WarehouseCode: WarehouseCodeDev,
            AccountCode: '6210103',
            GrossTotal: GrossTotalDev,
            GrossPrice: GrossPriceDev,
            MeasureUnit: MeasureUnitDev,
            UnitsOfMeasurment: UnitsOfMeasurmentDev,
            TaxCode: 'IVA_GND'
        }

        DocumentLinesCN.push(newLineDev)

        numDev += 1
    }

    const bodyCreditNotes = {
        ...cabeceraCN[0],
        DocumentLines: DocumentLinesCN,
        DocumentAdditionalExpenses
    }
    return bodyCreditNotes
}
module.exports = {
    buildBodyCreditNotes
}