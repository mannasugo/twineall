`use strict`;

const UARequestRouter = (function () {
  /**
  * @constructor
  */
  
  function UARequestRouter () {
    this.UARouteProtocol = (navigator.msie && intval(navigator.version) < 10) ? window.XDomainRequest : window.XMLHttpRequest;
    this.UAProto_ = new this.UARouteProtocol();
  }
  
  UARequestRouter.prototype = {
    /**
     * @override
     */
    URLEncodedCourier: function (requestType, URL, requestData) {
      this.UAProto_.open(requestType, URL, true);
      this.UAProto_.setRequestHeader(`Content-Type`, `application/x-www-form-urlencoded`);
      this.UAProto_.onload = function () {
        requestData.handleRequest();
      };
      this.UAProto_.send(`${requestData.title}=${requestData.JSON}`);
    }
  };
  
  return UARequestRouter;
})();

const UAModel = (function () {
  
  function UAModel () {
    this.appendString = ``;
  }
  
  UAModel.prototype = {
    
    stackStringify: function (stack) {
      if (typeof stack !== `object`) return;
      stack.forEach(cluster => {
        let a = cluster.tag;
        let z = a;
        if (cluster.tag_) a = cluster.tag_;
        this.appendString += `<` + a;
        if (cluster.flags) {
          for (let flag in cluster.flags) {
            this.appendString += ` ${flag}='${cluster.flags[flag]}'`;
          }
        }
        this.appendString += `>`;
        if (cluster.closure) this.appendString += cluster.closure;
        if (cluster.tagChild) this.stackStringify(cluster.tagChild);
        let queer = [`img`, `input`, `meta`];
        if (queer.indexOf(cluster.tag) === -1) this.appendString += `</${z}>`;  
      });
      return this.appendString;
    }
  }
  
  return UAModel;
})();

const UAUtil = (function () {
  
  function UAUtil () {}
  
  UAUtil.prototype = {
    
    longMailTrim: function (longMail) {
      if (!longMail || longMail.length < 1 || longMail.match(/^(\s+)$/)) return;
      return longMail;
    },
    
    limitTrim: function (mail) {
      if (mail.length === 0 || mail.match(/^(\s+)$/) || mail.length > 30) return;
      return mail;
    },
    
    WSTrim: function (mail) {
      mail = mail.replace(/\s/g, ``);
      return mail;
    }
  }
  
  return UAUtil;
})();

const BlobViaHttp = (function () {

  function BlobViaHttp () {

    this.initProtocol = (navigator.msie && intval(navigator.version) < 10) ? window.XDomainRequest : window.XMLHttpRequest;
    this.Protocol = new this.initProtocol();
  }

  BlobViaHttp.prototype = {

    simpleBlob: function (blob, title, mailStack) {

      let Protocol = this.Protocol

      Protocol.open(`POST`, `/api/ua/`, true);
      Protocol.setRequestHeader(title, JSON.stringify(mailStack));
      Protocol.send(blob);
    }, 

    complexBlob: function () {}
  }

  return BlobViaHttp;
})();