const mysql = require(`mysql`);

const config = require(`./twine-config`);

class Util2 {
  
  constructor () {
    this.A = {};
  }
  
}

class SQL {
  
  constructor () {
    this.iniSql = mysql.createConnection({
      host: config.SqlConfig.h,
    });
  }
}
