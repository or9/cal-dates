const {
	app,
	BrowserWindow,
	ipcMain,
} = require('electron');
// const ipcApi = require("./ipcApi.js");
const path = require("path");
// const interceptor = require("./interceptorProxy.js");
// const ipcApi = getIpcApi();

import("./server.mjs")
	.then(startElectron)
	.catch((err) => {
		console.error("Failed to start server", err);
		process.exit(1);
	});

async function startElectron(importedServerModule) {
	await app.whenReady();

	createWindow();

	// interceptor.init();

	app.on('activate', createWindowOnActivate);

	function createWindow() {
		const win = new BrowserWindow({
			width: 1000,
			height: 800,
			webPreferences: {
				preload: path.join(__dirname, `preload.js`),
			}
		});

		// ipcMain.on("proxyRequest", ipcApi.proxyRequest);

		// win.loadFile(`index.html`);
		win.loadURL(`http://localhost:${importedServerModule.default.port}`);
	}

	function createWindowOnActivate() {
		// For OS X
		if (BrowserWindow.getAllWindows().length === 0) createWindow();		
	}
}

app.on(`window-all-closed`, quit);
app.on(`certificate-error`, handleCertificateError);

function handleCertificateError(event, webContents, url, error, certificate, callback) {
	event.preventDefault();
	return void callback(true);
}

function quit() {
	if (process.platform !== 'darwin') app.quit();
}

function getIpcApi() {
	return {
		proxyRequest,
	};
}

// function proxyRequest(requestOptions) {

// }