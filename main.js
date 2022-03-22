const {
	app,
	BrowserWindow,
	// ipcMain,
} = require("electron");
// const ipcApi = require("./ipcApi.js");
const path = require("path");
// const interceptor = require("./interceptorProxy.js");
// const ipcApi = getIpcApi();
const logger = require("electron-log");
logger.transports.file.resolvePath = () => path.join(__dirname, 'logs/main.log');

// const {
// 	startServer,
// } = require("./local-server.js");

// startServer()
// 	.then(startElectron)
// 	.catch((err) => {
// 		logger.error("Failed to start server", err);
// 		// process.exit(1);
// 	});

import("./server.mjs")
	.then(startElectron)
	.catch((err) => {
		logger.error("Failed to start server", err);
		// process.exit(1);
	});
// startElectron();

// async function startElectron({ server, port, address }) {
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
		// win.loadURL(`http://localhost:${port}`);
	}

	function createWindowOnActivate() {
		// For OS X
		if (BrowserWindow.getAllWindows().length === 0) createWindow();		
	}
}

app.on(`window-all-closed`, quit);
app.on(`certificate-error`, handleCertificateError);

process.on(`SIGTRAP`, exit);
process.on(`SIGTERM`, exit);
process.on(`SIGINT`, exit);
process.on(`uncaughtException`, exit);

function exit (...args) {
	if (args[1] === "uncaughtException") {
		logger.error(args[0]);
		// process.exit(1);
	} else {
		logger.info(args[0]);
		// process.exit(0);
	}
}

function handleCertificateError(event, webContents, url, error, certificate, callback) {
	event.preventDefault();
	return void callback(true);
}

function quit() {
	logger.log("#app.on quit", arguments);
	if (process.platform !== 'darwin') app.quit();
}

function getIpcApi() {
	return {
		proxyRequest,
	};
}

// function proxyRequest(requestOptions) {

// }