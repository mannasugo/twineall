`use strict`;

function electsAuthorize () {
  const eleUASubmit = document.querySelector(`._GXe > ._THa`);

  eleUASubmit.addEventListener(`click`, function () {
    let UAStream  = new UARequestRouter();
    UAStream.URLEncodedCourier(`POST`, `/api/ua/`, {
      title: `electsAuthQ`,
      JSON: JSON.stringify({init: 0}),
      handleRequest: function () {
        if (UAStream.UAProto_.responseText.length < 1) return;
        let formModel = document.querySelector(`form`);
        formModel.innerHTML = new UAModel().stackStringify(JSON.parse(UAStream.UAProto_.responseText));
        electsMailCommit();
      }
    });
  });
}

function electsMailCommit () {
  let eleUASubmit = document.querySelector(`button`);
  let eleSubmitValueModel = eleUASubmit.parentNode.parentNode.querySelector(`textarea`);

  eleUASubmit.addEventListener(`click`, function (e) {
    e.preventDefault();
    if (!new UAUtil().longMailTrim(eleSubmitValueModel.value)) return;
    let UAStream = new UARequestRouter();
    UAStream.URLEncodedCourier(`POST`, `/api/ua/`, {
      title: `electsMailQ`,
      JSON: JSON.stringify({mailTo: new UAUtil().longMailTrim(eleSubmitValueModel.value)}),
      handleRequest: function () {
        if (UAStream.UAProto_.responseText.length < 1) return;
        let formModel = document.querySelector(`form`);
        formModel.innerHTML = new UAModel().stackStringify(JSON.parse(UAStream.UAProto_.responseText));
        electsPassCommit();
      }
    });
  });
}

function electsPassCommit () {
  let QModel = document.querySelector(`input`);

  if (QModel.getAttribute(`placeholder`) === `create password`) {
    document.querySelector(`button`).addEventListener(`click`, function (e) {
      e.preventDefault();
      let passTrim = new UAUtil().limitTrim(QModel.value);
      if (!passTrim) return;
      let UAStream = new UARequestRouter();
      UAStream.URLEncodedCourier(`POST`, `/api/ua/`, {
        title: `electsPassQ`,
        JSON: JSON.stringify({mailPass: new UAUtil().WSTrim(passTrim)}),
        handleRequest: function () {
          if (UAStream.UAProto_.responseText.length < 1) return;
        }
      });
    });
  }
}

electsAuthorize();