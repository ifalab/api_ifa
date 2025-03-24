const validateDataExcel = (jsonData,listErrors,idx) => {
    for (const element of jsonData) {
        const { ItemCode, ItemName } = element
        if (!ItemCode) {
            listErrors.push({
                error: `El ItemCode en la posicion ${idx} no esta definido`
            })
        }

        if (!ItemName) {
            listErrors.push({
                error: `El ItemName en la posicion ${idx} no esta definido`
            })
        }
    }
    return listErrors
}

module.exports = { validateDataExcel }