'use strict';

const spawn = require('child_process').spawn;
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  const enableProxy = spawn('sudo', ['networksetup', '-setwebproxy', 'Wi-Fi', '127.0.0.1', '8888']);
  enableProxy.on('close', (code) => {
    console.log(`enabled proxy with code ${code}`);
  });

  mainWindow = new BrowserWindow({width: 1200, height: 800});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;

    const disableProxy = spawn('sudo', ['networksetup', '-setwebproxystate', 'Wi-Fi', 'off']);
    disableProxy.on('close', (code) => {
      console.log(`disabled proxy with code ${code}`);
    });
  });
});
