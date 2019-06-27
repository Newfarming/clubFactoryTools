$(function () {

	// 加载设置
	var defaultConfig = { color: 'white' }; // 默认配置
	chrome.storage.sync.get(defaultConfig, function (items) {
		document.body.style.backgroundColor = items.color;
	});

	// 初始化国际化
	// $('#test_i18n').html(chrome.i18n.getMessage("helloWorld"));

});

var bol = ''
var url = 'http://pre-pwa.clubfactory.com/home'

var loginQrEle = document.getElementById('login_qr_box')
function makeCode(qrEle, qrText) {

	console.log('qrEle qrText', qrEle, qrText)
	qrEle.innerHTML = ' '
	var qrcode = new QRCode(qrEle, {
		width: 100,
		height: 100
	});
	qrcode.makeCode(qrText);
}
function loginInit() {
	var qrword = url
	makeCode(loginQrEle, qrword)
}
loginInit()
$('.cf-item-title').click(function () {
	$('.item-content').hide()
	$(this).parent().find('.item-content').show()
})
$('#web_login_select').change(function (e) {
	// console.log('e.target.value', e.target.value)
	var value = e.target.value
	var site = ''
	if (value === 'Hiboss') {
		$('#hiboss_login_select').show()
		$('#m_login_select').hide()
		$('#app_login_select').hide()
		$('#loginBox').hide()
		site = $('#hiboss_login_select').val()
		url = 'https://' + site + '.hibossapp.com/home/#/'
	} else if (value === 'ClubFactoryMsite') {
		$('#app_login_select').hide()
		$('#m_login_select').show()
		$('#hiboss_login_select').hide()
		$('#loginBox').show()

		site = $('#m_login_select').val()
		url = 'http://' + site + '.clubfactory.com/home'
	} else if (value === 'ClubFactoryApp') {
		$('#hiboss_login_select').hide()
		$('#m_login_select').hide()
		$('#app_login_select').show()
		$('#loginBox').show()
		site = $('#app_login_select').val()
		url = 'http://' + site + '.fromfactory.club/product_list#/'
	}
	makeCode(loginQrEle, url)
})
$('#app_login_select').change(function (e) {
	var site = e.target.value
	url = 'http://' + app_site + '.fromfactory.club/product_list#/'
	makeCode(loginQrEle, url)
})
$('#m_login_select').change(function (e) {
	var site = e.target.value
	url = 'http://' + site + '.clubfactory.com/home'
	makeCode(loginQrEle, url)
})
$('#hiboss_login_select').change(function (e) {
	var site = e.target.value
	url = 'https://' + site + '.hibossapp.com/home/#/'
	makeCode(loginQrEle, url)
})
$('#jump_login_url').click(function () {
	// var url = ''
	bol = $('#web_login_select').val()
	var site = ''
	if (bol === 'ClubFactoryApp') {
		site = $('#app_login_select').val()
		url = 'http://' + app_site + '.fromfactory.club/user_center'
	} else if (bol === 'ClubFactoryMsite') {
		site = $('#m_login_select').val()
		url = 'http://' + site + '.clubfactory.com/home'
	} else if (bol === 'Hiboss') {
		site = $('#hiboss_login_select').val()
		url = 'https://' + site + '.hibossapp.com/home/#/'
	}
	window.open(chrome.extension.getURL(url));
})
$('#jump_url').click(function () {

	bol = $('#web_login_select').val()
	var site = ''
	if (bol === 'ClubFactoryApp') {
		site = $('#app_login_select').val()
		url = 'http://' + app_site + '.fromfactory.club/product_list#/'
	} else if (bol === 'ClubFactoryMsite') {
		site = $('#m_login_select').val()
		url = 'http://' + site + '.clubfactory.com/home'
	} else if (bol === 'Hiboss') {
		site = $('#hiboss_login_select').val()
		url = 'https://' + site + '.hibossapp.com/home/#/'
	}
	window.open(chrome.extension.getURL(url));
})
$('#set_cookie').click(function () {

	var name = $('#set_cookie_name').val();
	var value = $('#set_cookie_value').val()
	executeScriptToCurrentTab(`setCookie('${name}','${value}')`)
	// setCookie(name, value)
	// $('#set_cookie_name').val('');
	// $('#set_cookie_value').val('');
	// console.log('setCookie ', $('#set_cookie_name'))
})
$('#url_qr_input').change(function (e) {
	console.log('e.target', e.target)
	var urlQrEle = document.getElementById('url_qr_box')
	makeCode(urlQrEle, e.target.value)
})
$('#url_qr_input').keyup(function (e) {
	console.log('e.target', e.target)
	var urlQrEle = document.getElementById('url_qr_box')
	makeCode(urlQrEle, e.target.value)
})
$('#decodeUrl').click(function () {
	var val = $('#code_input').val()
	var decodeVal = decodeURIComponent(val)
	console.log('decodeVal ', decodeVal)
	alert('解码结果为：' + decodeVal)
	// document.getElementById('code_box').innerHTML = decodeVal
	// $('#code_box').html(decodeVal)
})
$('#encodeUrl').click(function () {
	var val = $('#code_input').val()
	var encodeVal = encodeURIComponent(val)
	console.log('encodeVal ', encodeVal)
	alert('转码结果为：' + encodeVal)
	// document.getElementById('code_box').innerHTML = encodeVal
})
// $('#login_btn').click(function () {
// 	var name = $('#set_cookie_name').val();
// 	var value = $('#set_cookie_value').val()
// 	// executeScriptToCurrentTab(`setCookie('${name}','${value}')`)
// 	// setCookie(name, value)
// 	// $('#set_cookie_name').val('');
// 	// $('#set_cookie_value').val('');
// 	// console.log('setCookie ', $('#set_cookie_name'))
// })
// 登录
$('#login_btn').click(function () {
	var loginInfo = $('#login_name').val();
	var loginPwd = $('#login_value').val()
	bol = $('#web_login_select').val()
	console.log(' loginInfo,loginPwd,bol', loginInfo, loginPwd, bol)
	if (bol === 'ClubFactoryApp') {
		executeScriptToCurrentTab(`CFappLogin('${loginInfo}','${loginPwd}')`)
	} else if (bol === 'ClubFactoryMsite') {
		executeScriptToCurrentTab(`CFmSiteLogin('${loginInfo}','${loginPwd}')`)
	} else if (bol === 'Hiboss') {
		executeScriptToCurrentTab(`CFhibossLogin('${loginInfo}','${loginPwd}')`)
	}
	// if (!loginInfo) {
	// 	window.utils.toast.error('Please enter ' + $('.login-info').attr('placeholder'));
	// 	return false;
	// }

	// if(!loginPwd){
	// 	window.utils.toast.error('Please enter password.');
	// 	return false;
	// }

	// var isPhone = window.utils.validatePhone(loginInfo);
	// var isEmail = window.utils.validateEmail(loginInfo);
	// var isNum = window.utils.validateNumber(loginInfo);

	// var loginType = isPhone ? 'Phone': 'Email';

	// if(isNewVersion && !isPhone && isNum){
	// 	window.utils.toast.error('Please enter a valid mobile number.');
	// 	return false;
	// }else if(!isNewVersion && !isEmail){
	// 	window.utils.toast.error('Please enter a valid email.');
	// 	return false;
	// }

	// 如果全是数字那么走手机登录，否则邮箱登录,暂时不判断号码长度，因为不同国家的长度不一样，虽然现在只是在印度
	// $.ajax({
	// 	type: 'POST',
	// 	url: '/auth2/login-valid',
	// 	data: {
	// 		login_account: loginInfo,
	// 		pwd: loginPwd,
	// 		redirect: '/user_center'
	// 	}
	// }, function (error) {
	// 	window.utils.GAEvents.GAMember('Login', 'Login with ' + loginType + ' & Failure:' + error);
	// }, $(this)).then(function (resp) {
	// 	console.log('登录成功')
	// })

});
// $('#set_cookie').click(() => {
// 	sendMessageToContentScript({ cmd: 'update_font_size', size: 42 }, function (response) { });
// });

