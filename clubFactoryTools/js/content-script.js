console.log('这是content script!');
// eval('(' + e.data.code + ')');

// executeScriptToCurrentTab('console.log("这是popup立即执行的代码")')
// 注意，必须设置了run_at=document_start 此段代码才会生效
window.setCookie = function (name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	console.log("这是popup向当前页发送的执行代码")
}
window.CFappLogin = function (loginInfo, loginPwd) {
	console.log('loginInfo, loginPwd ', loginInfo, loginPwd)
	$.ajax({
		type: 'POST',
		url: '/auth2/login-valid',
		data: {
			login_account: loginInfo,
			pwd: loginPwd,
			redirect: '/user_center'
		}
	}, function (error) {

		alert('登录失败')
	}, $(this)).then(function (resp) {
		console.log('登录失败')
	})
}
window.CFmSiteLogin = function (loginInfo, loginPwd) {
	$.ajax({
		url: '/api/v2/auth/login/',
		type: 'POST',
		data: {
			email_addr: loginInfo,
			email_passwd: loginPwd,
			login_type: 3
		},
		success: function (result) {
			console.log('result', result)
			var userProfile = result.body.user_profile
			var authorization = result.body.authorization
			userProfile['authorization'] = authorization
			if (userProfile) {
				localStorage.setItem('user', JSON.stringify(userProfile))
			} else {
				localStorage.removeItem('user')
			}

			if (userProfile.sex) {
				localStorage.setItem('gender', userProfile.sex)
			}
			window.location.reload()
			console.log('登录成功')
		}
	})
}

window.CFhibossLogin = function (loginInfo, loginPwd) {

}
document.addEventListener('DOMContentLoaded', function () {
	// 注入自定义JS
	injectCustomJs();
	window.addEventListener("message", function (e) {
		console.log('收到消息：', e.data);
		if (e.data && e.data.cmd == 'invoke') {
			eval('(' + e.data.code + ')');
		}
		else if (e.data && e.data.cmd == 'message') {
			tip(e.data.data);
		}
		else if (e.data && e.data.cmd == 'dot') {
			this.console.log('dot e.data 74 ', e.data)
			// try {
			chrome.runtime.sendMessage({ action: "append", obj: e.data });
			// } catch (e) {

			// }
		}
	}, false);
});

// function initCustomPanel() {
// 	var panel = document.createElement('div');
// 	panel.className = 'chrome-plugin-demo-panel';
// 	panel.innerHTML = `
// 		<h2>injected-script操作content-script演示区：</h2>
// 		<div class="btn-area">
// 			<a href="javascript:sendMessageToContentScriptByPostMessage('你好，我是普通页面！')">通过postMessage发送消息给content-script</a><br>
// 			<a href="javascript:sendMessageToContentScriptByEvent('你好啊！我是通过DOM事件发送的消息！')">通过DOM事件发送消息给content-script</a><br>
// 			<a href="javascript:invokeContentScript('sendMessageToBackground()')">发送消息到后台或者popup</a><br>
// 		</div>
// 		<div id="my_custom_log">
// 		</div>
// 	`;
// 	// setTimeout(function () {
// 	document.body.appendChild(panel);
// 	console.log('panel', panel)
// 	// }, 2000)

// }

// 向页面注入JS
function injectCustomJs(jsPath) {
	jsPath = jsPath || 'js/inject.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	try {
		temp.src = chrome.extension.getURL(jsPath);
	} catch (e) {

	}
	temp.onload = function () {
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.body.appendChild(temp);
}

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	// console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', request);
	if (request.action === 'stop') {
		console.log('------------------------以下是打点记录-------------------------')
		request.data.forEach((value, key) => {
			console.log(JSON.stringify(value.data.content))
		});
		console.log('----------------------------------------------------------------------')
	}
	// if (request.cmd == 'update_font_size') {
	// 	var ele = document.createElement('style');
	// 	ele.innerHTML = `* {font-size: ${request.size}px !important;}`;
	// 	document.head.appendChild(ele);
	// }
	// if (request.cmd == 'setCookie') {
	// 	console.log('cookieSet')
	// 	setCookie(request.cookieName, request.cookieValue)
	// }
	// else {
	tip(JSON.stringify(request));
	sendResponse('我收到你的消息了：' + JSON.stringify(request));
	// }
});

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
// function sendMessageToBackground(message) {
// 	chrome.runtime.sendMessage({ greeting: message || '你好，我是content-script呀，我主动发消息给后台！' }, function (response) {
// 		tip('收到来自后台的回复：' + response);
// 	});
// }

// 监听长连接
// chrome.runtime.onConnect.addListener(function (port) {
// 	console.log(port);
// 	if (port.name == 'test-connect') {
// 		port.onMessage.addListener(function (msg) {
// 			console.log('收到长连接消息：', msg);
// 			tip('收到长连接消息：' + JSON.stringify(msg));
// 			if (msg.question == '你是谁啊？') port.postMessage({ answer: '我是123！' });
// 		});
// 	}
// });




// function initCustomEventListen() {
// 	var hiddenDiv = document.getElementById('myCustomEventDiv');
// 	if (!hiddenDiv) {
// 		hiddenDiv = document.createElement('div');
// 		hiddenDiv.style.display = 'none';
// 		hiddenDiv.id = 'myCustomEventDiv';
// 		document.body.appendChild(hiddenDiv);
// 	}
// 	hiddenDiv.addEventListener('myCustomEvent', function () {
// 		var eventData = document.getElementById('myCustomEventDiv').innerText;
// 		tip('收到自定义事件：' + eventData);
// 	});
// }

var tipCount = 0;
// 简单的消息通知
function tip(info) {
	info = info || '';
	var ele = document.createElement('div');
	ele.className = 'chrome-plugin-simple-tip slideInLeft';
	ele.style.top = tipCount * 70 + 20 + 'px';
	ele.innerHTML = `<div>${info}</div>`;
	document.body.appendChild(ele);
	ele.classList.add('animated');
	tipCount++;
	setTimeout(() => {
		ele.style.top = '-100px';
		setTimeout(() => {
			ele.remove();
			tipCount--;
		}, 400);
	}, 3000);
}
