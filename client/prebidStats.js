function renderBtn() {
  const containerBtnEl = document.createElement("div");
  containerBtnEl.classList.add("modal-btn__wrapper");

  const modalOpenBtnEl = document.createElement("button");
  modalOpenBtnEl.classList.add("modal-btn__open");
  modalOpenBtnEl.textContent = "SHOW POPUP";

  containerBtnEl.append(modalOpenBtnEl);

  const backdropEl = document.createElement("div");
  backdropEl.classList.add("backdrop", "backdrop--hidden");

  const modalEl = document.createElement("div");
  modalEl.classList.add("card-modal");
  modalEl.style.overflowY = "auto";

  const closeBtnEl = document.createElement("button");
  closeBtnEl.classList.add("modal-btn__close");
  closeBtnEl.textContent = "X";

  const modalContEl = document.createElement("div");
  modalContEl.classList.add("card-modal__container");

  const navOrigBtnEl = document.createElement("button");
  navOrigBtnEl.classList.add("nav-btn");
  navOrigBtnEl.textContent = "Original configure";

  const navBiddersBtnEl = document.createElement("button");
  navBiddersBtnEl.classList.add("nav-btn");
  navBiddersBtnEl.textContent = "List of bidders";

  modalEl.append(navOrigBtnEl, navBiddersBtnEl, closeBtnEl, modalContEl);
  backdropEl.append(modalEl);

  document.body.append(containerBtnEl, backdropEl);
}

const refs = {};

export function initAPI() {
  const startIntervalId = setInterval(() => {
    if (window.googletag && googletag.apiReady) {
      clearInterval(startIntervalId);
      renderBtn();
      refs.openModalBtn = document.querySelector(".modal-btn__open");
      refs.openModalBtn.addEventListener("click", openModal);
      refs.closeModalBtn = document.querySelector(".modal-btn__close");
      refs.closeModalBtn.addEventListener("click", closeModal);
      refs.backdrop = document.querySelector(".backdrop");
      refs.modal = document.querySelector(".card-modal__container");
      refs.navBtn = document.querySelectorAll(".nav-btn");

      function openModal() {
        refs.backdrop.classList.remove("backdrop--hidden");
        document.body.style.overflow = "hidden";
        refs.navBtn[0].addEventListener("click", getOrigConfigure);
        refs.navBtn[1].addEventListener("click", getAuctionInfo);
        getOrigConfigure();
        refs.openModalBtn.disabled = true;
      }
      function closeModal() {
        refs.backdrop.classList.add("backdrop--hidden");
        document.body.style.overflow = "";
        refs.openModalBtn.disabled = false;
      }
      const { fetch: originalFetch } = window;

      window.fetch = async (...args) => {
        let [resource, config] = args;
        const response = await originalFetch(resource, config);

        try {
          await originalFetch("http://localhost:3000/", {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: resource,
          });
        } catch (error) {
          console.log("Error with intercepting:", error.message);
        }

        return response;
      };
    }
  }, 100);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function getOrigConfigure() {
  const slots = googletag.pubads().getSlots();
  const adUnits = pbjs.adUnits;
  const tableToRender = `<table class="table-stats">
        <tr>
          <th>Ad unit code</th>
          <th>Sizes</th>
          <th>Bidder</th>
          <th>Ad unit path</th>
        </tr>
      ${adUnits
        .map(
          ({ bids, code, mediaTypes }, index) =>
            `<tr>
              <td>${code}</td>
              <td>${
                mediaTypes.banner?.sizes.length
                  ? mediaTypes.banner.sizes
                      .map((size) => size.join("x"))
                      .join(", ")
                  : mediaTypes.video?.playerSize.length
                  ? mediaTypes.video.playerSize.map((size) => size).join("x")
                  : "No sizes provided"
              }</td>
              <td>${bids
                .map(({ bidder }) => bidder)
                .filter(onlyUnique)
                .join(", ")}</td>
                <td>${slots[index].getAdUnitPath()}</td>
            </tr>
          `
        )
        .join("")}
    </table>`;
  refs.navBtn[0].disabled = true;
  if (refs.navBtn[1].classList.contains("nav-btn__active")) {
    refs.navBtn[1].classList.remove("nav-btn__active");
  }
  refs.navBtn[1].disabled = false;
  refs.navBtn[0].classList.add("nav-btn__active");
  refs.modal.innerHTML = tableToRender;
}

function createTableFromArr(arr) {
  return `<table class="table-stats"><thead><tr><th>
   ${Object.keys(arr[0]).join("<th>")}
  </thead><tbody><tr><td>${arr
    .map((item) => Object.values(item).join("<td>"))
    .join("<tr><td>")}</table>`;
}

function getAuctionInfo() {
  refs.navBtn[0].disabled = false;
  refs.navBtn[0].classList.remove("nav-btn__active");
  refs.navBtn[1].disabled = true;
  refs.navBtn[1].classList.add("nav-btn__active");

  refs.modal.innerHTML = "";
  function forEach(responses, cb) {
    Object.keys(responses).forEach(function (adUnitCode) {
      var response = responses[adUnitCode];
      response.bids.forEach(function (bid) {
        cb(adUnitCode, bid);
      });
    });
  }
  let output = [];
  forEach(pbjs.getBidResponses(), function (_, bid) {
    output.push({
      bidder: bid.bidder,
      currency: bid.currency,
      cpm: bid.cpm.toFixed(3),
      size: bid.size,
    });
  });
  if (output.length) {
    refs.modal.innerHTML = createTableFromArr(output);
  } else {
    refs.modal.innerHTML =
      "<h3 style=color:white>There is no auction at this time. To see the bids, try again later.</h3>";
  }
}
