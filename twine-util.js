const fs = require(`fs`);
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

  lapseString (time) {

    let then = new Date(parseInt(time)), lapse = (new Date - then)/1000, lapseString;

    if (lapse < 86400*5) {

      if (lapse >= 0) lapseString = Math.floor(lapse) + ` second`;

      if (lapse >= 60) lapseString = Math.floor(lapse/60) + ` minute`;

      if (lapse >= 3600) lapseString = Math.floor(lapse/3600) + ` hour`;

      if (lapse >= 86400) lapseString = Math.floor(lapse/86400) + ` day`;

      if (parseInt(lapseString) >= 2) lapseString = `${lapseString}s`;

      lapseString += ` ago`;
    } else {

      let listMonths = [
        `January`,
        `February`,
        `March`,
        `April`,
        `May`,
        `June`,
        `July`,
        `August`,
        `September`,
        `October`,
        `November`,
        `December`];

      lapseString = then.getDate() + ` ` + listMonths[then.getMonth()] + ` ` + then.getFullYear();
    }
    
    return lapseString;
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
    this.uniSql.end();
  }

  SqlPlus (electSqlVar, callback) {
    this.uniSql.query({
      sql: config.SqlQuery.getPlus,
      values: [electSqlVar.table, electSqlVar.field, electSqlVar.fieldValue]
    }, (A, B, C) => {callback(A, B, C)});
    this.uniSql.end();
  }

  SqlCommit (listSqlVar, callback) {
    this.uniSql.query({
      sql: config.SqlQuery.insert,
      values: listSqlVar}, (A, B, C) => {callback(A, B, C)});
    this.uniSql.end();
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

    if (this.levelState === `twine`) this.twineCall();

    if (this.levelState === `mug`) this.mugCall();

    if (this.levelState === `pools`) this.poolsCall();
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

      new SQL().SqlsMultiVar({
        [jar.UAAuthorized]: `refs`,
        [`recommends_` + jar.UAAuthorized]: `mailSum_Tab`, 
        [`temp_users`]: `mailSum_Tab_`, [`idsum`]: `field`},
        config.SqlQuery.getElects + `;` + config.SqlQuery.joinAny + `;`, (A, B, C) => {

          modelMapping = {
            title: `twineall - Nominate Member`,
            styleText: styleString,
            UACookie: jar.UAAuthorized,
            appendModel: ``,
          };

          if (B[0].length > 0 && B[0].length < 2) {

            let altSex; console.log(B)

            if (B[0][0].sex === `female`) {
              altSex = `male`;
            }

            if (B[0][0].sex === `male`) {
              altSex = `female`;
            }

            modelMapping[`appendModel`] = [modeler.electsModel([altSex,]), modeler.recoModel(B[1])];

          } else {
            modelMapping[`appendModel`] = [modeler.electsModel([`male`, `female`]), modeler.recoModel(B[1])];
          }

          modelMapping[`appendModel`] = [modeler.controlsModel(), modeler.contentModel(modelMapping)];
          modelMapping[`appendModel`] = modeler.cookieModel(modelMapping);
          electModel = modeler.callFrame(modelMapping);
          
          UA.res.writeHead(200, config.electMimeTypes.html);
          UA.res.end(electModel);
        });
    });
  }

  twineCall () {

    const UA = this.UA;
    const cJar = cookie.parse(UA.req.headers.cookie);

    this.modelStyler(config.CSSDeck + `user.css`, styleString => {

      new SQL().SqlPlus({
        table: `users`,
        field: `idsum`,
        fieldValue: cJar.UAAuthorized}, (A, B, C) => {

          if (B.length === 1) {

            let altSex;

            if (B[0].sex === `female`) {
              altSex = `male`;
            }

            if (B[0].sex === `male`) {
              altSex = `female`;
            }

            new SQL().SqlsMultiVar({
              [`temp_users`]: `tab`,
              [`awaits_` + cJar.UAAuthorized]: `tab_2`, 
              [`idsum`]: `field`, [`sex`]: `meta`, [altSex]: `metaValue`},
              config.SqlQuery.mismatchMultiMeta, (A, B, C) => {

                //let refSum = B[0].chain;

                let i = (Math.floor(Math.random() * B.length));

                let twineStack = B[i];

                new SQL().SqlPlus({
                  table: `usermeta`,
                  field: `mail`,
                  fieldValue: twineStack.mail}, (A, B, C) => {

                    twineStack[`portfolio`] = B[0].bio;
                    twineStack[`mailSum`] = B[0].idsum;

                    let modelMapping = {
                      title: `twineall`,
                      styleText: styleString,
                      twineMapping: twineStack,
                      UACookie: cJar.UAAuthorized,
                    };

                    modelMapping[`appendModel`] = [modeler.twineModel(modelMapping)];

                    UA.res.writeHead(200, config.electMimeTypes.html);
                    UA.res.end(modeler.callFrame(modelMapping));
                  });
              });
          }
      });
    });
  }

  mugCall () {

    const UA = this.UA;
    const cookieJar = cookie.parse(UA.req.headers.cookie);

    if (!cookieJar.UAAuthorized) return;

    this.modelStyler(config.CSSDeck + `user.css`, styleString => {

      new SQL().SqlsMultiVar({
        [`usermeta`]: `tab`, 
        [`users`]: `tab_2`, 
        [`idsum`]: `field`, [cookieJar.UAAuthorized]: `fieldValue`},
        config.SqlQuery.fieldMatch, (A, B, C) => {

          let modelMapping = { 
            title: B[0].altid,
            styleText: styleString,
            UACookie: cookieJar.UAAuthorized,
          };

          modelMapping[`appendModel`] = [modeler.mugModel()];
          modelMapping[`appendModel`] = [modeler.controlsModel(), modeler.contentModel(modelMapping), modeler.inputFileModel()];
          modelMapping[`appendModel`] = modeler.cookieModel(modelMapping);

          UA.res.writeHead(200, config.electMimeTypes.html);
          UA.res.end(modeler.callFrame(modelMapping))
      });
    });
  }

  poolsCall () {

    const cJar = cookie.parse(this.UA.req.headers.cookie);

    if (!cJar.UAAuthorized) return;

    this.modelStyler(config.CSSDeck + `user.css`, styleString => {

      new SQL().SqlsMultiVar({
        [`accepts_` + cJar.UAAuthorized]: `tab`, 
        [`users`]: `tab_2`, 
        [`idsum`]: `field`}, config.SqlQuery.tabCross, (A, B, C) => {

          let modelMapping = { 
            title: `Matches`,
            styleText: styleString,
            UACookie: cJar.UAAuthorized,
            poolsStack: B
          };

          modelMapping[`appendModel`] = [modeler.poolsModel(modelMapping)];
          modelMapping[`appendModel`] = [modeler.controlsModel(), modeler.contentModel(modelMapping)];
          modelMapping[`appendModel`] = modeler.cookieModel(modelMapping);

          this.UA.res.writeHead(200, config.electMimeTypes.html);
          this.UA.res.end(modeler.callFrame(modelMapping))
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
    if (this.qString.passValid) {
      this.passValid(JSON.parse(this.qString.passValid));
    }

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

    if (this.qString.recoApproval) {
      this.recoApprovalStream(JSON.parse(this.qString.recoApproval));
    }

    if (this.qString.mugOptions) {
      this.mugOptionsStream(JSON.parse(this.qString.mugOptions));
    }

    if (this.qString.twineVerify) {
      this.twineVerify(JSON.parse(this.qString.twineVerify));
    }

    if (this.qString.iniMessage) {
      this.iniPoolMessage(JSON.parse(this.qString.iniMessage));
    }  

    if (this.qString.textMail) {
      this.textMail(JSON.parse(this.qString.textMail));
    }   
  }

  passValid (QString) {

    const UA = this.UA;

    new SQL().SqlPlus({
      table: `usermeta`,
      field: `mail`,
      fieldValue: QString[`mailTo`]}, (A, B, C) => {
        if (B.length === 1) {
          let hexPass = crypto.createHash(`md5`).update(QString[`mailPass`], `utf8`);
          if (B[0].pass === hexPass.digest(`hex`)) {
            UA.res.setHeader(`Set-Cookie`, cookie.serialize(`UAAuthorized`, B[0].idsum, {
              httpOnly: true,
              path: `/`,
              secure: true,
            }));
            UA.res.writeHead(200, config.electMimeTypes.json);
            UA.res.end(JSON.stringify(B[0].idsum));
          }
        }
      });
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
          new SQL().SqlPlus({
            table: `temp_users`,
            field: `mail`,
            fieldValue: QString[`mailTo`]}, (A, B, C) => {
              if (B.length === 1 && B[0].reco !== `null`) {
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
          if (B[0].reco !== `null`) {

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
            let refSum = B[3][0].chain;
            new SQL().SqlPlus({
              table: `users`,
              field: `sex`,
              fieldValue: altSex}, (A, B, C) => {console.log(B)
                if (B.length > 0) {
                  let i, recoSum;
                  i = (Math.floor(Math.random() * B.length)); console.log(typeof i)
                  if (typeof i !== `number`) return;
                  recoSum = B[i].idsum; console.log(recoSum)
                  //indexRandom = (Math.floor(Math.random() * index) + 1)
                  let localServerTime = new Date().valueOf();

                  let localServerTimeSum = crypto.createHash(`md5`).update(`${localServerTime}`, `utf8`).digest(`hex`);

                  new SQL().SqlCommit([`temp_users`, {
                    altid: listSqlVar[`mailTo`],
                    btime: localServerTime,
                    chain: refSum,//@initCommit -> localServerTimeSum,
                    idsum: localServerTimeSum,
                    jtime: `null`,
                    mail: listSqlVar[`mail`],
                    reco: `null`,
                    referer: listSqlVar[`refs`],
                    sex: listSqlVar[`mailSx`]}], (A, B, C) => {
                      new SQL().SqlCommit([`suggests_` + listSqlVar[`refs`], {
                        btime: localServerTime,
                        idsum: localServerTimeSum,
                        sex: listSqlVar[`mailSx`]}], (A, B, C) => {
                          new SQL().SqlCommit([`recommends_` + recoSum, {
                            btime: localServerTime, 
                            idsum: localServerTimeSum, 
                            sex: listSqlVar[`mailSx`]}], (A, B, C) => {});
                        });
                    }
                  );
                }
              });
          }
        }
      }
    });
  }

  recoApprovalStream (QString) {

    new SQL().SqlPlus({
      table: `recommends_` + QString[`recoSum`],
      field: `idsum`,
      fieldValue: QString[`mailSum`]}, (A, B, C) => {

        if (B.length === 1) {
          new SQL().SqlsMultiVar({
            [`temp_users`]: `mailSum_Tab`,
            [`reco`]: `field`, [QString[`recoSum`]]: `fieldValue`,
            [`idsum`]: `field_2`, [QString[`mailSum`]]: `fieldValue_2`},
            config.SqlQuery.fieldValueAlterMono, (A, B, C) => {

              new SQL().SqlsMultiVar({
                [`recommends_` + QString[`recoSum`]]: `mailSum_Tab`,
                [`idsum`]: `field`, [QString[`mailSum`]]: `fieldValue`},
                config.SqlQuery.deleteCol, (A, B, C) => {});
            });
        }
      });
  }

  mugOptionsStream (QString) {

    const UA = this.UA;
    const cookieJar = cookie.parse(UA.req.headers.cookie);

    if (!cookieJar.UAAuthorized) return;

    let modelMapping = {
      appendModel: modeler.editModel()
    };

    UA.res.writeHead(200, config.electMimeTypes.json);
    UA.res.end(JSON.stringify(modeler.immerseModel(modelMapping)));
  }

  twineShuffle (mailSum) {

    new SQL().SqlPlus({
      table: `users`,
      field: `idsum`,
      fieldValue: mailSum}, (A, B, C) => {

        if (B.length === 1) {

          let altSex;

          if (B[0].sex === `female`) {
            altSex = `male`;
          }

          if (B[0].sex === `male`) {
            altSex = `female`;
          }

          new SQL().SqlsMultiVar({
            [`temp_users`]: `tab`,
            [`awaits_` + mailSum]: `tab_2`, 
            [`idsum`]: `field`, [`sex`]: `meta`, [altSex]: `metaValue`},
            config.SqlQuery.mismatchMultiMeta, (A, B, C) => {

                //let refSum = B[0].chain;

            let i = (Math.floor(Math.random() * B.length));

            let twineStack = B[i];

            new SQL().SqlPlus({
              table: `usermeta`,
              field: `mail`,
              fieldValue: twineStack.mail}, (A, B, C) => {

                twineStack[`portfolio`] = B[0].bio;
                twineStack[`mailSum`] = B[0].idsum;

                let modelMapping = {
                  twineMapping: twineStack,
                  UACookie: mailSum};

                this.UA.res.writeHead(200, config.electMimeTypes.json);
                this.UA.res.end(JSON.stringify(modeler.twineModel(modelMapping)));
                  });
              });
          }
      });
  }

  twineVerify (QString) {

    let cJar = cookie.parse(this.UA.req.headers.cookie);

    if (!cJar.UAAuthorized) return;

    new SQL().SqlCommit([`awaits_` + QString[`mailSum`], {
      idsum: QString[`twineSum`]}], (A, B, C) => {

        new SQL().SqlPlus({
          table: `awaits_` + QString[`twineSum`], 
          field: `idsum`, fieldValue: QString[`mailSum`]}, (A, B, C) => {

            if (B.length > 0) {

              new SQL().SqlCommit([`accepts_` + QString[`mailSum`], {
                idsum: QString[`twineSum`]}], (A, B, C) => {

                new SQL().SqlCommit([`accepts_` + QString[`twineSum`], {
                  idsum: QString[`mailSum`]}], (A, B, C) => this.twineShuffle(QString[`mailSum`]))
                });
            } else {

              this.twineShuffle(QString[`mailSum`])
            }
          });
      });
  }

  iniPoolMessage (QString) {

    let cJar = cookie.parse(this.UA.req.headers.cookie);

    if (!cJar.UAAuthorized) return;

    new SQL().SqlPlus({
      table: `textchain_` + QString[`twineSum`],
      field: `idsum`,
      fieldValue: QString[`mailSum`]}, (A, B, C) => {

        let txtStack = B;

        new SQL().SqlPlus({
          table: `textchain_` + QString[`mailSum`],
          field: `idsum`,
          fieldValue: QString[`twineSum`]}, (A, B, C) => {

            txtStack = txtStack.concat(B); console.log(txtStack);

            if (txtStack.length > 0) {

              txtStack.sort((a,b) => {
                return (a.ptime - b.ptime)});
            }

            let modelMapping = {
              twineStack: txtStack,
              mailSum: QString[`mailSum`],
              twineSum: QString[`twineSum`],
              twineSums: JSON.stringify({
                mailSum: QString[`mailSum`],
                twineSum: QString[`twineSum`]})};

            this.UA.res.writeHead(200, config.electMimeTypes.json);
            this.UA.res.end(JSON.stringify([modeler.poolTextModel(modelMapping)]));
          });
      });
  }

  textMail (QString) {

    let cJar = cookie.parse(this.UA.req.headers.cookie);

    if (!cJar.UAAuthorized) return;

    let localServerTime = new Date().valueOf();

    let localServerTimeSum = crypto.createHash(`md5`).update(`${localServerTime}`, `utf8`).digest(`hex`);

    new SQL().SqlCommit([`textchain_` + QString[`mailSum`], {
      idsum: QString[`twineSum`],
      ptime: localServerTime,
      idsum2: QString[`mailSum`],
      txtstring: QString[`mail`],
      txtstring_hash: localServerTimeSum}], (A, B, C) => this.iniPoolMessage(QString));
  }
}

class blobViaHttps {

  constructor (blob, meta, req, res) {
    this.blob = blob;
    this.meta = JSON.parse(meta);
    this.app = {fro: req, to: res};
  }

  blobCalls () {

    if (this.meta.call === `PortfolioCrop`) this.portfolioCrop();
  }


  portfolioCrop () {

    let cJar = cookie.parse(this.app.fro.headers.cookie);

    if (!cJar.UAAuthorized) return;

    const u = config.portfolio + cJar.UAAuthorized + `/`;

    fs.mkdir(u, {recursive: true}, (err) => {

      const localServerTime = new Date().valueOf();

      fs.writeFile(u + localServerTime + `.jpg`, this.blob, err => {

        new SQL().SqlsMultiVar({
          [`usermeta`]: `mailSum_Tab`,
          [`bio`]: `field`, [localServerTime + `.jpg`]: `fieldValue`,
          [`idsum`]: `field_2`, [cJar.UAAuthorized]: `fieldValue_2`},
            config.SqlQuery.fieldValueAlterMono, (A, B, C) => {

              this.app.to.writeHead(200, config.electMimeTypes.json);
              this.app.to.end(`200`);
            });

      });
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
  blobViaHttps (blobStack, meta, req, res) {
    new blobViaHttps(blobStack, meta, req, res).blobCalls();
  },
  Mysql () {
    new SQL().SqlSource();
  },

  lapse: (time) => new Util2().lapseString(time),
};