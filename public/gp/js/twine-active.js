function handleSuggests () {
  document.addEventListener(`submit`, function (e) {
    if (e.target.nodeName === `FORM`) e.preventDefault()
  });

  const listUASubmit = document.querySelectorAll(`button`);
  
  for (let ele = 0; ele < listUASubmit.length; ++ele) {
    listUASubmit[ele].addEventListener(`click`, function () {
      let electUAReq = {title: `electsQuery`};
      if (listUASubmit[ele].getAttribute(`for`)) {
        let listUAValues = listUASubmit[ele].parentNode.parentNode.parentNode.querySelectorAll(`input`);
        let listTrim = [];
        for (let UAValue = 0; UAValue < listUAValues.length; ++UAValue) {
          let trimUAValue = new UAUtil().longMailTrim(listUAValues[UAValue].value);
          (trimUAValue) ? listTrim[UAValue] = trimUAValue: listTrim = [];
        }
        if (listTrim.length === 2) {
          electUAReq[`JSON`] = {
            mail: listTrim[0],
            mailTo: listTrim[1],
            mailSx: listUASubmit[ele].getAttribute(`for`)
          };
          let UAREQ = new UARequestRouter();
          UAREQ.URLEncodedCourier(`POST`, `/api/ua/`, {
            title: electUAReq[`title`],
            JSON: JSON.stringify(electUAReq[`JSON`]),
            handleRequest: function () {
              if (UAREQ.UAProto_.responseText.length < 1) return;
              let eleRelative = document.body.appendChild(document.createElement(`div`));
              eleRelative.innerHTML = ``;
              eleRelative.innerHTML = new UAModel().stackStringify(JSON.parse(UAREQ.UAProto_.responseText));
              electsValid(electUAReq[`JSON`]);
            }
          });
        }
      }
    }) 
  }
}

function electsValid (elects) {
  document.addEventListener(`click`, function (e) {
    if (e.target.nodeName === `BUTTON` && e.target.innerHTML === `Validate`) {
      let UAStream = new UARequestRouter();
      UAStream.URLEncodedCourier(`POST`, `/api/ua/`, {
        title: `electsValidQ`,
        JSON: JSON.stringify(elects),
        handleRequest: () => {
          //
        }
      });
    }
  });
}

function recoApproval () {

  document.addEventListener(`click`, (e) => {
    if (e.target.hasAttribute(`for`) &&  e.target.innerHTML === `Approve`) {console.log(`w`)
      let UAStream = new UARequestRouter();
      UAStream.URLEncodedCourier(`POST`, `/api/ua/`, {
        title: `recoApproval`,
        JSON: JSON.stringify({
          recoSum: sessionStorage.UAlet, mailSum: e.target.getAttribute(`for`)}),
        handleRequest: () => {
          //
        }
      });
    }     
  });
}


function mugOptions () {

  document.addEventListener(`click`, (e) => {
    if (e.target.hasAttribute(`for`) &&  e.target.innerHTML === `Edit Profile`) {
      let UAStream = new UARequestRouter();
      UAStream.URLEncodedCourier(`POST`, `/api/ua/`, {
        title: `mugOptions`,
        JSON: JSON.stringify({
          /*recoSum: sessionStorage.UAlet, mailSum: e.target.getAttribute(`for`)*/}),
        handleRequest: () => {
         if (UAStream.UAProto_.responseText.length < 1) return;
          let eleRelative = document.body.appendChild(document.createElement(`div`));
          eleRelative.innerHTML = ``;
          immerseOff();
          eleRelative.innerHTML = new UAModel().stackStringify(JSON.parse(UAStream.UAProto_.responseText));
          handleMugOptions()
        }
      });
    }     
  });
}

function immerseOff () {
  
  let hover = document.querySelector(`div > [flag='hover']`);

  if (hover) {
    document.body.removeChild(hover.parentNode);
  }
}

function handleMugOptions () {

  document.querySelector(`._dVP > label`).addEventListener(`click`, e => {

    if (e.target.hasAttribute(`for`)) {

      if (e.target.hasAttribute(`get`) && e.target.getAttribute(`for`) === `file`) {
        document.querySelector(`#file`).setAttribute(`accept`, e.target.getAttribute(`get`));

        let fileStack = document.querySelector(`input#file`);

        //fileStack.value = ``;

        fileStack.addEventListener(`change`, (e) => {
          e.stopImmediatePropagation();
          immerseOff();
          imageRawTrim(fileStack.files);
        });
      }
    }
  });
}

function allocFile (img, file) {

  let alloc = new FileReader();

  alloc.onload = (e) => {
    img.src = e.target.result;
  };

  alloc.readAsDataURL(file);
}

