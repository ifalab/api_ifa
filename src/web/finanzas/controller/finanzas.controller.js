const { parteDiario, abastecimiento, abastecimientoMesActual, abastecimientoMesAnterior, findAllRegions, findAllLines, findAllSubLines, findAllGroupAlmacenes, abastecimientoPorFecha } = require("./hana.controller")

const parteDiaroController = async (req, res) => {
  try {
    const { fecha } = req.body;
    if (!fecha) {
      return res.status(400).json({ mensaje: 'Debe proporcionar una fecha' });
    }

    const fechaFiltro = new Date(fecha).toISOString().split('T')[0];
    const result = await parteDiario();

    const resultadosFiltrados = result.filter(item => {
      const fechaItem = new Date(item.Fecha).toISOString().split('T')[0];
      return fechaItem === fechaFiltro;
    });

    const agrupadoPorSeccion = resultadosFiltrados.reduce((acc, item) => {
      const seccion = item.Seccion;

      if (!acc[seccion]) {
        acc[seccion] = {
          totalIngreso: 0,
          totalEgreso: 0,
          descripcion: [],
        };
      }

      acc[seccion].totalIngreso += parseFloat(item.Ingreso);
      acc[seccion].totalEgreso += parseFloat(item.Egreso);

      if (seccion == '3. GASTO') {
        acc[seccion].descripcion.push({
          Cuenta: item.Cuenta,
          Fecha: item.Fecha,
          "Proveedor/Cliente": item['Proveedor/Cliente'],
          Ingreso: item.Ingreso,
          Egreso: item.Egreso,
          Contracuenta: item.Contracuenta,
          "Nombre de Cuenta": item['Nombre de Cuenta'],
          Origen: item.Origen,
          Descripción: item.Descripción,
          Seccion: item.Seccion,
        });
      }

      return acc;
    }, {});

    // Ordenar las secciones numéricamente o alfabéticamente
    const seccionesOrdenadas = Object.keys(agrupadoPorSeccion)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .reduce((obj, key) => {
        obj[key] = agrupadoPorSeccion[key];
        return obj;
      }, {});

    // Calcular totales generales
    let totalGeneralIngreso = 0;
    let totalGeneralEgreso = 0;

    for (const seccion in seccionesOrdenadas) {
      totalGeneralIngreso += seccionesOrdenadas[seccion].totalIngreso;
      totalGeneralEgreso += seccionesOrdenadas[seccion].totalEgreso;
    }

    const resultadoFinal = {
      agrupadoPorSeccion: seccionesOrdenadas,
      totalGeneralIngreso,
      totalGeneralEgreso,
    };

    return res.status(200).json(resultadoFinal);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'error en el controlador parteDiarioController',
      error,
    });
  }
};


const parteDiaroMesActualController = async (req, res) => {
  try {
    const result = await parteDiario();

    // Obtener el mes y año actuales
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth(); // 0 = Enero, 1 = Febrero, etc.
    const anioActual = fechaActual.getFullYear();

    // Filtrar los resultados por el mes y año actuales
    const resultadosFiltrados = result.filter(item => {
      const fechaItem = new Date(item.Fecha);
      const mesItem = fechaItem.getMonth();
      const anioItem = fechaItem.getFullYear();
      return mesItem === mesActual && anioItem === anioActual;
    });

    // Agrupar por sección y crear la lista de descripciones
    const agrupadoPorSeccion = resultadosFiltrados.reduce((acc, item) => {
      const seccion = item.Seccion;

      if (!acc[seccion]) {
        acc[seccion] = {
          totalIngreso: 0,
          totalEgreso: 0,
          descripcion: [],
        };
      }

      acc[seccion].totalIngreso += parseFloat(item.Ingreso);
      acc[seccion].totalEgreso += parseFloat(item.Egreso);

      if (seccion == '3. GASTO') {
        acc[seccion].descripcion.push({
          Cuenta: item.Cuenta,
          Fecha: item.Fecha,
          "Proveedor/Cliente": item['Proveedor/Cliente'],
          Ingreso: item.Ingreso,
          Egreso: item.Egreso,
          Contracuenta: item.Contracuenta,
          "Nombre de Cuenta": item['Nombre de Cuenta'],
          Origen: item.Origen,
          Descripción: item.Descripción,
          Seccion: item.Seccion,
        });
      }


      return acc;
    }, {});

    // Ordenar las secciones numéricamente o alfabéticamente
    const seccionesOrdenadas = Object.keys(agrupadoPorSeccion)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .reduce((obj, key) => {
        obj[key] = agrupadoPorSeccion[key];
        return obj;
      }, {});

    let totalGeneralIngreso = 0;
    let totalGeneralEgreso = 0;

    for (const seccion in seccionesOrdenadas) {
      totalGeneralIngreso += seccionesOrdenadas[seccion].totalIngreso;
      totalGeneralEgreso += seccionesOrdenadas[seccion].totalEgreso;
    }

    const resultadoFinal = {
      agrupadoPorSeccion: seccionesOrdenadas,
      totalGeneralIngreso,
      totalGeneralEgreso,
    };

    return res.status(200).json(resultadoFinal);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'error en el controlador parteDiarioController',
      error,
    });
  }
};

