const {readFile} = require(`fs`);
const mysql = require(`mysql`);
const cookie = require(`cookie`);

const config = require(`./twine-config`);
const modeler = require(`./twine-model`);

class Util2 {
  
  constructor () {
    this.electSub_ = {};
  }
  
  modelStyler (file, callback) {
    readFile(file, {encoding: `utf8`}, (err, SString) => {
      for (let trim in config.electCSSTrims) {
        SString = SString.replace(config.electCSSTrims[trim], trim);
      }
      return callback(SString);
    });
  }

  literalFormat (literal) {
    let electSub = {};
    for (let sub in this.electSub_) {
      electSub[sub] = this.electSub_;
    }
    for (let sub in electSub) {
      electSub[sub] = new RegExp(`{` + electSub[sub] + `}`, `g`);
      literal = literal.replace(electSub[sub], sub);
    }
    return literal;
  }

  availElectSub_ (electSub) {
    this.electSub_ = electSub;
    return this.electSub_;
  }
  
}

class SQL extends Util2 {
  
  constructor () {
    super();
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

  SqlPlus (electSqlVar, callback) {
    this.uniSql.query({
      sql: config.SqlQuery.getPlus,
      values: [electSqlVar.table, electSqlVar.field, electSqlVar.fieldValue]
    }, (A, B, C) => {callback(A, B, C)});
  }

  SqlValidateElects (listSqlVar, callback) {

    this.electSub_ = {
      id: listSqlVar[3],
      idMail: listSqlVar[1],
      idSex: listSqlVar[2]};

    this.multiSql.query(this.literalFormat(
      `${config.SqlQuery.getElects};${config.SqlQuery.equateElectsSex};${config.SqlQuery.equateMail};${config.SqlQuery.getChain}`),
      (A, B, C) => {callback(A, B, C)}
    );
    this.multiSql.end();
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

class UAStreamQuery {

  constructor (QString, request, response) {
    this.qString = QString;
    this.UA = {req: request, res: response};
  }

  UAStreamQs () {
    if (this.qString.electsQuery) {
      this.electsStream(JSON.parse(this.qString.electsQuery));
    }
  }

  electsStream (QString) {
    if (!this.UA.req.headers.cookie) return;
    let jar = cookie.parse(this.UA.req.headers.cookie);
    if (!jar.UAAuthorized) return;

    const UA = this.UA;
    let modelMapping = {
      appendModel: [modeler.electsValidModel(QString)]
    };

    UA.res.setHeader(`Set-Cookie`, cookie.serialize(`electsQString`, JSON.stringify(QString), {
      httpOnly: true,
      path: `/`,
      secure: true
    }));
    UA.res.writeHead(200, config.electMimeTypes.json);
    UA.res.end(JSON.stringify(modeler.immerseModel(modelMapping)));
  }

  electsValidStream (QString) {
    if (!this.UA.req.headers.cookie) return;
    let jar = cookie.parse(this.UA.req.headers.cookie);
    if (!jar.UAAuthorized) return;

    const UA = this.UA;
    let listSqlVar = QString;
    listSqlVar.append(jar.UAAuthorized);

    new SQL().SqlValidateElects(listSqlVar, (A, B, C) => {
      if (B[2].length === 0) {
        if (B[0].length < 2) {
          if (B[1].length === 0) {
            if (listSqlVar[2] === `female`) {
              let altSex = `male`;
            }
            if (listSqlVar[2] === `male`) {
              let altSex = `female`;
            }
            if (altSex) return;
            new SQL().SqlPlus({
              table: `temp_user`,
              field: `sex`,
              fieldValue: altSex}, (A, B, C) => {
                
              });
          }
        }
      }
    });
  }
}

module.exports = {
  UAPublic (level, req, res) {
    new UACallsPublic(level, req, res).handleUACalls();
  },
  UAStream (QString, req, res) {
    new UAStreamQuery(QString, req, res).UAStreamQs();
  },
  Mysql () {
    new SQL().SqlSource();
  }
};