const { agruparPorDivisionYSucursal } = require("../utils/groupByDivisionSucursal");
const { groupMarginByMonth } = require("../utils/groupMarginByMonth");
const { parteDiario, abastecimiento, abastecimientoMesActual, abastecimientoMesAnterior, findAllRegions, findAllLines, findAllSubLines, findAllGroupAlmacenes, abastecimientoPorFecha, abastecimientoPorFechaAnual, abastecimientoPorFecha_24_meses, reporteArticuloPendientes, reporteMargenComercial, CommercialMarginByProducts, getMonthlyCommercialMargin, getReportBankMajor, getCommercialBankAccounts, abastecimientoPorMes, getGastosSAPHana, getGastosAgenciaxGestionSAPHana } = require("./hana.controller")
const { todosGastos, gastosXAgencia, gastosGestionAgencia, getAgencias } = require('./sql_finanza_controller')
const ExcelJS = require('exceljs');


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

    // const result = await abastecimientoMesActual()
    const dateNow = new Date()
    const result = await abastecimientoPorMes(dateNow.getMonth() + 1, dateNow.getFullYear())
    // return res.status(200).json({ result })
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    result.map((item) => {
      const newData = {
        Tipo: item.Tipo,
        CostoComercial: item.CostoComercial,
        CostoComercialDolares: item.CostoComercialUSD
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
    const dateNow = new Date()
    const result = await abastecimientoPorMes(dateNow.getMonth(), dateNow.getFullYear())
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    result.map((item) => {
      const newData = {
        Tipo: item.Tipo,
        CostoComercial: item.CostoComercial,
        CostoComercialDolares: item.CostoComercialUSD
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

const abastecimientoFechaAnualController = async (req, res) => {
  try {
    const sapResponse = await abastecimientoPorFechaAnual();
    // return res.json({sapResponse})
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

    // return res.json({agrupadoPorMes})
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

const abastecimientoFecha24MesesController = async (req, res) => {
  try {
    const sapResponse = await abastecimientoPorFecha_24_meses();
    // return res.json({sapResponse})
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

const findAllGastosController = async (req, res) => {
  try {
    const gastos = await todosGastos()
    const datosProcesados = procesarGastos(gastos);
    const data = calcularPorcentajes(datosProcesados);

    const totalByYearArray = Object.entries(data.totalByYear).map(([year, total]) => ({
      year,
      total,
    }));

    let processData = [];
    data.datosConPorcentajes.map((item) => {
      const { desc_grupo, montos, porcentajes, ...rest } = item;
      const montosArray = Object.entries(montos).map(([year, monto]) => ({
        year,
        monto,
      }));

      const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({
        year,
        porcentaje,
      }));

      const newData = {
        desc_grupo: desc_grupo.trim(),
        montos: montosArray,
        porcentajes: porcentajesArray,
        ...rest,
      };
      processData.push(newData);
    });

    const { datosConPorcentajes, ...restData } = data;

    return res.json({ ...restData, totalByYear: totalByYearArray, processData });
    // return res.json({mensaje:'modificar codigo'})
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllGroupAlmacenController ' })
  }
}

const findAllSimpleGastosController = async (req, res) => {
  try {
    const gastos = await todosGastos()
    const datosProcesados = procesarGastos(gastos);
    const data = calcularPorcentajes(datosProcesados);

    const totalByYearArray = Object.entries(data.totalByYear).map(([year, total]) => ({
      date: year,
      monto: total,
    }));

    let processData = [];
    data.datosConPorcentajes.map((item) => {
      const { desc_grupo, montos, porcentajes, ...rest } = item;
      const montosArray = Object.entries(montos).map(([year, monto]) => ({
        year,
        monto,
      }));

      const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({
        year,
        porcentaje,
      }));

      const newData = {
        desc_grupo: desc_grupo.trim(),
        montos: montosArray,
        porcentajes: porcentajesArray,
        ...rest,
      };
      processData.push(newData);
    });

    const { datosConPorcentajes, ...restData } = data;
    const montos = processData[0].montos
    const year = []
    montos.map((item) => {
      year.push(item.year)
    })

    const formatDataByYear = (processData) => {
      // Inicializamos un objeto para almacenar los datos agrupados por año
      const groupedData = processData.reduce((acc, item) => {
        const { desc_grupo, montos, porcentajes, total } = item;

        // Iteramos sobre los años en montos
        montos.forEach((montoItem) => {
          const date = montoItem.year;
          const monto = montoItem.monto;

          // Buscamos el porcentaje correspondiente para este año
          const porcentajeObj = porcentajes.find((p) => p.year === date);
          const porcentaje = porcentajeObj ? porcentajeObj.porcentaje : null;

          // Creamos un objeto de detalle
          const detalle = {
            desc_grupo,
            monto,
            porcentaje,
          };

          // Si el año no existe en el acumulador, lo inicializamos
          if (!acc[date]) {
            acc[date] = { date, detalle: [] };
          }

          // Agregamos el detalle al año correspondiente
          acc[date].detalle.push(detalle);
        });

        return acc;
      }, {});

      // Convertimos el objeto agrupado en un array
      return Object.values(groupedData);
    };

    const formattedData = formatDataByYear(processData);
    // formattedData.map((item))
    let totalizado = []
    processData.map((item) => {
      totalizado.push({
        desc_grupo: item.desc_grupo,
        monto: item.total
      })
    })

    formattedData.push({ date: 'Total', detalle: totalizado })
    return res.json({ totalByYear: totalByYearArray, formattedData });
    // return res.json({ totalByYear:12 });
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllGroupAlmacenController ' })
  }
}

// const findXAgenciaSimpleGastosController = async (req, res) => {
//   try {
//     const codigo = req.query.codigo;
//     console.log(codigo)

//     const gastos = await gastosXAgencia(codigo)
//     const gastosSap = await getGastosSAPHana(codigo)
//     const datosProcesados = procesarGastos(gastos);
//     // console.log({ datosProcesados, gastosSap })
//     const data = calcularPorcentajes(datosProcesados);
//     // return res.json({data})
//     const totalByYearArray = Object.entries(data.totalByYear).map(([year, total]) => ({
//       date: year,
//       monto: total,
//     }));

//     let processData = [];
//     data.datosConPorcentajes.map((item) => {
//       const { desc_grupo, montos, porcentajes, ...rest } = item;
//       const montosArray = Object.entries(montos).map(([year, monto]) => ({
//         year,
//         monto,
//       }));

//       const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({
//         year,
//         porcentaje,
//       }));

//       const newData = {
//         desc_grupo: desc_grupo.trim(),
//         montos: montosArray,
//         porcentajes: porcentajesArray,
//         ...rest,
//       };
//       processData.push(newData);
//     });
//     // return res.json({ data })
//     const { datosConPorcentajes, ...restData } = data;
//     const montos = processData[0].montos
//     const year = []
//     montos.map((item) => {
//       year.push(item.year)
//     })

//     const formatDataByYear = (processData) => {
//       // Inicializamos un objeto para almacenar los datos agrupados por año
//       const groupedData = processData.reduce((acc, item) => {
//         const { desc_grupo, montos, porcentajes, total } = item;

//         // Iteramos sobre los años en montos
//         montos.forEach((montoItem) => {
//           const date = montoItem.year;
//           const monto = montoItem.monto;

//           // Buscamos el porcentaje correspondiente para este año
//           const porcentajeObj = porcentajes.find((p) => p.year === date);
//           const porcentaje = porcentajeObj ? porcentajeObj.porcentaje : null;

//           // Creamos un objeto de detalle
//           const detalle = {
//             desc_grupo,
//             monto,
//             porcentaje,
//           };

//           // Si el año no existe en el acumulador, lo inicializamos
//           if (!acc[date]) {
//             acc[date] = { date, detalle: [] };
//           }

//           // Agregamos el detalle al año correspondiente
//           acc[date].detalle.push(detalle);
//         });

//         return acc;
//       }, {});

//       // Convertimos el objeto agrupado en un array
//       return Object.values(groupedData);
//     };

//     // return res.json({ formatDataByYear })

//     const formattedData = formatDataByYear(processData);
//     // formattedData.map((item))
//     // let totalizado = []
//     // processData.map((item) => {
//     //   totalizado.push({
//     //     desc_grupo: item.desc_grupo,
//     //     monto: item.total
//     //   })
//     // })

//     // formattedData.push({ date: 'Total', detalle: totalizado })

//     // Agregamos los datos de SAP dentro del detalle de cada año
//     formattedData.forEach((item) => {
//     if (item.date === 'Total') return;

//       const sapData = gastosSap.find((g) => String(g.Año) === item.date);
//       const totalGastos = totalByYearArray.find((g) => g.date === item.date)?.monto ?? 0;
//       const utilidadBruta = sapData ? Number(sapData.UtilidadBruta) : 0;

//       if (sapData) {
//         item.detalle.push(
//           {
//             desc_grupo: 'TOTAL GASTOS',
//             monto: totalGastos,
//             porcentaje: null,
//           },
//           {
//             desc_grupo: 'VENTAS NETAS',
//             monto: Number(sapData.TotalVentasNetas),
//             porcentaje: null,
//           },
//           {
//             desc_grupo: 'COSTO COMERCIAL',
//             monto: Number(sapData.CostoComercialTotal),
//             porcentaje: null,
//           },
//           {
//             desc_grupo: 'UTILIDAD BRUTA',
//             monto: utilidadBruta,
//             porcentaje: null,
//           },
//           {
//             desc_grupo: '% MARGEN',
//             monto: Number(sapData.MargenPorcentual),
//             porcentaje: null,
//           },
//         );
//       }
//     });

//     // === Agregamos el objeto "Total" con la suma de todos los desc_grupo ===
//     const totalPorGrupo = {};

//     formattedData.forEach(({ detalle }) => {
//       detalle.forEach(({ desc_grupo, monto }) => {
//         if (!totalPorGrupo[desc_grupo]) {
//           totalPorGrupo[desc_grupo] = 0;
//         }
//         totalPorGrupo[desc_grupo] += monto;
//       });
//     });

//     const detalleTotal = Object.entries(totalPorGrupo).map(([desc_grupo, monto]) => ({
//       desc_grupo,
//       monto,
//       porcentaje: null,
//     }));

//     // Añadimos la fila final con date: 'Total'
//     formattedData.push({
//       date: 'Total',
//       detalle: detalleTotal,
//     });

//     const resultadoDiferenciaByYearArray = totalByYearArray.map(({ date, monto: totalGastos }) => {
//       const sapData = gastosSap.find((g) => String(g.Año) === date);
//       const utilidadBruta = sapData ? Number(sapData.UtilidadBruta) : 0;
//       const diferencia = utilidadBruta - totalGastos;

//       return {
//         date,
//         monto: diferencia,
//       };
//     });


//     console.log(formattedData, resultadoDiferenciaByYearArray)
//     return res.json({ formattedData });
//   } catch (error) {
//     console.log({ error })
//     return res.status(500).json({ mensaje: 'Error en findXAgenciaSimpleGastosController ' })
//   }
// }

// const findXAgenciaSimpleGastosController = async (req, res) => {
//   try {
//     const codigo = req.query.codigo;
//     console.log(codigo);

//     const gastos = await gastosXAgencia(codigo);
//     //console.log('Gastos: ', gastos)
//     const gastosSap = await getGastosSAPHana(codigo);
//     //console.log('Gastos sap: ', gastosSap);

//     const datosProcesados = procesarGastos(gastos);
//     const data = calcularPorcentajes(datosProcesados);
    
//     const totalByYearArray = Object.entries(data.totalByYear).map(([year, total]) => ({
//       date: year,
//       monto: total,
//     }));

//     const processData = data.datosConPorcentajes.map((item) => {
//       const { desc_grupo, montos, porcentajes, ...rest } = item;

//       const montosArray = Object.entries(montos).map(([year, monto]) => ({
//         year,
//         monto,
//       }));

//       const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({
//         year,
//         porcentaje,
//       }));

//       return {
//         desc_grupo: desc_grupo.trim(),
//         montos: montosArray,
//         porcentajes: porcentajesArray,
//         ...rest,
//       };
//     });

//     const formatDataByYear = (processData) => {
//       const groupedData = processData.reduce((acc, item) => {
//         const { desc_grupo, montos, porcentajes } = item;

//         montos.forEach((montoItem) => {
//           const date = montoItem.year;
//           const monto = montoItem.monto;

//           const porcentajeObj = porcentajes.find((p) => p.year === date);
//           const porcentaje = porcentajeObj ? porcentajeObj.porcentaje : null;

//           const detalle = {
//             desc_grupo,
//             monto,
//             porcentaje,
//           };

//           if (!acc[date]) {
//             acc[date] = { date, detalle: [] };
//           }

//           acc[date].detalle.push(detalle);
//         });

//         return acc;
//       }, {});

//       return Object.values(groupedData);
//     };

//     const formattedData = formatDataByYear(processData);

//     // Agregamos SAP a cada año
//     formattedData.forEach((item) => {
//       if (item.date === 'Total') return;

//       const sapData = gastosSap.find((g) => String(g.Año) === item.date);
//       const totalGastos = totalByYearArray.find((g) => g.date === item.date)?.monto ?? 0;
//       const utilidadBruta = sapData ? Number(sapData.UtilidadBruta) : 0;

//       if (sapData) {
//         item.detalle.push(
//           {
//             desc_grupo: 'TOTAL GASTOS',
//             monto: totalGastos,
//             porcentaje: null,
//           },
//           {
//             desc_grupo: 'VENTAS NETAS',
//             monto: Number(sapData.TotalVentasNetas),
//             porcentaje: null,
//           },
//           {
//             desc_grupo: 'COSTO COMERCIAL',
//             monto: Number(sapData.CostoComercialTotal),
//             porcentaje: null,
//           },
//           {
//             desc_grupo: 'UTILIDAD BRUTA',
//             monto: utilidadBruta,
//             porcentaje: Number(sapData.MargenPorcentual),
//           },
//           // {
//           //   desc_grupo: '% MARGEN',
//           //   monto: Number(sapData.MargenPorcentual),
//           //   porcentaje: null,
//           // }
//         );
//       }
//     });

//     // Agregamos el objeto "Total" con la suma de todos los desc_grupo
//     const totalPorGrupo = {};
//     formattedData.forEach(({ detalle }) => {
//       detalle.forEach(({ desc_grupo, monto }) => {
//         if (!totalPorGrupo[desc_grupo]) {
//           totalPorGrupo[desc_grupo] = 0;
//         }
//         totalPorGrupo[desc_grupo] += monto;
//       });
//     });

//     const detalleTotal = Object.entries(totalPorGrupo).map(([desc_grupo, monto]) => ({
//       desc_grupo,
//       monto,
//       porcentaje: null,
//     }));

//     formattedData.push({
//       date: 'Total',
//       detalle: detalleTotal,
//     });

//     const resultadoDiferenciaByYearArray = totalByYearArray.map(({ date, monto: totalGastos }) => {
//       const sapData = gastosSap.find((g) => String(g.Año) === date);
//       const utilidadBruta = sapData ? Number(sapData.UtilidadBruta) : 0;
//       const diferencia = utilidadBruta - totalGastos;

//       return {
//         date,
//         monto: diferencia,
//       };
//     });

//     // Orden personalizado de los desc_grupo
//     const ordenPersonalizado = [
//       'VENTAS NETAS',
//       'COSTO COMERCIAL',
//       'UTILIDAD BRUTA',
//       // '% MARGEN',
//       'DEVOLUCIONES',
//       'GASTOS ADMINISTRATIVOS',
//       'GASTOS COMERCIALES',
//       'PARTIDAS QUE NO MUEVEN EFECTIVO',
//       'RECURSOS HUMANOS',
//       'TOTAL GASTOS',
//     ];

//     // Ordenamos los detalles de cada año según el orden personalizado
//     formattedData.forEach((item) => {
//       item.detalle.sort((a, b) => {
//         const indexA = ordenPersonalizado.indexOf(a.desc_grupo);
//         const indexB = ordenPersonalizado.indexOf(b.desc_grupo);
//         return indexA - indexB;
//       });
//     });

//     console.log(formattedData, resultadoDiferenciaByYearArray);
//     return res.json({ formattedData });
//   } catch (error) {
//     console.log({ error });
//     return res.status(500).json({ mensaje: 'Error en findXAgenciaSimpleGastosController ' });
//   }
// };
const findXAgenciaSimpleGastosController = async (req, res) => {
    try {
        const codigo = req.query.codigo;
        console.log(codigo);

        // 1. Obtener todos los gastos de tu fuente interna (Genesis)
        const rawInternalGastos = await gastosXAgencia(codigo);
        // Normalización de los nombres de grupo (se mantiene igual, es el primer paso)
        const allInternalGastos = rawInternalGastos.map(gasto => {
            let desc_grupo_normalizado = gasto.desc_grupo.trim();
            if (desc_grupo_normalizado === 'COSTOS') {
                desc_grupo_normalizado = 'COSTO COMERCIAL';
            } else if (desc_grupo_normalizado === 'VENTAS') {
                desc_grupo_normalizado = 'VENTAS NETAS';
            }
            return { ...gasto, desc_grupo: desc_grupo_normalizado };
        });

        // 2. Obtener los gastos de SAP
        const allSapGastos = await getGastosSAPHana(codigo);
        console.log('Gastos SAP: ', allSapGastos);
        
        const TRANSITION_YEAR = 2024;
        const consolidatedFinancialsByYear = {};

        // 1. Inicializar con datos de SAP (para tener todos los años presentes y sus ceros si no hay datos)
        allSapGastos.forEach(sapItem => {
            const year = sapItem.Año;
            consolidatedFinancialsByYear[year] = {
                year: year,
                ventasNetas: Number(sapItem.TotalVentasNetas || 0),
                costoComercial: Number(sapItem.CostoComercialTotal || 0),
                utilidadBruta: 0,
                margenPorcentual: null
            };
        });
        // 2. Aplicar/Sumar datos de Genesis
        allInternalGastos.forEach(gasto => {
            const year = gasto.Gestion;
            // Solo consideramos los gastos de Genesis que son Ventas Netas o Costo Comercial
            if (gasto.desc_grupo === 'VENTAS NETAS' || gasto.desc_grupo === 'COSTO COMERCIAL') {
                // Asegurarse de que el año exista en consolidatedFinancialsByYear
                if (!consolidatedFinancialsByYear[year]) {
                    consolidatedFinancialsByYear[year] = {
                        year: year,
                        ventasNetas: 0,
                        costoComercial: 0,
                        utilidadBruta: 0,
                        margenPorcentual: null
                    };
                }
                if (year === TRANSITION_YEAR) {
                    // Para el año de transición (2024), SUMAR ambos.
                    if (gasto.desc_grupo === 'VENTAS NETAS') {
                        consolidatedFinancialsByYear[year].ventasNetas += gasto.monto;
                    } else if (gasto.desc_grupo === 'COSTO COMERCIAL') {
                        consolidatedFinancialsByYear[year].costoComercial += gasto.monto;
                    }
                } else if (year < TRANSITION_YEAR) {
                    // Para años ANTERIORES a la transición (ej. 2018, 2022),
                    // usar EXCLUSIVAMENTE los datos de Genesis (sobrescribe lo de SAP si lo había)
                    if (gasto.desc_grupo === 'VENTAS NETAS') {
                        consolidatedFinancialsByYear[year].ventasNetas += gasto.monto;
                    } else if (gasto.desc_grupo === 'COSTO COMERCIAL') {
                        consolidatedFinancialsByYear[year].costoComercial += gasto.monto;
                    }
                }
                // Para años > TRANSITION_YEAR (como 2025), no se hace nada con los datos de Genesis aquí.
                // Se mantienen los valores inicializados desde SAP.
            }
        });
        // 3. Calcular Utilidad Bruta y Margen Porcentual para cada año consolidado
        Object.values(consolidatedFinancialsByYear).forEach(item => {
            item.utilidadBruta = item.ventasNetas - item.costoComercial;
            if (item.ventasNetas !== 0) {
                item.margenPorcentual = (item.utilidadBruta / item.ventasNetas) * 100;
            } else {
                item.margenPorcentual = null;
            }
        });

        // Convertir el objeto a un array si necesitas iterar sobre él en orden
        const finalConsolidatedFinancials = Object.values(consolidatedFinancialsByYear).sort((a, b) => a.year - b.year);
        console.log('Datos financieros consolidados por año (después de ajustar 2025):', JSON.stringify(finalConsolidatedFinancials, null, 2));
        const genesisGastosForProcessing = allInternalGastos.filter(gasto => {
            const descGrupoTrimmed = gasto.desc_grupo.trim();
            // Solo incluimos en esta lista los gastos que NO son Ventas Netas ni Costo Comercial
            return descGrupoTrimmed !== 'VENTAS NETAS' && descGrupoTrimmed !== 'COSTO COMERCIAL';
        });
        const datosProcesados = procesarGastos(genesisGastosForProcessing);
        const data = calcularPorcentajes(datosProcesados);
        const totalGastosInternosByYear = Object.entries(data.totalByYear).map(([year, total]) => ({
            date: year,
            monto: total,
        }));
        const processData = data.datosConPorcentajes.map((item) => {
            const { desc_grupo, montos, porcentajes, ...rest } = item;
            const montosArray = Object.entries(montos).map(([year, monto]) => ({ year, monto }));
            const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({ year, porcentaje }));
            return {
                desc_grupo: desc_grupo.trim(),
                montos: montosArray,
                porcentajes: porcentajesArray,
                ...rest,
            };
        });
        // --- 3. Identificar todos los años únicos de ambas fuentes (incluyendo los de la consolidación) ---
        const yearsFromInternalGastos = new Set(genesisGastosForProcessing.map(g => g.Gestion)); // Aquí también se usan los gastos ya filtrados
        const yearsFromConsolidated = new Set(finalConsolidatedFinancials.map(f => f.year));
        const allYears = Array.from(new Set([...yearsFromInternalGastos, ...yearsFromConsolidated]))
                              .sort((a, b) => a - b);
        // --- 4. Crear una estructura base para cada año único ---
        let combinedFormattedData = allYears.map(year => ({
            date: String(year),
            detalle: []
        }));
        // --- 5. Rellenar los detalles de cada año ---
        processData.forEach(item => {
            item.montos.forEach(montoItem => {
                const yearIndex = combinedFormattedData.findIndex(d => d.date === montoItem.year);
                if (yearIndex !== -1) {
                    const porcentajeObj = item.porcentajes.find(p => p.year === montoItem.year);
                    combinedFormattedData[yearIndex].detalle.push({
                        desc_grupo: item.desc_grupo,
                        monto: montoItem.monto,
                        porcentaje: porcentajeObj ? porcentajeObj.porcentaje : null
                    });
                }
            });
        });
        // Segundo, añadir las métricas financieras consolidadas y el TOTAL GASTOS
        // Estas son las ÚNICAS entradas para VENTAS NETAS, COSTO COMERCIAL y UTILIDAD BRUTA.
        combinedFormattedData.forEach((item) => {
            const year = Number(item.date);
            const consolidatedData = finalConsolidatedFinancials.find((c) => c.year === year);

            // Obtener el total de gastos internos para este año
            const totalGastosParaEsteAno = totalGastosInternosByYear.find(g => Number(g.date) === year)?.monto ?? 0;

            item.detalle.push(
                {
                    desc_grupo: 'TOTAL GASTOS',
                    monto: totalGastosParaEsteAno,
                    porcentaje: null,
                },
                {
                    desc_grupo: 'VENTAS NETAS',
                    monto: consolidatedData ? consolidatedData.ventasNetas : 0,
                    porcentaje: null,
                },
                {
                    desc_grupo: 'COSTO COMERCIAL',
                    monto: consolidatedData ? consolidatedData.costoComercial : 0,
                    porcentaje: null,
                },
                {
                    desc_grupo: 'UTILIDAD BRUTA',
                    monto: consolidatedData ? consolidatedData.utilidadBruta : 0,
                    porcentaje: consolidatedData ? consolidatedData.margenPorcentual : null,
                }
            );
        });
        // --- 6. Agregamos el objeto "Total" consolidado ---
        const totalPorGrupo = {};
        combinedFormattedData.forEach(({ detalle }) => {
            detalle.forEach(({ desc_grupo, monto }) => {
                if (!totalPorGrupo[desc_grupo]) {
                    totalPorGrupo[desc_grupo] = 0;
                }
                totalPorGrupo[desc_grupo] += monto;
            });
        });
        const detalleTotal = Object.entries(totalPorGrupo).map(([desc_grupo, monto]) => {
            let porcentaje = null;
            // Recalcular el porcentaje de Utilidad Bruta para el Total
            if (desc_grupo === 'UTILIDAD BRUTA') {
                const totalVentasNetas = totalPorGrupo['VENTAS NETAS'] || 0;
                if (totalVentasNetas !== 0) {
                    porcentaje = (monto / totalVentasNetas) * 100;
                }
            }
            return {
                desc_grupo,
                monto,
                porcentaje,
            };
        });

        combinedFormattedData.push({
            date: 'Total',
            detalle: detalleTotal,
        });

        // --- 7. Calculamos la diferencia por año (Consolidated Utilidad Bruta - Gastos Internos) ---
        const resultadoDiferenciaByYearArray = allYears.map(year => {
            const consolidatedData = finalConsolidatedFinancials.find((c) => c.year === year);
            const totalGastos = totalGastosInternosByYear.find(g => Number(g.date) === year)?.monto ?? 0;
            const utilidadBruta = consolidatedData ? consolidatedData.utilidadBruta : 0;
            const diferencia = utilidadBruta - totalGastos;

            return {
                date: String(year),
                monto: diferencia,
            };
        });

        // --- 8. Ordenamos los detalles de cada año según el orden personalizado ---
        const ordenPersonalizado = [
            'VENTAS NETAS',
            'COSTO COMERCIAL',
            'UTILIDAD BRUTA',
            'TOTAL GASTOS', // Este es el total de los gastos internos *sin* ventas/costo comercial
            'DEVOLUCIONES',
            'GASTOS ADMINISTRATIVOS',
            'GASTOS COMERCIALES',
            'PARTIDAS QUE NO MUEVEN EFECTIVO',
            'RECURSOS HUMANOS',
            // Puedes añadir más si hay otras categorías de gastos internos aquí
        ];

        combinedFormattedData.forEach((item) => {
            item.detalle.sort((a, b) => {
                const indexA = ordenPersonalizado.indexOf(a.desc_grupo);
                const indexB = ordenPersonalizado.indexOf(b.desc_grupo);

                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        });

        console.log("Combined Formatted Data Final:", JSON.stringify(combinedFormattedData, null, 2));
        console.log("Diferencia por Año Final:", JSON.stringify(resultadoDiferenciaByYearArray, null, 2));

        return res.json({ formattedData: combinedFormattedData, resultadoDiferenciaByYearArray });

    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: 'Error en findXAgenciaSimpleGastosController', error: error.message });
    }
};


const procesarGastos = (gastos) => {
  const resultado = {};

  // Agrupar por desc_grupo
  gastos.forEach((gasto) => {
    const { Gestion, desc_grupo, monto } = gasto;
    if (!resultado[desc_grupo]) {
      resultado[desc_grupo] = { desc_grupo, montos: {}, total: 0 };
    }
    // Agregar monto por año (Gestion)
    resultado[desc_grupo].montos[Gestion] =
      (resultado[desc_grupo].montos[Gestion] || 0) + monto;

    // Sumar al total
    resultado[desc_grupo].total += monto;
  });

  // Formatear el resultado en un array para mayor flexibilidad
  return Object.values(resultado);
};

const calcularPorcentajes = (datosProcesados) => {
  // Calcular el total general por año
  const totalByYear = {};

  datosProcesados.forEach((grupo) => {
    Object.entries(grupo.montos).forEach(([year, monto]) => {
      totalByYear[year] = (totalByYear[year] || 0) + monto;
    });
  });

  // Agregar porcentajes al resultado
  const datosConPorcentajes = datosProcesados.map((grupo) => {
    const porcentajes = {};
    Object.entries(grupo.montos).forEach(([year, monto]) => {
      porcentajes[year] = ((monto / totalByYear[year]) * 100).toFixed(2); // Formatear a 2 decimales
    });
    return {
      ...grupo,
      porcentajes,
    };
  });

  return { datosConPorcentajes, totalByYear };
};

const gastosGestionAgenciaController = async (req, res) => {
  try {
    const gestion = req.query.gestion;
    const codigo = req.query.codigo;

    const response = await gastosGestionAgencia(+gestion, +codigo);
    const responseHana = await getGastosAgenciaxGestionSAPHana(+gestion, +codigo);
    const agrupado = agruparPorMes(response);

    const monthMap = {
      1: 'JANUARY',
      2: 'FEBRUARY',
      3: 'MARCH',
      4: 'APRIL',
      5: 'MAY',
      6: 'JUNE',
      7: 'JULY',
      8: 'AUGUST',
      9: 'SEPTEMBER',
      10: 'OCTOBER',
      11: 'NOVEMBER',
      12: 'DECEMBER'
    };

    const ordenPersonalizado = [
      'VENTAS NETAS',
      'COSTO COMERCIAL',
      'UTILIDAD BRUTA',
      'DEVOLUCIONES',
      'GASTOS ADMINISTRATIVOS',
      'GASTOS COMERCIALES',
      'PARTIDAS QUE NO MUEVEN EFECTIVO',
      'RECURSOS HUMANOS',
      'TOTAL GASTOS'
    ];

    // Agregamos datos de HANA a agrupado
    responseHana.forEach((hanaItem) => {
      const monthName = monthMap[+hanaItem.Mes];
      const mesEncontrado = agrupado.find((g) => g.date === monthName);

      const infoHanaDetalle = [
        {
          desc_grupo: 'UTILIDAD BRUTA',
          monto: parseFloat(hanaItem.UtilidadBruta)
        },
        {
          desc_grupo: 'VENTAS NETAS',
          monto: parseFloat(hanaItem.TotalVentasNetas)
        },
        {
          desc_grupo: 'COSTO COMERCIAL',
          monto: parseFloat(hanaItem.CostoComercialTotal)
        },
        {
          desc_grupo: 'MARGEN %',
          monto: parseFloat(hanaItem.MargenPorcentual)
        }
      ];

      if (mesEncontrado) {
        mesEncontrado.detalle.unshift(...infoHanaDetalle.reverse());
      } else {
        agrupado.push({
          date: monthName,
          detalle: [...infoHanaDetalle]
        });
      }
    });

    // Aseguramos que todos los meses tengan todos los grupos del ordenPersonalizado
    for (const mes of agrupado) {
      const descsActuales = mes.detalle.map(d => d.desc_grupo);

      // Añadimos los grupos faltantes con monto 0
      ordenPersonalizado.forEach((desc) => {
        if (!descsActuales.includes(desc)) {
          mes.detalle.push({ desc_grupo: desc, monto: 0 });
        }
      });

      mes.detalle = mes.detalle.filter(d => d.desc_grupo !== 'MARGEN %');

      const totalGastos = mes.detalle
        .filter(d =>
          !['VENTAS NETAS', 'COSTO COMERCIAL', 'UTILIDAD BRUTA', 'TOTAL GASTOS'].includes(d.desc_grupo)
        )
        .reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);

      // Reemplazar o insertar TOTAL GASTOS
      const idxTotal = mes.detalle.findIndex(d => d.desc_grupo === 'TOTAL GASTOS');
      if (idxTotal >= 0) {
        mes.detalle[idxTotal].monto = totalGastos;
      } else {
        mes.detalle.push({ desc_grupo: 'TOTAL GASTOS', monto: totalGastos });
      }

      // Ordenar detalle según orden personalizado
      mes.detalle.sort((a, b) => {
        const idxA = ordenPersonalizado.indexOf(a.desc_grupo);
        const idxB = ordenPersonalizado.indexOf(b.desc_grupo);
        return idxA - idxB;
      });
    }

    return res.json({ gestion, codigo, agrupado });

  } catch (error) {
    console.log({ error });
    return res.status(500).json({ mensaje: 'error en el controlador' });
  }
};


function agruparPorMes(data) {
  const resultado = data.reduce((acumulador, item) => {
    const mes = item.mes.trim(); // Asegúrate de eliminar espacios
    const desc_grupo = item.desc_grupo.trim(); // Asegúrate de eliminar espacios

    // Busca si el mes ya existe en el acumulador
    let entradaMes = acumulador.find((entrada) => entrada.date === mes);

    if (!entradaMes) {
      // Si el mes no existe, inicialízalo
      entradaMes = { date: mes, detalle: [] };
      acumulador.push(entradaMes);
    }

    // Busca si el desc_grupo ya existe en el detalle de este mes
    let entradaGrupo = entradaMes.detalle.find((detalle) => detalle.desc_grupo === desc_grupo);

    if (!entradaGrupo) {
      // Si el grupo no existe, inicialízalo
      entradaGrupo = { desc_grupo: desc_grupo, monto: 0 };
      entradaMes.detalle.push(entradaGrupo);
    }

    // Suma el monto al grupo
    entradaGrupo.monto += parseFloat(item.monto);

    return acumulador;
  }, []);

  return resultado;
}

const reporteArticulosPendientesController = async (req, res) => {
  try {
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const response = await reporteArticuloPendientes(startDate, endDate)
    return res.json(response)
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'error en el controlador' })
  }
}

const reporteMargenComercialController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log(startDate, endDate)
    if (!startDate || !endDate) {
      return res.status(400).json({ mensaje: 'Los parámetros "startDate" y "endDate" son requeridos.' });
    }

    const start = parseDateFromYYYYMMDD(req.query.startDate);
    const end = parseDateFromYYYYMMDD(req.query.endDate);

    console.log(start, end)
    if (!start || !end) {
      return res.status(400).json({
        mensaje: 'Las fechas deben tener un formato válido de 8 dígitos (ej: 20250101)'
      });
    }


    const response = await reporteMargenComercial(start, end);
    const resultadoFinal = agruparPorDivisionYSucursal(response);
    return res.json(resultadoFinal);

  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      mensaje: `Error en el controlador reporteMargenComercialController, ${error.message || 'error desconocido'}`
    });
  }
};

