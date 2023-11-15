const CommonUtil = {
  enableIframe() {
    const iframe = document.querySelector(".cesium-infoBox-iframe")
    if (iframe) {
      iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-popups allow-forms")
      iframe.setAttribute("src", "")
    }
  },
}

export default CommonUtil
