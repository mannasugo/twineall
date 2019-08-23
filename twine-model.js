class ModelString {
  
  constructor() {
    this.appendString = ``;
  }
  
  modelStringify (model) {
    if (typeof model !== `object`) return;
    model.forEach(miniModel => {
      let a = miniModel.tag;
      let z = a;
      if (miniModel.tag_) a = miniModel.tag_;
      this.appendString += `<` + a;
      if (miniModel.flags) {
        for (let flag in miniModel.flags) {
          this.appendString += ` ` + flag + `='` + miniModel.flags[flag] + `'`;
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

  modelString (model) {
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
    return this.modelString(this.skeletal(mapping));
  },

  welcome () {
    return {
      tag: `div`, flags: {class: `_UYq`}, tagChild: [{
        tag: `div`, flags: {class: `_FxQ`}, tagChild: [{
          tag: `div`, flags: {class: `_SyA _GTQ`}, tagChild: [{
            tag: `div`, flags: {class: `_UxE`}, tagChild: [{
              tag: `div`, flags: {class: `_UXa`}
            }, {
              tag: `form`, flags: {class: `_UGA`, autocomplete: `off`}, tagChild: [{
                tag: `span`, flags: {class: `_Ctx`}, closure: `twineall`
              }, {
                tag: `div`, flags: {class: `_cs_xq _rr_cc`}, tagChild: [{
                  tag: `div`, flags: {class: `_UFA`}, tagChild: [{
                    tag: `input`, flags: {class: `_RRD`, placeholder: `email`, type: `text`}
                  }]
                }, {
                  tag: `div`, flags: {class: `_UFA`}, tagChild: [{
                    tag: `input`, flags: {class: `_RRD`, placeholder: `password`, type: `password`}
                  }]
                }]
              }, {
                tag: `div`, flags: {class: `_FFe`}, tagChild: [{
                  tag: `button`, flags: {class: `RRc RRe GHc _bsZ`}, closure: `Sign in`
                }]
              }, {
                tag: `p`, flags: {class: `_GXe`}, tagChild: [{
                  tag: `a`, flags: {class: `_THa`, href: `javascript:;`}, closure: `Opt in With Email`
                }]
              }]
            }]
          }]
        }]
      }, {
        tag: `script`, flags: {src: `/public/gp/js/twine-sdk.js`}
      }, {
        tag: `script`, flags: {src: `/public/gp/js/twine-inactive.js`}
      }]
    };
  },

  initMailModel () {
    return [{
      tag: `div`, tagChild: [{
        tag: `div`, flags: {class: ``}, tagChild: [{
          tag: `textarea`, flags: {class: `_TxA`, autocomplete: `off`, placeholder: `Paste Email`}
        }]
      }, {
        tag: `div`, flags: {class: `_gcQ`}, tagChild: [{
          tag: `button`, flags: {class: `_bsZ`}, closure: `Validate Email`
        }]
      }]
    }];
  },

  initPassModel (mapping) {
    return [{
      tag: `span`, flags: {class: `_Ctx`}, closure: `twineall`,
    }, {
      tag: `div`, flags: {class: `_uHC`}, closure: `Welcome to twineall ${mapping.mailTo}, create your password to finish setup.`
    }, {
      tag: `div`, flags: {class: `_CsA`}, tagChild: [{
        tag: `div`, flags: {class: `_UFA`}, tagChild: [{
          tag: `input`, flags: {class: `_RRD`, placeholder: mapping.inputStill, maxlength: mapping.inputMax, type: mapping.inputType}
        }]
      }]
    }, {
      tag: `div`, flags: {class: `_FFe`}, tagChild: [{
        tag: `button`, flags: {class: `_bsZ`}, closure: mapping.inputAction
      }]
    }];
  }, 

  cookieModel (mapping) {
    return [{
      tag: `span`, flags: {id: `root`}, tagChild: [{tag: `span`, flags: {id: `skin-root`}, tagChild: mapping.appendModel}] 
    }, {tag: `script`, flags: {type: `text/javascript`}, closure: `sessionStorage.setItem('UAlet', '${mapping.UACookie}')`}, {
      tag: `script`, flags: {src: `/public/gp/js/twine-sdk.js`}}, {
        tag: `script`, flags: {src: `/public/gp/js/twine-active.js`}
    }];
  },

  controlsModel () {
    let listOptionsModel = [], listOptions = [`root`, `elect`, `twine`, `pools`, `mug`];
    listOptions.forEach((Option, index) => {
      listOptionsModel[index] = {tag: `div`, flags: {class: `_nFa`}, tagChild: [{
        tag: `a`, flags: {class: `_tTB ${Option}iconUA`, href: Option}, closure: Option }]};
    }); 
    return {
      tag: `div`, flags: {class: `_gDa`}, tagChild: [{
        tag: `div`, flags: {class: `_STa`}, tagChild: [{
          tag: `div`, flags: {class: `_gDE`}, tagChild: [{
            tag: `div`, flags: {class: `_gyQ`}, tagChild: listOptionsModel
          }]
        }]
      }]
    };
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
  },

  electsModel (listSex) {
    let electsAppendModel = [];
    for (let sex in listSex) {
      electsAppendModel[sex] = {
        tag: `div`, flags: {class: `_gHm`}, tagChild: [{
          tag: `div`, flags: {class: `_gC_a`}, tagChild: [{
            tag: `span`, flags: {class: `_txM`}, closure: `Suggest New ` + listSex[sex] + ` Member`
          }]
        }, {
          tag: `div`, flags: {class: `_gC_a`}, tagChild: [{
            tag: `div`, tagChild: [{
              tag: `input`, flags: {class: `_txQ`, placeholder: `email`, type: `text`}
            }]
          }, {
            tag: `div`, tagChild: [{
              tag: `div`, tagChild: [{
                tag: `input`, flags: {class: `_txQ`, placeholder: `name`, type: `text`}
              }]
            }]
          }]
        }, {
          tag: `div`, flags: {class: `_gC_`}, tagChild: [{
            tag: `div`, flags: {class: `_FFe`}, tagChild: [{
              tag: `button`, flags: {for: listSex[sex], class: `_bsZ`}, closure: `Suggest`
            }]
          }]
        }]
      };
    }
    return {tag: `div`, flags: {class: `_gHm`}, tagChild: electsAppendModel};
  },

  recoModel (recoMapping) {

    let listModel = [];

    recoMapping.forEach((reco, index) => {
      listModel[index] = {
        tag: `div`, flags: {class: `gC_a`}, tagChild: [{
          tag: `div`, flags: {class: `_gcQ _gMB`}, tagChild: [{
            tag: `div`, flags: {class: `_eYG`}, tagChild: [{
              tag: `div`, flags: {class: `_QxM`}, tagChild: [{
                tag: `span`, flags: {class: `_TZx _TXs`}, closure: reco.altid
              }]
            }, {
              tag: `span`, flags: {class: `_uHt`}, closure: `suggested by...`
            }]
          }, {
            tag: `div`, flags: {class: `_Bfa _QZg`}, tagChild: [{
              tag: `div`, flags: {class: `_gM_a _agM`}, tagChild: [{
                tag: `a`, flags: {for: reco.idsum, class: `_TX_a _atX`, href: `#`}, closure: `Approve`
              }]
            }]
          }]
        }]
      };
    });

    return {
      tag: `div`, flags: {class: `_gHm`}, tagChild: [{
        tag: `div`, flags: {class: `_gC_a`}, tagChild: [{
          tag: `span`, flags: {class: `_txM`}, closure: `Recommendation Requests`
        }]
      }, {
        tag: `div`, flags: {class: `_gC_a`}, tagChild: listModel
      }]
    };
  },

  immerseModel (mapping) {
    return [{
      tag: `div`, flags: {class: `_UQe`, flag: `hover`}, tagChild: [{
        tag: `div`, flags: {class: `_HUa`}
      }, {
        tag: `div`, flags: {class: `_UfX`, flag: `smallScreen`}, tagChild: [{
          tag: `div`, flags: {class: `_GXc`}, tagChild: [{
            tag: `section`, flags: {class: `_aGX`}, tagChild: mapping.appendModel
          }]
        }]
      }]
    }];
  },

  electsValidModel (electQString) {
    return {
      tag: `div`, flags: {class: `_gHm`}, tagChild: [{
        tag: `div`, flags: {class: `_gC_a`}, tagChild: [{
          tag: `div`, flags: {class: `eYG`}, tagChild: [{
            tag: `div`, flags: {class: `_QxM`}, tagChild: [{
              tag: `span`, flags: {class: `_TZx _TXs`}, closure: electQString.mailTo
            }]
          }, {
            tag: `span`, flags: {class: `_uHt`}, closure: `suggested by you`
          }]
        }]
      }, {
        tag: `div`, flags: {class: `_gC_a`}, tagChild: [{
          tag: `span`, flags: {class: `_TZx _TXs`}, closure: electQString.mail
        }]
      }, {
        tag: `div`, flags: {class: `_gC_a`}, tagChild: [{
          tag: `span`, flags: {class: `_TZx _TXs`}, closure: electQString.mailSx
        }]
      }, {
        tag: `div`, flags: {class: `_gC_a`}, tagChild: [{
          tag: `div`, flags: {class: `_FFe`}, tagChild: [{
            tag: `button`, flags: {class: `_bsZ`}, closure: `Validate`
          }]
        }]
      }]
    };
  }
};