const {readFile} = require(`fs`);
const mysql = require(`mysql`);
const cookie = require(`cookie`);

const config = require(`./twine-config`);
const modeler = require(`./twine-model`);

class Util2 {
  
  constructor () {
    this.A = {};
  }
  
  modelStyler (file, callback) {
    readFile(file, {encoding: `utf8`}, (err, SString) => {
      for (let trim in config.electCSSTrims) {
        SString = SString.replace(config.electCSSTrims[trim], trim);
      }
      return callback(SString);
    });
  }
  
}

class SQL {
  
  constructor () {
    this.iniSql = mysql.createConnection({
      host: config.SqlConfig.h,
      user: config.SqlConfig.u,
      password: config.SqlConfig.p});
    this.uniSql = mysql.createConnection({
      host: config.SqlConfig.h,
      user: config.SqlConfig.u,
      password: config.SqlConfig.p,
      database: config.SqlConfig.d});
    this.multiSql = mysql.createConnection({
      host: config.SqlConfig.h,
      user: config.SqlConfig.u,
      password: config.SqlConfig.p,
      database: config.SqlConfig.d,
      multipleStatements: true});
  }

  SqlSource () {
    this.iniSql.query(config.SqlQuery.twine, () => {
      this.multiSql.query(
        `${config.SqlQuery.tempusers};${config.SqlQuery.users};${config.SqlQuery.usermeta}`);
      this.multiSql.end();
    });
    this.iniSql.end();
  }
}

class UACallsPublic extends Util2 {
  
  constructor (level, request, response) {
    super();
    this.levelState = level;
    this.UA = {req: request, res: response};
  }
  
  handleUACalls () {
    if (this.levelState === ``) this.handleRootCall();
  }

  handleRootCall () {
    let SString = config.CSSDeck, electModel, jar, modelMapping;
    if (this.UA.req.headers.cookie) jar = cookie.parse(this.UA.req.headers.cookie);
    
    if (jar && jar.UAAuthorized) {
      SString += `user.css`;
    } else {
      SString += `common.css`;
    }
    
    const UA = this.UA;
    
    this.modelStyler(SString, function (styleString) {
      
      modelMapping = {
        title: `twineall`,
        styleText: styleString,
        appendModel: ``
      };
      
      if (jar && jar.UAAuthorized) {
        modelMapping[`appendModel`] = [modeler.chatOverview()];
        modelMapping[`appendModel`] = [modeler.controls(), modeler.contentFrame(modelMapping[`appendModel`])];
        modelMapping[`appendModel`] = modeler.cookieModel(modelMapping[`appendModel`]);
        electModel = modeler.callFrame(modelMapping);
      } else {
        modelMapping[`appendModel`] = [modeler.welcome()];
        electModel = modeler.callFrame(modelMapping);
      }
      UA.res.writeHead(200, config.electMimeTypes.html);
      UA.res.end(electModel);
    });
  }
}

module.exports = {
  UAPublic (level, req, res) {
    new UACallsPublic(level, req, res).handleUACalls();
  },
  Mysql () {
    new SQL().SqlSource();
  }
};