const parseDateFromYYYYMMDD = (str) => {
  console.log(str);
  if (!/^\d{8}$/.test(str)) return null;

  const year = parseInt(str.slice(0, 4), 10);
  const month = parseInt(str.slice(4, 6), 10) - 1;
  const day = parseInt(str.slice(6, 8), 10);

  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
};

const getCommercialMarginByProducts = async (req, res) => {
  try {
    const { startDate, endDate, lineCode, succode, divcode } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        mensaje: 'Los parámetros startDate y endDate son obligatorios en formato YYYYMMDD'
      });
    }

    const start = parseDateFromYYYYMMDD(startDate);
    const end = parseDateFromYYYYMMDD(endDate);

    // Convertir los parámetros opcionales a número o null
    const parsedLineCode = lineCode !== undefined ? Number(lineCode) : null;
    const parsedSuccode = succode !== undefined ? Number(succode) : null;
    const parsedDivcode = divcode !== undefined ? Number(divcode) : null;

    const result = await CommercialMarginByProducts(start, end, parsedSuccode, parsedDivcode, parsedLineCode);

    return res.status(200).json(result);
  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      mensaje: `Error en el controlador getCommercialMarginByProducts, ${error.message || 'error desconocido'}`
    });
  }
}

const getMonthlyCommercialMarginController = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year || isNaN(parseInt(year))) {
      return res.status(400).json({ mensaje: 'El parámetro "year" es requerido y debe ser numérico.' });
    }

    const response = await getMonthlyCommercialMargin(parseInt(year));
    const resultadoFinal = groupMarginByMonth(response);

    return res.json(resultadoFinal);
  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      mensaje: `Error en getMonthlyCommercialMarginController: ${error.message || 'error desconocido'}`
    });
  }
};

