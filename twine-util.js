const {readFile} = require(`fs`);
const mysql = require(`mysql`);
const cookie = require(`cookie`);
const crypto = require(`crypto`);

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
      electSub[sub] = this.electSub_[sub];
    }
    for (let sub in electSub) {
      electSub[sub] = new RegExp(`{` + electSub[sub] + `}`, `g`);
      literal = literal.replace(electSub[sub], sub);
    }console.log(literal)
    return literal;
  }

  availElectSub_ (electSub) {
    this.electSub_ = electSub; console.log(this.electSub_)
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

  SqlCommit (listSqlVar, callback) {
    this.uniSql.query({
      sql: config.SqlQuery.insert,
      values: listSqlVar}, (A, B, C) => {callback(A, B, C)});
  }

  SqlValidateElects (listSqlVar, callback) {

    this.availElectSub_({
      [listSqlVar[`mailTo`]]: `id`,
      [listSqlVar[`mail`]]: `idMail`,
      [listSqlVar[`mailSx`]]: `idSex`,
      [listSqlVar[`refs`]]: `refs`});

    this.multiSql.query(this.literalFormat(
      `${config.SqlQuery.getElects};${config.SqlQuery.equateElectsSex};${config.SqlQuery.equateMail};${config.SqlQuery.getChain}`),
      (A, B, C) => {callback(A, B, C)}
    );
    this.multiSql.end();
  }

  SqlMultiVar (SqlMapping, callback) {

    this.availElectSub_(SqlMapping);

    this.uniSql.query(this.literalFormat(
      config.SqlQuery.getPlusAnonym), (A, B, C) => {callback(A, B, C)});
    this.uniSql.end();
  }

  SqlsMultiVar (SqlMapping, SqlsString, callback) {
    this.availElectSub_(SqlMapping);

    this.multiSql.query(this.literalFormat(SqlsString), (A, B, C) => {
      callback(A, B, C)});
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
    if (this.qString.electsAuthQ) {
      this.electsAuth(JSON.parse(this.qString.electsAuthQ));
    }

    if (this.qString.electsMailQ) {
      this.initMailStream(JSON.parse(this.qString.electsMailQ));
    }

    if (this.qString.electsPassQ) {
      this.initPassStream(JSON.parse(this.qString.electsPassQ));
    }

    if (this.qString.electsQuery) {
      this.electsStream(JSON.parse(this.qString.electsQuery));
    }

    if (this.qString.electsValidQ) {
      this.electsValidStream(JSON.parse(this.qString.electsValidQ));
    }
  }

  electsAuth (QString) {
    this.UA.res.writeHead(200, config.electMimeTypes.json);
    this.UA.res.end(JSON.stringify(modeler.initMailModel()));
  }

  initMailStream (QString) {
    const UA = this.UA;

    new SQL().SqlPlus({
      table: `usermeta`,
      field: `mail`,
      fieldValue: QString.mailTo}, (A, B, C) => {
        if (B.length === 0) {
          new SQL().SqlMultiVar({
            [`temp_users`]: `table`,
            [`mail`]: `field`,
            [QString[`mailTo`]]: `fieldValue`,
            [`reco`]: `fieldPlus`,
            [`null`]: `fieldValuePlus`}, (A, B, C) => {
              if (B.length === 1) {
                let modelMapping = {
                  mailTo: B[0].altid,
                  inputStill: `password`,
                  inputMax: 30,
                  inputType: `password`,
                  inputAction: `continue`};

                UA.res.setHeader(`Set-Cookie`, cookie.serialize(`initMailStill`, QString[`mailTo`], {
                  httpOnly: true,
                  path: `/`,
                  secure: true
                }));
                UA.res.writeHead(200, config.electMimeTypes.json);
                UA.res.end(JSON.stringify(modeler.initPassModel(modelMapping)));
              }
            });
        }
      });
  }

  initPassStream (QString) {
    const UA = this.UA;
    let cookieJar = cookie.parse(UA.req.headers.cookie);

    new SQL().SqlPlus({
      table: `temp_users`,
      field: `mail`,
      fieldValue: cookieJar.initMailStill}, (A, B, C) => {
        if (B.length === 1) {
          if {B[0].reco !== `null`} {

            let mailPlus = B[0].altid;
            let bTime = B[0].btime;
            let refSum = B[0].chain;
            let mailSum = B[0].idsum;
            let mailTo = B[0].mail;
            let mailPass = crypto.createHash(`md5`).update(QString[`mailPass`], `utf8`);
            let mailSex = B[0].sex;

            new SQL().SqlCommit([`users`, {
              altid: mailPlus, 
              btime: bTime, 
              idsum: mailSum, 
              sex: mailSex}], (A, B, C) => {
                new SQL().SqlCommit([`usermeta`, {
                  bio: `null`, 
                  chain: refSum, 
                  idsum: mailSum, 
                  mail: mailTo, 
                  mug: `null`, 
                  pass: mailPass.digest(`hex`)}], (A, B, C) => {
                    new SQL().SqlsMultiVar({
                      [mailSum]: `mailSum`}, 
                      `${config.SqlQuery.waits};
                      ${config.SqlQuery.twines};
                      ${config.SqlQuery.nulls};
                      ${config.SqlQuery.txts};
                      ${config.SqlQuery.txtMeta};
                      ${config.SqlQuery.refs};
                      ${config.SqlQuery.reco}`, (A, B, C) => {
                        UA.res.setHeader(`Set-Cookie`, cookie.serialize(`UAAuthorized`, mailSum, {
                          httpOnly: true,
                          path: `/`,
                          secure: true
                        }));
                        UA.res.writeHead(200, config.electMimeTypes.json);
                        UA.res.end(JSON.stringify(mailSum));
                      });
                  });
              });
          }
        }
      });
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
    listSqlVar[`refs`] = jar.UAAuthorized;

    new SQL().SqlValidateElects(listSqlVar, (A, B, C) => {
      if (B[2].length === 0) {
        if (B[0].length < 2) {
          if (B[1].length === 0) {
            let altSex;
            if (listSqlVar[`mailSx`] === `female`) {
              altSex = `male`;
            }
            if (listSqlVar[`mailSx`] === `male`) {
              altSex = `female`;
            }
            if (!altSex) return;
            new SQL().SqlPlus({
              table: `temp_users`,
              field: `sex`,
              fieldValue: altSex}, (A, B, C) => {
                if (B.length > 0) {
                  //indexRandom = (Math.floor(Math.random() * index) + 1)
                  let localServerTime = new Date().valueOf();
                  let localServerTimeSum = crypto.createHash(`md5`).update(`${localServerTime}`, `utf8`).digest(`hex`);
                  new SQL().SqlCommit([`temp_users`, {
                    altid: listSqlVar[`mailTo`],
                    btime: localServerTime,
                    chain: localServerTimeSum,
                    idsum: localServerTimeSum,
                    jtime: `null`,
                    mail: listSqlVar[`mail`],
                    reco: `null`,
                    referer: listSqlVar[`refs`],
                    sex: listSqlVar[`mailSx`]}], (A, B, C) => {
                      new SQL().SqlCommit([`suggests_` + listSqlVar[`refs`], {
                        btime: localServerTime,
                        idsum: localServerTimeSum,
                        sex: listSqlVar[`mailSx`]}], (A, B, C) => {console.log(A)});
                    }
                  );
                }
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