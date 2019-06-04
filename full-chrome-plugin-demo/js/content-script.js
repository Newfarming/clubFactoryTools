﻿console.log('这是content script!');
// eval('(' + e.data.code + ')');

// executeScriptToCurrentTab('console.log("这是popup立即执行的代码")')
// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function () {
	// 注入自定义JS
	injectCustomJs();
	window.setCookie = function (name, value) {
		var Days = 30;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
		console.log("这是popup向当前页发送的执行代码")
	}

	window.setLogin = function (account, password) {
		console.log('account, password', account, password)
		// console.log('$', $)
		var loginInfo = account;
		var loginPwd = password;
		// if (!loginInfo) {
		// 	window.utils.toast.error('Please enter ' + $('.login-info').attr('placeholder'));
		// 	return false;
		// }

		// if (!loginPwd) {
		// 	window.utils.toast.error('Please enter password.');
		// 	return false;
		// }

		var isPhone = window.utils.validatePhone(loginInfo);
		var isEmail = window.utils.validateEmail(loginInfo);
		var isNum = window.utils.validateNumber(loginInfo);

		var loginType = isPhone ? 'Phone' : 'Email';

		// if (isNewVersion && !isPhone && isNum) {
		// 	window.utils.toast.error('Please enter a valid mobile number.');
		// 	return false;
		// } else if (!isNewVersion && !isEmail) {
		// 	window.utils.toast.error('Please enter a valid email.');
		// 	return false;
		// }

		// 如果全是数字那么走手机登录，否则邮箱登录,暂时不判断号码长度，因为不同国家的长度不一样，虽然现在只是在印度
		window.utils.ajax({
			type: 'POST',
			url: '/auth2/login-valid',
			data: {
				login_account: loginInfo,
				pwd: loginPwd,
				redirect: '/user_center'
			}
		}, function (error) {
			window.utils.GAEvents.GAMember('Login', 'Login with ' + loginType + ' & Failure:' + error);
		}, $(this)).then(function (resp) {
			if (resp) {
				console.log('登录成功')
				// 通知客户端更新性别，刷新分类等数据
				// if (resp.sex_change_result && resp.sex_change_result.changed) {
				// 	call_device("change_gender", resp.sex_change_result.gender)
				// }
				// var redirect_uri = resp.redirect_uri;
				// if (resp.should_associate) {
				// 	var queryString = location.search;
				// 	if (queryString) {
				// 		queryString += '&normal=1'
				// 	} else {
				// 		queryString = '?normal=1'
				// 	}
				// 	redirect_uri += queryString;
				// }
				// window.utils.GAEvents.GAMember('Login', 'Login with ' + loginType + ' & Success', function () {
				// 	redirectAfterSuccess(redirect_uri);
				// });
			}
		})
	}
	// document.setDD = 1
	// console.log('window.setCookie', window.setCookie)
	// console.log('document.setDD', document.setDD)
	// 给谷歌搜索结果的超链接增加 _target="blank"
	if (location.host == 'www.google.com.tw') {
		var objs = document.querySelectorAll('h3.r a');
		for (var i = 0; i < objs.length; i++) {
			objs[i].setAttribute('_target', 'blank');
		}
		console.log('已处理谷歌超链接！');
	}
	else if (location.host == 'www.baidu.com') {
		function fuckBaiduAD() {
			if (document.getElementById('my_custom_css')) return;
			var temp = document.createElement('style');
			temp.id = 'my_custom_css';
			(document.head || document.body).appendChild(temp);
			var css = `
			/* 移除百度右侧广告 */
			#content_right{display:none;}
			/* 覆盖整个屏幕的相关推荐 */
			.rrecom-btn-parent{display:none;}'
			/* 难看的按钮 */
			.result-op.xpath-log{display:none !important;}`;
			temp.innerHTML = css;
			console.log('已注入自定义CSS！');
			// 屏蔽百度推广信息
			removeAdByJs();
			// 这种必须用JS移除的广告一般会有延迟，干脆每隔一段时间清楚一次
			interval = setInterval(removeAdByJs, 2000);

			// 重新搜索时页面不会刷新，但是被注入的style会被移除，所以需要重新执行
			temp.addEventListener('DOMNodeRemoved', function (e) {
				console.log('自定义CSS被移除，重新注入！');
				if (interval) clearInterval(interval);
				fuckBaiduAD();
			});
		}
		let interval = 0;
		function removeAdByJs() {
			$('[data-tuiguang]').parents('[data-click]').remove();
		}
		fuckBaiduAD();
		initCustomPanel();
		initCustomEventListen();
	}
});

function initCustomPanel() {
	var panel = document.createElement('div');
	panel.className = 'chrome-plugin-demo-panel';
	panel.innerHTML = `
		<h2>injected-script操作content-script演示区：</h2>
		<div class="btn-area">
			<a href="javascript:sendMessageToContentScriptByPostMessage('你好，我是普通页面！')">通过postMessage发送消息给content-script</a><br>
			<a href="javascript:sendMessageToContentScriptByEvent('你好啊！我是通过DOM事件发送的消息！')">通过DOM事件发送消息给content-script</a><br>
			<a href="javascript:invokeContentScript('sendMessageToBackground()')">发送消息到后台或者popup</a><br>
		</div>
		<div id="my_custom_log">
		</div>
	`;
	// setTimeout(function () {
	document.body.appendChild(panel);
	console.log('panel', panel)
	// }, 2000)

}

// 向页面注入JS
function injectCustomJs(jsPath) {
	jsPath = jsPath || 'js/inject.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function () {
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.body.appendChild(temp);
}

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', request);
	if (request.cmd == 'update_font_size') {
		var ele = document.createElement('style');
		ele.innerHTML = `* {font-size: ${request.size}px !important;}`;
		document.head.appendChild(ele);
	}
	// if (request.cmd == 'setCookie') {
	// 	console.log('cookieSet')
	// 	setCookie(request.cookieName, request.cookieValue)
	// }
	else {
		tip(JSON.stringify(request));
		sendResponse('我收到你的消息了：' + JSON.stringify(request));
	}
});

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
function sendMessageToBackground(message) {
	chrome.runtime.sendMessage({ greeting: message || '你好，我是content-script呀，我主动发消息给后台！' }, function (response) {
		tip('收到来自后台的回复：' + response);
	});
}

// 监听长连接
chrome.runtime.onConnect.addListener(function (port) {
	console.log(port);
	if (port.name == 'test-connect') {
		port.onMessage.addListener(function (msg) {
			console.log('收到长连接消息：', msg);
			tip('收到长连接消息：' + JSON.stringify(msg));
			if (msg.question == '你是谁啊？') port.postMessage({ answer: '我是123！' });
		});
	}
});

window.addEventListener("message", function (e) {
	console.log('收到消息：', e.data);
	if (e.data && e.data.cmd == 'invoke') {
		eval('(' + e.data.code + ')');
	}
	else if (e.data && e.data.cmd == 'message') {
		tip(e.data.data);
	}
}, false);


function initCustomEventListen() {
	var hiddenDiv = document.getElementById('myCustomEventDiv');
	if (!hiddenDiv) {
		hiddenDiv = document.createElement('div');
		hiddenDiv.style.display = 'none';
		hiddenDiv.id = 'myCustomEventDiv';
		document.body.appendChild(hiddenDiv);
	}
	hiddenDiv.addEventListener('myCustomEvent', function () {
		var eventData = document.getElementById('myCustomEventDiv').innerText;
		tip('收到自定义事件：' + eventData);
	});
}

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