const abastecimientoController = async (req, res) => {
  try {
    const { fecha } = req.body
    const result = await abastecimiento(fecha)
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    result.map((item) => {
      const newData = {
        Tipo: item.Tipo,
        CostoComercial: item["Costo Comercial"],
        CostoComercialDolares: item["SUM(ROUND(COSTO COMERCIAL TOTAL/6.96,2))"]
      }
      data.push(newData)
    })

    data.map((item) => {
      totalBs += +item.CostoComercial
      totalDolares += +item.CostoComercialDolares
    })

    if (totalBs > 0) {
      data.map((item) => {
        let porcentaje = 0
        if (item.CostoComercial != 0) {
          porcentaje = item.CostoComercial / totalBs
        }
        const newData = {
          ...item,
          porcentaje
        }
        response.push(newData)
      })
    }
    return res.status(200).json({ response, totalBs, totalDolares, totalPorcentaje })
  } catch (error) {
    console.log('error en abastecimiento controller')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el controlador',
      error
    })
  }
}

const abastecimientoMesActualController = async (req, res) => {
  try {

    const result = await abastecimientoMesActual()
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    result.map((item) => {
      const newData = {
        Tipo: item.Tipo,
        CostoComercial: item["Costo Comercial"],
        CostoComercialDolares: item["SUM(ROUND(COSTO COMERCIAL TOTAL/6.96,2))"]
      }
      data.push(newData)
    })

    data.map((item) => {
      totalBs += +item.CostoComercial
      totalDolares += +item.CostoComercialDolares
    })

    if (totalBs > 0) {
      data.map((item) => {
        let porcentaje = 0
        if (item.CostoComercial != 0) {
          porcentaje = item.CostoComercial / totalBs
        }
        const newData = {
          ...item,
          porcentaje
        }
        response.push(newData)
      })
    }
    return res.status(200).json({ response, totalBs, totalDolares, totalPorcentaje })
  } catch (error) {
    console.log('error en abastecimiento controller')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el controlador',
      error
    })
  }
}

const abastecimientoMesAnteriorController = async (req, res) => {
  try {
    const result = await abastecimientoMesAnterior()
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    result.map((item) => {
      const newData = {
        Tipo: item.Tipo,
        CostoComercial: item["Costo Comercial"],
        CostoComercialDolares: item["SUM(ROUND(COSTO COMERCIAL TOTAL/6.96,2))"]
      }
      data.push(newData)
    })

    data.map((item) => {
      totalBs += +item.CostoComercial
      totalDolares += +item.CostoComercialDolares
    })

    if (totalBs > 0) {
      data.map((item) => {
        let porcentaje = 0
        if (item.CostoComercial != 0) {
          porcentaje = item.CostoComercial / totalBs
        }
        const newData = {
          ...item,
          porcentaje
        }
        response.push(newData)
      })
    }
    return res.status(200).json({ response, totalBs, totalDolares, totalPorcentaje })
  } catch (error) {
    console.log('error en abastecimientoMesAnteriorController')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el abastecimientoMesAnteriorController',
      error
    })
  }
}

