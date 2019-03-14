const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({ width: 800, height: 600});
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.maximize();

    globalShortcut.register('f5', function() {
        mainWindow.reload();
    });

    globalShortcut.register('f11', function() {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });

    mainWindow.loadURL(
        process.env.ELECTRON_START_URL ||
        url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true,
        })
    );

    mainWindow.on('closed', () => {mainWindow = null})
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});