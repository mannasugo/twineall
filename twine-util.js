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

  SqlMono (sqlVar, callback) {
    this.uniSql.query({
      sql: config.SqlQuery.getMono,
      values: [sqlVar]
    }, (A, B, C) => {callback(A, B, C)});
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

    if (this.levelState === `elect`) this.handleElectCall();
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
        modelMapping[`appendModel`] = [modeler.controlsModel(), modeler.contentModel(modelMapping)];
        modelMapping[`UACookie`] = jar.UAAuthorized;
        modelMapping[`appendModel`] = modeler.cookieModel(modelMapping);
        electModel = modeler.callFrame(modelMapping); console.log(electModel)
      } else {
        modelMapping[`appendModel`] = [modeler.welcome()];
        electModel = modeler.callFrame(modelMapping);
      }
      UA.res.writeHead(200, config.electMimeTypes.html);
      UA.res.end(electModel);
    });
  }

  handleElectCall () {
    if (!this.UA.req.headers.cookie) return;
    let jar = cookie.parse(this.UA.req.headers.cookie);
    if (!jar.UAAuthorized) return;

    let modelMapping, electModel;

    const UA = this.UA;

    this.modelStyler(config.CSSDeck + `user.css`, styleString => {
      new SQL().SqlMono(`suggests_` + jar.UAAuthorized, (A, B, C) => {

        modelMapping = {
          title: `twineall - Nominate Member`,
          styleText: styleString,
          UACookie: jar.UAAuthorized,
          appendModel: ``,
        };

        if (B.length > 0) {

        } else {
          modelMapping[`appendModel`] = modeler.electsModel([`male`, `female`]);
          modelMapping[`appendModel`] = [modeler.controlsModel(), modeler.contentModel(modelMapping)];
          modelMapping[`appendModel`] = modeler.cookieModel(modelMapping);
          electModel = modeler.callFrame(modelMapping); console.dir(electModel)
        }
        UA.res.writeHead(200, config.electMimeTypes.html);
        UA.res.end(electModel);
      });
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