const abastecimientoPorFechaController = async (req, res) => {
  try {

    const sapResponse = await abastecimientoPorFecha();
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ]
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    sapResponse.map((item) => {
      const newData = {
        year: item.year,
        month: item.month,
        monthName: `${meses[item.month - 1]}`,
        Tipo: item.Tipo,
        CostoComercial: item["Costo Comercial"],
        CostoComercialDolares: item["SUM(ROUND(COSTO COMERCIAL TOTAL/6.96,2))"]
      }
      data.push(newData)
    })
    data.map((item) => {
      totalBs += +item.CostoComercial
      totalDolares += +item.CostoComercialDolares
    })

    if (totalBs > 0) {
      data.map((item) => {
        let porcentaje = 0
        if (item.CostoComercial != 0) {
          porcentaje = item.CostoComercial / totalBs
        }
        const newData = {
          ...item,
          porcentaje
        }
        response.push(newData)
      })
    }

    const agrupadoPorMes = response.reduce((acc, item) => {
      const { year, month, monthName, Tipo, CostoComercial, CostoComercialDolares, porcentaje } = item;

      let mesExistente = acc.find(mes => mes.year === year && mes.month === month);

      if (!mesExistente) {
        mesExistente = {
          year,
          month,
          monthName,
          Tipo: []
        };
        acc.push(mesExistente);
      }

      mesExistente.Tipo.push({
        name: Tipo,
        CostoComercial,
        CostoComercialDolares,
        porcentaje
      });

      return acc;
    }, []);

    const ordenarTiposYCalcularVariacion = (agrupadoPorMes) => {
      // Ordenar los tipos en cada mes alfabéticamente por el atributo 'name'
      agrupadoPorMes.forEach(mes => {
        mes.Tipo.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Calcular variación después de ordenar los tipos
      agrupadoPorMes.forEach((mesActual, index) => {
        // No calcular variación para el primer mes, pues no tiene mes anterior
        if (index === 0) {
          mesActual.Tipo.forEach(tipo => tipo.variacion = 0);
          return;
        }

        // Obtener el mes anterior, que también tiene los tipos ordenados
        const mesAnterior = agrupadoPorMes[index - 1];

        // Calcular variación directamente para cada tipo (mismo orden)
        mesActual.Tipo.forEach((tipoActual, idx) => {
          const tipoAnterior = mesAnterior.Tipo[idx];

          
          if (tipoAnterior && tipoAnterior.name === tipoActual.name) {
            const variacion = (parseFloat(tipoActual.CostoComercial) / parseFloat(tipoAnterior.CostoComercial)) - 1;
            tipoActual.variacion = variacion;
          } else {
            
            tipoActual.variacion = 0;
          }
        });
      });

      return agrupadoPorMes;
    };
    
    const result = ordenarTiposYCalcularVariacion(agrupadoPorMes);
    return res.status(200).json({ result });

  } catch (error) {
    console.log('error en abastecimientoPorFechaController')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el abastecimientoPorFechaController',
      error
    })
  }
}
const findAllRegionsController = async (req, res) => {
  try {
    const regiones = await findAllRegions()
    return res.json({ regiones })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllRegionsController ' })
  }
}

const findAllLineController = async (req, res) => {
  try {
    const lines = await findAllLines()
    return res.json({ lines })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllRegionsController ' })
  }
}

const findAllSublineController = async (req, res) => {
  try {
    const sublines = await findAllSubLines()
    return res.json({ sublines })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllRegionsController ' })
  }
}

const findAllGroupAlmacenController = async (req, res) => {
  try {
    const groupAlmacen = await findAllGroupAlmacenes()
    return res.json({ groupAlmacen })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllGroupAlmacenController ' })
  }
}
module.exports = {
  parteDiaroController,
  abastecimientoController,
  abastecimientoMesActualController,
  parteDiaroMesActualController,
  abastecimientoMesAnteriorController,
  findAllRegionsController,
  findAllLineController,
  findAllSublineController,
  findAllGroupAlmacenController,
  abastecimientoPorFechaController,
}