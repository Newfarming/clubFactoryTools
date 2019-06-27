// 通过postMessage调用content-script
function invokeContentScript(code) {
	window.postMessage({ cmd: 'invoke', code: code }, '*');
}
// 发送普通消息到content-script
function sendMessageToContentScriptByPostMessage(data) {
	window.postMessage({ cmd: 'message', data: data }, '*');
}

// 通过DOM事件发送消息给content-script
(function () {
	var customEvent = document.createEvent('Event');
	customEvent.initEvent('myCustomEvent', true, true);
	// 通过事件发送消息给content-script
	function sendMessageToContentScriptByEvent(data) {
		data = data || '你好，我是injected-script!';
		var hiddenDiv = document.getElementById('myCustomEventDiv');
		hiddenDiv.innerText = data
		hiddenDiv.dispatchEvent(customEvent);
	}
	window.sendMessageToContentScriptByEvent = sendMessageToContentScriptByEvent;
})();

window.WebViewJavascriptBridge = {
	callHandler: function (parm1, parm2, parm3) {
		var data = {
			name: '打点',
			content: [parm1, parm2, parm3]
		}
		console.log(' 打点统计 ', parm1, parm2, parm3)
		try {
			top.postMessage({ cmd: 'dot', data: data }, '*');
			// window.postMessage(JSON.stringify({ cmd: 'dot', data: data }), '*');
			// chrome.runtime.sendMessage({ action: "append", obj: data });
		} catch (e) {

		}
	}
}

setTimeout(function () {
	window.WebViewJavascriptBridge = {
		callHandler: function (parm1, parm2, parm3) {
			var data = {
				name: '打点',
				content: [parm1, parm2, parm3]
			}
			console.log(' 打点统计 ', parm1, parm2, parm3)
			try {
				top.postMessage({ cmd: 'dot', data: data }, '*');
				// window.postMessage(JSON.stringify({ cmd: 'dot', data: data }), '*');
				// chrome.runtime.sendMessage({ action: "append", obj: data });
			} catch (e) {

			}
		}
	}
}, 3000)

console.log('injectJs')