// 打开后台页
$('#open_background').click(e => {
	window.open(chrome.extension.getURL('background.html'));
});

// 调用后台JS
$('#invoke_background_js').click(e => {
	var bg = chrome.extension.getBackgroundPage();
	bg.testBackground();
});

// 获取后台页标题
$('#get_background_title').click(e => {
	var bg = chrome.extension.getBackgroundPage();
	alert(bg.document.title);
});

// 设置后台页标题
$('#set_background_title').click(e => {
	var title = prompt('请输入background的新标题：', '这是新标题');
	var bg = chrome.extension.getBackgroundPage();
	bg.document.title = title;
	alert('修改成功！');
});

// 自定义窗体大小
$('#custom_window_size').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		var startLeft = 10;
		chrome.windows.update(currentWindow.id,
			{
				left: startLeft * 10,
				top: 100,
				width: 800,
				height: 600
			});
		var inteval = setInterval(() => {
			if (startLeft >= 40) clearInterval(inteval);
			chrome.windows.update(currentWindow.id, { left: (++startLeft) * 10 });
		}, 50);
	});
});

// 最大化窗口
$('#max_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		// state: 可选 'minimized', 'maximized' and 'fullscreen'
		chrome.windows.update(currentWindow.id, { state: 'maximized' });
	});
});


