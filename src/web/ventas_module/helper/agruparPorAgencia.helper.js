const agruparPorAgencia=(data)=> {
    const grupos = data.reduce((acumulador, item) => {
        const { Agencia, ...detalle } = item;
        if (!acumulador[Agencia]) {
            acumulador[Agencia] = {
                Agencia: Agencia,
                Total:0,
                detalle: []
            };
        }
        acumulador[Agencia].detalle.push(detalle);
        acumulador[Agencia].Total += item.total; 
        return acumulador;
    }, {}); 
    return Object.values(grupos);
}
module.exports = {
    agruparPorAgencia
}