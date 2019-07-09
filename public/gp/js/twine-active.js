function handleSuggests () {
  document.addEventListener(`submit`, function (e) {
    if (e.target.nodeName === `FORM`) e.preventDefault()
  });

  const listUASubmit = document.querySelectorAll(`button`);
  
  for (let ele = 0; ele < listUASubmit.length; ++ele) {
    listUASubmit[ele].addEventListener(`click`, function () {
      let electUAReq = {title: `reqSgg`};
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
        }
      }
    }) 
  }
}