// 最小化窗口
$('#min_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		// state: 可选 'minimized', 'maximized' and 'fullscreen'
		chrome.windows.update(currentWindow.id, { state: 'minimized' });
	});
});

// 打开新窗口
$('#open_new_window').click(() => {
	chrome.windows.create({ state: 'maximized' });
});

// 关闭全部
$('#close_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		chrome.windows.remove(currentWindow.id);
	});
});

// 新标签打开网页
$('#open_url_new_tab').click(() => {
	chrome.tabs.create({ url: 'https://www.baidu.com' });
});

// 当前标签打开网页
$('#open_url_current_tab').click(() => {
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, { url: 'http://www.so.com' });
	});
});

// 获取当前标签ID
$('#get_current_tab_id').click(() => {
	getCurrentTabId(tabId => {
		alert('当前标签ID：' + tabId);
	});
});

// 高亮tab
$('#highlight_tab').click(() => {
	chrome.tabs.highlight({ tabs: 0 });
});

// popup主动发消息给content-script
$('#send_message_to_content_script').click(() => {
	sendMessageToContentScript('你好，我是popup！', (response) => {
		if (response) alert('收到来自content-script的回复：' + response);
	});
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('收到来自content-script的消息：');
	console.log(request, sender, sendResponse);
	sendResponse('我是popup，我已收到你的消息：' + JSON.stringify(request));
});

// popup与content-script建立长连接
$('#connect_to_content_script').click(() => {
	getCurrentTabId((tabId) => {
		var port = chrome.tabs.connect(tabId, { name: 'test-connect' });
		port.postMessage({ question: '你是谁啊？' });
		port.onMessage.addListener(function (msg) {
			alert('收到长连接消息：' + msg.answer);
			if (msg.answer && msg.answer.startsWith('我是')) {
				port.postMessage({ question: '哦，原来是你啊！' });
			}
		});
	});
});

// 获取当前选项卡ID
function getCurrentTabId(callback) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (callback) callback(tabs.length ? tabs[0].id : null);
	});
}

// 这2个获取当前选项卡id的方法大部分时候效果都一致，只有少部分时候会不一样
function getCurrentTabId2() {
	chrome.windows.getCurrent(function (currentWindow) {
		chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (tabs) {
			if (callback) callback(tabs.length ? tabs[0].id : null);
		});
	});
}

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback) {
	getCurrentTabId((tabId) => {
		chrome.tabs.sendMessage(tabId, message, function (response) {
			if (callback) callback(response);
		});
	});
}

// 向content-script注入JS片段
function executeScriptToCurrentTab(code) {
	getCurrentTabId((tabId) => {
		chrome.tabs.executeScript(tabId, { code: code });
	});
}


// 演示2种方式操作DOM

