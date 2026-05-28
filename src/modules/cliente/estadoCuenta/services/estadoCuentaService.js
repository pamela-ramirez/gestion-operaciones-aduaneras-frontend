// TODO: Reemplazar con api real

/**
 * Simula la obtención del estado de cuenta filtrado por mes y año
 * @param {number} mes - Mes (1-12)
 * @param {number} anio - Año (ej: 2026)
 * @returns {Promise} Estado de cuenta con movimientos agrupados por carpeta
 */
export const obtenerEstadoCuenta = async (mes, anio) => {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Datos simulados basados en el Excel proporcionado
  return {
    cliente: {
      rut: "76.123.456-K",
      razonSocial: "EMPRESA IMPORTADORA S.A."
    },
    saldoAnterior: 30108.0,
    pagosACuenta: 0.0,
    fechaSaldoAnterior: new Date(2026, mes - 1, 1),
    carpetas: [
      {
        nroCarpeta: "16607",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 8696,
            anticipo: 0,
          },
        ],
        saldoCarpeta: -8696,
      },
      {
        nroCarpeta: "16619",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 8685,
            anticipo: 0,
          },
        ],
        saldoCarpeta: -8685,
      },
      {
        nroCarpeta: "16628",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 8762,
            anticipo: 0,
          },
        ],
        saldoCarpeta: -8762,
      },
      {
        nroCarpeta: "16637",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 3965,
            anticipo: 0,
          },
        ],
        saldoCarpeta: -3965,
      },
      {
        nroCarpeta: "16643",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 22),
            tipoDocumento: "Recibo",
            numero: "919",
            detalle: "ANTICIPO C-16643",
            moneda: "USD",
            debe: 0,
            haber: 5368,
            anticipo: 5368,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 22),
            tipoDocumento: "Recibo",
            numero: "919",
            detalle: "ANTICIPO C-16643",
            moneda: "USD",
            debe: 0,
            haber: 28656,
            anticipo: 28656,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 25),
            tipoDocumento: "Factura",
            numero: "928",
            detalle: "IMPORTACION048931",
            moneda: "USD",
            debe: 5368,
            haber: 0,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 25),
            tipoDocumento: "Factura",
            numero: "929",
            detalle: "IMPORTACION048931",
            moneda: "USD",
            debe: 37715,
            haber: 0,
            anticipo: 0,
          },
        ],
        saldoCarpeta: 9059,
      },
      {
        nroCarpeta: "16671",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 8),
            tipoDocumento: "Recibo",
            numero: "949",
            detalle: "ANTICIPO C-16671",
            moneda: "USD",
            debe: 0,
            haber: 5368,
            anticipo: 5368,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 8),
            tipoDocumento: "Recibo",
            numero: "949",
            detalle: "ANTICIPO C-16671",
            moneda: "USD",
            debe: 0,
            haber: 13576,
            anticipo: 13576,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 9),
            tipoDocumento: "Factura",
            numero: "967",
            detalle: "IMPORTACION058967",
            moneda: "USD",
            debe: 5368,
            haber: 0,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 9),
            tipoDocumento: "Factura",
            numero: "968",
            detalle: "IMPORTACION058967",
            moneda: "USD",
            debe: 22755,
            haber: 0,
            anticipo: 0,
          },
        ],
        saldoCarpeta: 9179,
      },
      {
        nroCarpeta: "16672",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Factura",
            numero: "944",
            detalle: "OTROS TIPOS016672",
            moneda: "USD",
            debe: 4148,
            haber: 0,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Factura",
            numero: "945",
            detalle: "OTROS TIPOS016672",
            moneda: "USD",
            debe: 1417,
            haber: 0,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 4148,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 1417,
            anticipo: 0,
          },
        ],
        saldoCarpeta: 0,
      },
      {
        nroCarpeta: "16673",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Factura",
            numero: "946",
            detalle: "OTROS TIPOS016673",
            moneda: "USD",
            debe: 4148,
            haber: 0,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Factura",
            numero: "947",
            detalle: "OTROS TIPOS016673",
            moneda: "USD",
            debe: 1580,
            haber: 0,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 4148,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 7),
            tipoDocumento: "Recibo",
            numero: "948",
            detalle: "CANCELACION C-16607 C-16619 C-",
            moneda: "USD",
            debe: 0,
            haber: 1580,
            anticipo: 0,
          },
        ],
        saldoCarpeta: 0,
      },
      {
        nroCarpeta: "16674",
        movimientos: [
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 12),
            tipoDocumento: "Recibo",
            numero: "976",
            detalle: "ANTICIPO C-16674",
            moneda: "USD",
            debe: 0,
            haber: 4400,
            anticipo: 4400,
          },
          {
            referencia: "16674",
            fecha: new Date(2026, mes - 1, 12),
            tipoDocumento: "Factura",
            numero: "977",
            detalle: "TRANSITO   016674",
            moneda: "USD",
            debe: 4400,
            haber: 0,
            anticipo: 0,
          },
          {
            referencia: "",
            fecha: new Date(2026, mes - 1, 12),
            tipoDocumento: "Recibo",
            numero: "976",
            detalle: "ANTICIPO C-16674",
            moneda: "USD",
            debe: 0,
            haber: 3155,
            anticipo: 3155,
          },
          {
            referencia: "16674",
            fecha: new Date(2026, mes - 1, 12),
            tipoDocumento: "Factura",
            numero: "978",
            detalle: "TRANSITO   016674",
            moneda: "USD",
            debe: 7338,
            haber: 0,
            anticipo: 0,
          },
        ],
        saldoCarpeta: 4183,
      },
    ],
  };
};

/**
 * Calcula los totales del estado de cuenta
 * @param {Object} estadoCuenta - Estado de cuenta completo
 * @returns {Object} Totales calculados
 */
export const calcularTotales = (estadoCuenta) => {
  if (!estadoCuenta || !estadoCuenta.carpetas) {
    return {
      totalDebe: 0,
      totalHaber: 0,
      totalAnticipo: 0,
      saldoActual: 0,
    };
  }

  let totalDebe = 0;
  let totalHaber = 0;
  let totalAnticipo = 0;

  estadoCuenta.carpetas.forEach((carpeta) => {
    carpeta.movimientos.forEach((mov) => {
      totalDebe += mov.debe || 0;
      totalHaber += mov.haber || 0;
      totalAnticipo += mov.anticipo || 0;
    });
  });

  const saldoActual =
    estadoCuenta.saldoAnterior + totalDebe - totalHaber - estadoCuenta.pagosACuenta;

  return {
    totalDebe,
    totalHaber,
    totalAnticipo,
    saldoActual,
  };
};