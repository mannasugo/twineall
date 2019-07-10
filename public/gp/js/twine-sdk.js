`use strict`;

const UARequestRouter = (function () {
  
  function UARequestRouter () {
    this.UARouteProtocol = (navigator.msie && intval(navigator.version) < 10) ? window.XDomainRequest : window.XMLHttpRequest;
    this.UAProto_ = new this.UARouteProtocol();
  }
  
  UARequestRouter.prototype = {
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
});

const UAModel = (function () {
  
  function UAModel () {
    this.appendString = ``;
  }
});

