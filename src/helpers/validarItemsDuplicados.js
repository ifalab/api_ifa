const validarItemCodesDuplicados = async (listaDeItems) => {
    console.log({listaDeItems})
    const itemCodesVistos = new Set()
    const itemCodesDuplicados = new Set()
    const detalleDuplicados = []
    for (const element of listaDeItems) {
        const itemCode = element.ItemCode
        if (itemCodesVistos.has(itemCode)) {
            if (!itemCodesDuplicados.has(itemCode)) {
                itemCodesDuplicados.add(itemCode)
                detalleDuplicados.push({
                    mensaje: `El articulo ${itemCode} esta duplicado`
                })
            }
        } else {
            itemCodesVistos.add(itemCode)
        }
    }

    return detalleDuplicados
}

module.exports = { validarItemCodesDuplicados }