function imageRawTrim (files) {

  if (!files || !files.length) return;

  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    if (!file.type.match(`image.*`) || file.size > 1048576) return;

    let image;

    if (!document.querySelector(`#img`)) {
      image = new Image();
      image.setAttribute(`id`, `img`);
    } else {
      image = document.querySelector(`#img`);
    }

    allocFile(image, file);

    image.onload = () => {

      let img_x = image.naturalWidth, img_y = image.naturalHeight;
      let left_x, left_y, dim_x, dim_y;

      let ratio_xy = img_x/img_y;

      if (ratio_xy > (360/640)) {
        left_y = 0;
        dim_y = img_y;
        dim_x = img_y * (360/640);
        left_x = (img_x - dim_x)/2;
      } else {
        left_x = 0;
        dim_x = img_x;
        dim_y = img_x * (640/360);
        left_y = (img_y - dim_y)/2;
      }

      let plane;

      if (!document.querySelector(`canvas`)) {
        plane = document.createElement(`canvas`);
      } else {
        plane = document.querySelector(`canvas`);
      }

      plane.width = dim_x, plane.height = dim_y;

      let canvas = plane.getContext(`2d`);
      canvas.drawImage(image, left_x, left_y, dim_x, dim_y, 0, 0, dim_x, dim_y);

      let imageData = plane.toDataURL(`image/jpeg`);
      let b64 = imageData.replace('data:image/jpeg;base64,',``);
      let binary = atob(b64);
      let array = [];

      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
  
      let blob = new Blob([new Uint8Array(array)], {type: file.type});

      new BlobViaHttp().simpleBlob(blob, `x-simpleHTTPBlob`, {
        mailSum: sessionStorage.UAlet,
        call: `PortfolioCrop`});
    };
          
  }
}

function twineVerify () {

  if (!document.querySelector(`.verifylighticonUA > span`)) return;

  document.querySelector(`.verifylighticonUA > span`).addEventListener(`click`, e => {
    
    //let twineStack = JSON.parse(sessionStorage.twineStack);

    let UAStream = new UARequestRouter();

    UAStream.URLEncodedCourier(`POST`, `/api/ua/`, {
      title: `twineVerify`,
      JSON: sessionStorage.twineStack,
      handleRequest: () => {

        if (UAStream.UAProto_.responseText.length < 1) return;

        let body = document.body;

        body.innerHTML = ``;
        body.innerHTML = new UAModel().stackStringify(JSON.parse(UAStream.UAProto_.responseText));
      }
    });    
  });
}

function initPoolsMessage () {

  document.addEventListener(`click`, (e) => {

    if (e.target.hasAttribute(`for`) &&  e.target.innerHTML === `Message`) {

      let HTTPS = new UARequestRouter();

      HTTPS.URLEncodedCourier(`POST`, `/api/ua/`, {
        title: `iniMessage`,
        JSON: JSON.stringify({
          mailSum: sessionStorage.UAlet, twineSum: e.target.getAttribute(`for`)}),
        handleRequest: () => {

          if (HTTPS.UAProto_.responseText.length < 1) return;

          history.pushState({}, `Matches`, `/pools/message`);

          document.body.innerHTML = ``;
          document.body.innerHTML = new UAModel().stackStringify(JSON.parse(HTTPS.UAProto_.responseText));
          textMail();
        }
      });
    }     
  });
}

function textMail () {

  let textMailer = document.querySelector(`button`);

  if (!textMailer.hasAttribute(`twineSum`)) return;

  let twineSum = textMailer.getAttribute(`twineSum`);

  let root = textMailer.parentNode.parentNode;

  let toMail = root.querySelector(`textarea`);

  textMailer.addEventListener(`click`, e => {

    if (!new UAUtil().longMailTrim(toMail.value)) return;

    let toMail_ = new UAUtil().longMailTrim(toMail.value);

    let HTTPS = new UARequestRouter();

      HTTPS.URLEncodedCourier(`POST`, `/api/ua/`, {
        title: `textMail`,
        JSON: JSON.stringify({
          mailSum: sessionStorage.UAlet,
          [`twineSum`]: twineSum, mail: toMail_}),
        handleRequest: () => {

          if (HTTPS.UAProto_.responseText.length < 1) return;

          history.pushState({}, `Matches`, `/pools/message`);

          document.body.innerHTML = ``;
          document.body.innerHTML = new UAModel().stackStringify(JSON.parse(HTTPS.UAProto_.responseText));
        }
      });
  });
}

handleSuggests();
recoApproval();
mugOptions();
twineVerify();
initPoolsMessage();
//i();