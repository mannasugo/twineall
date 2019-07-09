`use strict`;

const UARequestRouter = (function () {
  
  function UARequestRouter () {
    this.UARouteProtocol = (navigator.msie && intval(navigator.version) < 10) ? window.XDomainRequest : window.XMLHttpRequest;
    this.UAProto_ = new this.UARouteProtocol();
  }
  
  UARequestRouter.prototype = {
    URLEncodedCourier: function (requestType, URL, requestData) {
      
    }
  }
});