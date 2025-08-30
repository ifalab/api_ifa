const agruparPorEstado = (data) => {
    const grupos = data.reduce((acumulador, item) => {
        const { Estado, ...detalle } = item;
        if (!acumulador[Estado]) {
            acumulador[Estado] = {
                Estado: Estado,
                Total: 0,
                detalle: []
            };
        }
        acumulador[Estado].Total += item.total;
        acumulador[Estado].detalle.push(detalle);
        return acumulador;
    }, {}); 
    return Object.values(grupos);
}
module.exports = {
    agruparPorEstado
}