const getReportBankMajorController = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10, search = '' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ mensaje: 'Los parámetros "startDate","endDate" y "account" son requeridos.' });
    }

    const skip = (page - 1) * limit;
    const start = parseDateFromYYYYMMDD(startDate);
    const end = parseDateFromYYYYMMDD(endDate);

    if (!start || !end) {
      return res.status(400).json({
        mensaje: 'Las fechas deben tener un formato válido de 8 dígitos (ej: 20250101 => AAAAMMDD)'
      });
    }

    const parsedSkip = skip !== undefined ? Number(skip) : 1;
    const parsedLimit = limit !== undefined ? Number(limit) : 10;
    const parsedSearch = search !== undefined ? String(search) : '';

    const response = await getReportBankMajor(
      start,
      end,
      parsedSkip,
      parsedLimit,
      parsedSearch
    );

    const total = response.length > 0 ? response[0].TotalCount : 0;
    const totalPages = Math.ceil(total / limit);

    return res.json({
      reporte: response,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      }
    });
  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      mensaje: `Error en getReportBankMajorController: ${error.message || 'error desconocido'}`
    });
  }
}


const getCommercialBankAccountsController = async (req, res) => {
  try {
    const response = await getCommercialBankAccounts();
    return res.status(200).json(response);
  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      mensaje: `Error en getCommercialBankAccounts: ${error.message || 'error desconocido'}`
    });
  }
}


