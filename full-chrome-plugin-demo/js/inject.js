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
	// window.setCookie = function (name, value) {
	// 	var Days = 30;
	// 	var exp = new Date();
	// 	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	// 	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	// 	console.log("这是popup向当前页发送的执行代码")
	// 	console.log("name,value", name, value)
	// }

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
	callHandler: function () {
	}
}
console.log('injectJs')
