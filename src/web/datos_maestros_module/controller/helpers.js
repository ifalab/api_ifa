const validateDataExcel = (data,listErrors,idx) => {

    const { ItemCode, ItemName, Precio, ListName, PriceList } = data
    if (!ItemCode) {
        listErrors.push({
            PriceList,
            ListName,
            ItemCode,
            ItemName,
            Precio,
            error: `El ItemCode en la posicion ${idx} no esta definido`
        })
    }

    if (!ItemName) {
        listErrors.push({
            PriceList,
            ListName,
            ItemCode,
            ItemName,
            Precio,
            error: `El ItemName en la posicion ${idx} no esta definido`
        })
    }

    if (Precio == null || Precio === "") {
        listErrors.push({
            PriceList,
            ListName,
            ItemCode,
            ItemName,
            Precio,
            error: `El Precio en la posición ${idx} no está definido`
        });
    } else if (Precio === 0) {
        listErrors.push({
            PriceList,
            ListName,
            ItemCode,
            ItemName,
            Precio,
            error: `El Precio en la posición ${idx} tiene un valor de 0.`
        });
    }
    

    if (!ListName) {
        listErrors.push({
            PriceList,
            ListName,
            ItemCode,
            ItemName,
            Precio,
            error: `El ListName en la posicion ${idx} no esta definido`
        })
    }

    return listErrors
}

module.exports = { validateDataExcel }