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
    });
  }
}

class UACallsPublic extends Util2 {
  
  constructor (level, request, response) {
    super();
    this.levelState = level;
    this.UA = {req: request, res: response};
  }
  
  if (this.levelState === ``) this.handleRootCall();
  
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
        electModel = modeler.callFrame(modelMapping);
      } else {
        modelMapping[`appendModel`] = [modeler.prompt()];
        electModel = modeler.callFrame(modelMapping);
      }
      UA.res.writeHead(200, config.electMimeTypes.html);
      UA.res.end(electModel);
    });
  }
}