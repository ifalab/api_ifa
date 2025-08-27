const agruparDetallePorAgencia =(data)=>{
    return data.map(estadoObjeto => {
        const detalleAgrupado = estadoObjeto.detalle.reduce((acumulador, detalleItem) => {
            const { Agencia, ...subdetalle } = detalleItem;

            if (!acumulador[Agencia]) {
                acumulador[Agencia] = {
                    Agencia: Agencia,
                    Total: 0,
                    
                    subdetalle: [] 
                };
            }

            acumulador[Agencia].Total += subdetalle.total;
            acumulador[Agencia].subdetalle.push(subdetalle);
            
            return acumulador;
        }, {});
        return {
            ...estadoObjeto, 
            detalle: Object.values(detalleAgrupado)
        };
    });
}
module.exports = {
    agruparDetallePorAgencia
}