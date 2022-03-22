// const {
// 	contextBridge,
// 	ipcRenderer,
// } = require('electron');
const pkg = require("./package.json");

window.addEventListener('DOMContentLoaded', domContentLoaded);

// setupContextBridge();

// function setupContextBridge() {
// 	contextBridge.exposeInMainWorld("appApi", {
// 		proxyRequest,
// 	});

// 	function proxyRequest(options = {}) {
// 		const requestOptions = getRequestOptions(options);

// 		ipcRenderer.send("proxyRequest", requestOptions);

// 		function getRequestOptions(requestOptions = {}) {
// 			if (typeof requestOptions === "string") {
// 				requestOptions = {
// 					url: requestOptions,
// 				};
// 			}

// 			return {
// 				...getDefaultRequestOptions(),
// 				...requestOptions,
// 			};
// 		}

// 		function getDefaultRequestOptions() {
// 			return {
// 				method: "GET",
// 				port: 443,
// 				protocol: "https",
// 				path: "/",
// 			};
// 		}
// 	}
// }

function domContentLoaded() {
	replaceText(`app-version`, pkg.version);

	[
		"chrome",
		"node",
		"electron",
	]
	.forEach((dependency) => {
		// replaceText(`${dependency}-version`, process.versions[dependency]);
		const version = process.versions[dependency];
		replaceText(`${dependency}-version`, version);
	})

	// For some reason, SVGs don't seem to load (at least from shadow DOM)
	// without removing and adding their href attribute....
	document
		.body
		.querySelectorAll(".coreui--icon__svg > use")
		.forEach(removeAndAddCoreuiAttrs);


	function replaceText(id, text) {
		const customElementRoot = document.getElementById("footer")?.shadowRoot;
		if (!customElementRoot) return;
		customElementRoot.getElementById(id).innerText = text;
	}


	function removeAndAddCoreuiAttrs (el) {
		const href = el.getAttribute("href");
		el.setAttribute("href", "");
		el.setAttribute("href", href);
	}

}