const excelBankMajorController = async (req, res) => {
  try {
    const { data, fechaInicio, fechaFin } = req.body;

    const fechaActual = new Date();
    const date = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fechaActual);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mayor Banco');

    // Definir columnas con anchos ajustados
    worksheet.columns = [
      { header: 'Fecha', key: 'RefDate', width: 12 }, // Aumentado ancho para fechas
      { header: 'Origen', key: 'TransName', width: 12 }, // Aumentado ancho para fechas
      { header: 'Voucher', key: 'Voucher', width: 12 }, // Aumentado ancho para fechas
      { header: 'Codigo Cuenta', key: 'AcctCode', width: 15 },
      { header: 'Nombre Cuenta', key: 'AcctName', width: 30 }, // Aumentado para nombres más largos
      { header: 'Credito', key: 'Credit', width: 15 },
      { header: 'Debito', key: 'Debit', width: 15 },
      { header: 'Glosa', key: 'LineMemo', width: 50 }, // Aumentado para glosas largas
    ];

    // Insertar filas de cabecera
    worksheet.insertRow(1, []);
    worksheet.insertRow(1, []);
    worksheet.insertRow(1, []);

    // Agregar contenido a las filas de cabecera
    worksheet.getCell('A1').value = 'REPORTE DE MAYOR BANCO';
    worksheet.getCell('A2').value = `Período: ${fechaInicio} - ${fechaFin}`;
    worksheet.getCell('A3').value = `Fecha de impresión: ${date}`;

    // Fusionar celdas para cabecera
    worksheet.mergeCells('A1:I1');
    worksheet.mergeCells('A2:I2');
    worksheet.mergeCells('A3:I3');

    // Estilizar cabecera
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.getCell(1).font = { bold: true, size: 16, color: { argb: '004D76' } };
    headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getRow(2).getCell(1).font = { bold: true, size: 12 };
    worksheet.getRow(2).getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getRow(3).getCell(1).font = { bold: true, size: 12 };
    worksheet.getRow(3).getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Estilizar encabezados de columnas (fila 4)
    const columnsRow = worksheet.getRow(4);
    columnsRow.height = 20;
    columnsRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BA005C' } // Color corporativo IFA
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });

    // Estilo de borde para aplicar a todas las celdas
    const borderStyle = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } }
    };

    // Variables para totales
    let totalDebito = 0;
    let totalCredito = 0;

    if (data && data.length > 0) {
      data.forEach((item, index) => {
        // Formatear la fecha en formato legible
        let formattedDate = '';
        if (item.RefDate) {
          const fecha = new Date(item.RefDate);
          formattedDate = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        }

        const debitoValue = item.Debit ? parseFloat(item.Debit) : 0;
        const creditoValue = item.Credit ? parseFloat(item.Credit) : 0;

        // Acumular totales
        totalDebito += debitoValue;
        totalCredito += creditoValue;

        const row = worksheet.addRow({
          RefDate: formattedDate,
          TransName: item.TransName || '',
          Voucher: item.Voucher || '',
          AcctCode: item.AcctCode || '',
          AcctName: item.AcctName || '',
          Credit: creditoValue,
          Debit: debitoValue,
          LineMemo: item.LineMemo || '',
        });

        // Aplicar bordes a todas las celdas de la fila
        row.eachCell((cell) => {
          cell.border = borderStyle;

          // Alineación específica para cada tipo de columna
          if (cell.column === 1) { // Fecha
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cell.column === 4 || cell.column === 5) { // Debito y Credito
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            cell.numFmt = '#,##0.00'; // Formato de número con dos decimales
          } else if (cell.column === 6) { // Glosa
            cell.alignment = { vertical: 'middle', wrapText: true }; // Permitir ajuste de texto
          } else {
            cell.alignment = { vertical: 'middle' };
          }
        });
      });

      // Agregar fila de totales
      const totalRow = worksheet.addRow({
        RefDate: '',
        TransName: '',
        Voucher: '',
        AcctCode: '',
        AcctName: 'TOTALES',
        Credit: totalCredito,
        Debit: totalDebito,
        LineMemo: ''
      });

      // Estilizar fila de totales
      totalRow.eachCell((cell) => {
        cell.border = borderStyle;
        cell.font = { bold: true };

        if (cell.column === 3) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (cell.column === 4 || cell.column === 5) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
          // Color de fondo para destacar los totales
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F0F0' }
          };
        }
      });
    } else {
      // Si no hay datos, agregar una fila informativa
      const emptyRow = worksheet.addRow(['No hay datos disponibles para el período seleccionado']);
      worksheet.mergeCells(`A${emptyRow.number}:F${emptyRow.number}`);
      emptyRow.getCell(1).alignment = { horizontal: 'center' };
      emptyRow.getCell(1).font = { italic: true };
    }

    // Aplicar autoajuste para la columna de glosa (basado en el contenido)
    worksheet.getColumn('LineMemo').eachCell({ includeEmpty: false }, (cell) => {
      if (cell.value && cell.value.toString().length > 50) {
        cell.alignment = { wrapText: true, vertical: 'middle' };
      }
    });

    // Configuración de respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_mayor_banco.xlsx');

    // Generar y enviar el Excel
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generando Excel:', error);
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };

    grabarLog(
      user.USERCODE,
      user.USERNAME,
      'Reporte de Mayor Banco',
      `Error generando el Excel: ${error}`,
      'catch de excelBankMajorController',
      'finanzas/excel-mayor-banco',
      process.env.PRD
    );

    return res.status(500).json({
      mensaje: `Error al generar el Excel: ${error.message || 'Error desconocido'}`
    });
  }
};

const getAgenciasGenesis = async(req, res) => {
  try {
    
    const response = await getAgencias();
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error obteniendo agencias del genesis:', error);
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };

    grabarLog(
      user.USERCODE,
      user.USERNAME,
      'Agencias Genesis, Gastos',
      `Error obteniendo agencias del genesis: ${error}`,
      'catch de getAgenciasGenesis',
      'finanzas/agencias/genesis',
      process.env.PRD
    );

    return res.status(500).json({
      mensaje: `Error obteniendo agencias del genesis: ${error.message || 'Error desconocido'}`
    });
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
  abastecimientoFechaAnualController,
  abastecimientoFecha24MesesController,
  findAllGastosController,
  findAllSimpleGastosController,
  findXAgenciaSimpleGastosController,
  gastosGestionAgenciaController,
  reporteArticulosPendientesController,
  reporteMargenComercialController,
  getCommercialMarginByProducts,
  getMonthlyCommercialMarginController,
  getReportBankMajorController,
  getCommercialBankAccountsController,
  excelBankMajorController,
  getAgenciasGenesis
}