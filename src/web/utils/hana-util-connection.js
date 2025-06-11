// hana-util.js
const hana = require('@sap/hana-client');

const executeQueryWithConnection = async (query) => {
  let conn;
  try {
    conn = hana.createConnection();
    await conn.connect({
      serverNode:`${process.env.HANASERVER}:${process.env.HANAPORT}`,
      uid: process.env.HANAUSER,
      pwd: process.env.HANAPASS,
    });

    return await new Promise((resolve, reject) => {
      conn.exec(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    if (conn) conn.disconnect();
  }
};

const executeQueryParamsWithConnection = async (query, params = []) => {
  let conn;
  try {
    conn = hana.createConnection();
    await conn.connect({
      serverNode:`${process.env.HANASERVER}:${process.env.HANAPORT}`,
      uid: process.env.HANAUSER,
      pwd: process.env.HANAPASS,
    });

    return await new Promise((resolve, reject) => {
      conn.prepare(query, (err, statement) => {
        if (err) return reject(err);
        statement.exec(params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    });

  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    if (conn) conn.disconnect();
  }
};

module.exports = {
  executeQueryWithConnection,
  executeQueryParamsWithConnection
};
