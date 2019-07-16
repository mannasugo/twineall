class ModelString {
  
  constructor() {
    this.appendString = ``;
  }
  
  modelStringify (model) {
    if (typeof model !== `object`) return;
    model.forEach( function (miniModel) {
      let a = miniModel.tag;
      let z = a;
      if (miniModel.tag_) a = miniModel.tag_;
      this.appendString += `<` + a;
      if (miniModel.flags) {
        for (let flag in miniModel.flags) {
          this.appendString += ` ` + flag + `='` + miniModel.flags[`flag`] + `'`;
        }
      }
      this.appendString += `>`;
      if (miniModel.closure) this.appendString += miniModel.closure;
      if (miniModel.tagChild) this.modelStringify(miniModel.tagChild);
      let queer = [`img`, `input`, `meta`];
      if (queer.indexOf(miniModel.tag) === -1) this.appendString += `</` + z + `>`; 
    });
    return this.appendString;
  }
}

module.exports = {

  modelStringify (model) {
    return new ModelString().modelStringify(model);
  },

  skeletal (mapping) {
    return [{
      tag: `html`, tag_: `!doctype html><html`, flags: {lang: `en`}, tagChild: [{
        tag: `head`, tagChild: [
          {tag: `meta`, flags: {charset: `utf-8`}},
          {tag: `title`, closure: mapping.title}, {tag: `meta`, flags: {
            name: `viewport`, content: `width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no`}
          }, {tag: `style`, flags: {type: `text/css`}, closure: mapping.styleText}]
      }, {tag: `body`, tagChild: mapping.appendModel}]
    }];
  },
  
  callFrame (mapping) {
    return this.modelStringify(this.skeletal(mapping));
  },

  welcome () {
    return {};
  },

  cookieModel (mapping) {
    return [{
      tag: `span`, flags: {id: `root`}, tagChild: [{tag: `span`: flags: {id: `skin-root`}, tagChild: mapping.appendModel}] 
    }, {tag: `script`, flags: {type: `text/javascript`}, closure: `sessionStorage.setItem('UAlet', '${mapping.UACookie}')`}, {
      tag: `scipt`, flags: {src: `/public/gp/js/twine-sdk.js`}
    }];
  },

  controlsModel () {
    return {};
  },

  contentModel (mapping) {
    return {
      tag: `main`, flags: {class: `_bMG`, style: `max-width: 100%`}, tagChild: [{
        tag: `section`, flags: {class: `_aGX`}, tagChild: [{
          tag: `span`, flags: {class: `_CSa`}, tagChild: mapping.appendModel
        }]
      }]
    };
  },

  chatOverview () {
    return {};
  }
};