const {basename} = require(`path`);
const {parse} = require(`querystring`);

const Util = require(`./twine-util`);

class RouteControl {
  
  router (req, res) {
    let url = (`./${req.url}`).replace(`//`, `/`).replace(/%(..)/g, function (match, hex) {
      return String.fromCharCode(parseInt(hex, 16))
    });

    let levels = url.split(`/`);
    let level = levels.length;
    let lastChar = url.charAt(url.length - 1);
    let levelState = basename(url);

    if (req.method === `GET` && req.url === `/`) {
      Util.UAPublic(``, req, res);
    }

    if (req.method === `POST` && req.url === `/api/ua/`) {
      let endData = ``;
      req.on(`data`, (data) => {
        endData += data;
      }).on(`end`, () => {Util.UAStream(parse(endData), req, res)});
    }

    if (level === 2 && lastChar !== `/` || level === 3 && lastChar === `/`) {
      Util.UAPublic(levelState, req, res);
    }
  }
}

module.exports = {
  router (req, res) {
    new RouteControl().router(req, res);
  }
}