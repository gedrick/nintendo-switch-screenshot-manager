const mainWindowTemplate = {
  width: 700,
  height: 400,
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
    webSecurity: false
  },
  resizable: true
};

const updateWindowTemplate = {
  width: 800,
  height: 600,
  modal: true,
  autoHideMenuBar: true,
  resizable: false
};

export { mainWindowTemplate, updateWindowTemplate };