// 修改背景色
$('#update_bg_color').click(() => {
	executeScriptToCurrentTab('document.body.style.backgroundColor="red";')
});

// 修改字体大小
$('#update_font_size').click(() => {
	sendMessageToContentScript({ cmd: 'update_font_size', size: 42 }, function (response) { });
});

// 显示badge
$('#show_badge').click(() => {
	chrome.browserAction.setBadgeText({ text: 'New' });
	chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
});

// 隐藏badge
$('#hide_badge').click(() => {
	chrome.browserAction.setBadgeText({ text: '' });
	chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
});

// 显示桌面通知
$('#show_notification').click(e => {
	chrome.notifications.create(null, {
		type: 'image',
		iconUrl: 'img/icon.png',
		title: '祝福',
		message: '骚年，祝你圣诞快乐！Merry christmas!',
		imageUrl: 'img/sds.png'
	});
});

$('#check_media').click(e => {
	alert('即将打开一个有视频的网站，届时将自动检测是否存在视频！');
	chrome.tabs.create({ url: 'http://www.w3school.com.cn/tiy/t.asp?f=html5_video' });
});

$('#start_record').click(function () {
	startRecord()
})
$('#stop_record').click(function () {
	stopRecord()
	// chrome.tabs.create({ url: "../dot.html" });
})
function setStarted() {
	$('#start_record').hide()
	$('#stop_record').show()
	$('.left-item[data-tip=record]').click()
	$('.dot_state_content').html('正在记录打点中')
}
function setStoped() {
	$('#start_record').show()
	$('#stop_record').hide()
	$('.dot_state_content').html('还未开始记录')
}
chrome.runtime.sendMessage({ action: "get_status" }, function (response) {
	console.log(' response', response)
	if (response.active) {
		// ui.set_started();
		// $('#dot_item_content').show()
		setStarted()
		// console.log('已经开始记录')
	} else {
		setStoped()
		// console.log('还未开始记录')
		if (!response.empty) {
			// ui.set_stopped();
			chrome.runtime.sendMessage({ action: "stop" });
		}
	}
	chrome.tabs.getSelected(null, function (tab) {
		$('#url_record').val(tab.url)
		// document.forms[0].elements["url"].value = tab.url;
	});
});
function startRecord() {
	var nowUrl = $('#url_record').val()
	setStarted()
	chrome.tabs.getSelected(null, function (tab) {
		chrome.runtime.sendMessage({
			action: "start",
			recorded_tab: tab.id,
			start_url: nowUrl
		});
	});
}

function stopRecord() {
	setStoped()
	chrome.runtime.sendMessage({ action: "get_items" }, function (response) {
		chrome.runtime.sendMessage({ action: "stop" });
		// chrome.runtime.sendMessage({ action: "showrecord" });
	});
}

$('.left-item').click(function () {
	$('.left-item').removeClass('active')
	$(this).addClass('active')
	$('.right-content').hide()
	var tip = $(this).data('tip')
	console.log('tip', tip)
	$('.right-content-lists').find('.' + tip).show()
})


function deepLinkTransform(url) {
	var mainUrl = url.split('://')[1]
	var targets = mainUrl.split('/')
	var target1 = targets[1]
	// var returnUrl1 =
	if (target1.match(/^product_list/)) {
		return 'fromfactory://clubfactory/main?' + 'select_tab=' + 'home'
	} else if (target1.match(/^account/)) {
		return 'fromfactory://clubfactory/main?' + 'select_tab=' + 'account'
	} else if (target1.match(/^category/)) {
		return 'fromfactory://clubfactory/main?' + 'select_tab=' + 'category'
	} else if (target1.match(/^social/)) {
		return 'fromfactory://clubfactory/main?' + 'select_tab=' + 'social'
	} else {
		return 'fromfactory://clubfactory/web?' + 'url=' + url
	}
}

$('#transform_deeplink').click(function () {
	var oriUrl = $('#deeplink_input').val()

	var returnUrl = deepLinkTransform(oriUrl)

	$('#deeplinkBox').html(returnUrl)

})
