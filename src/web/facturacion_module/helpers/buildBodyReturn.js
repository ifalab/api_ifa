const buildBodyReturn = (CardCode, LicTradNum, CardFName, Cuf, newDetails) => {
    const bodyReturns = {
        CardCode,
        U_NIT: LicTradNum,
        U_RAZSOC: CardFName,
        U_B_cufd: Cuf,
        U_TIPODOC: 6,
        U_UserCode: 1,
        DocumentLines: []
    }
    const documentLines = []
    let idx = 0
    for (const element of newDetails) {
        const { ItemCode, Quantity, LineNum, NumPerMsr, UnitPrice, Price, WhsCode, batchNumbers } = element
        const TaxCode = 'IVA_NC'
        const AccountCode = '6210103'
        const grossTotal = Number(Quantity) * Number(UnitPrice)
        const data = {
            LineNum,
            ItemCode,
            Quantity: +Quantity,
            TaxCode,
            AccountCode,
            WarehouseCode: WhsCode,
            GrossTotal: Number(grossTotal.toFixed(2)),
            BatchNumbers: batchNumbers.map(({ BatchNum, QtyBatch }) => {
                return {
                    BaseLineNumber: LineNum,
                    BatchNumber: BatchNum,
                    Quantity: QtyBatch,
                    ItemCode
                }
            }),
        }
        documentLines.push(data)
        idx++
    }

    bodyReturns.DocumentLines = documentLines
    return bodyReturns
}
module.exports = { buildBodyReturn }