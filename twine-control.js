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

      let blob = new Buffer.alloc(+req.headers[`content-length`]);
      let endData = ``;
      let bufferOffset = 0;

      req.on(`data`, (data) => {

        data.copy(blob, bufferOffset);
        bufferOffset += data.length;
        endData += data;

      }).on(`end`, () => {

        if (req.headers[`x-simplehttpblob`]) {
          Util.blobViaHttps(blob, req.headers[`x-simplehttpblob`], req, res);
        } else {
          Util.UAStream(parse(endData), req, res);
        }
      });
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