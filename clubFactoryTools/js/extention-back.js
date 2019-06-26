var testcase_items = [];
var active = false;
var empty = true;
var tab_id = null;
// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log('收到来自content-script的消息：');
    // console.log(request, sender, sendResponse);
    // sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
    if (request.action == "append") {
        testcase_items[testcase_items.length] = request.obj;
        empty = false;
        sendResponse({});
    }
    if (request.action == "get_status") {
        sendResponse({ active: active, empty: empty });
    }
    if (request.action == "start") {
        if (!active) {
            active = true;
            empty = true;
            testcase_items = [];
            tab_id = request.recorded_tab;
            chrome.tabs.update(tab_id, { url: request.start_url }, function (tab) {
                alert("你现在正在记录打点");
                chrome.tabs.sendMessage(tab_id, {
                    action: "open",
                    url: request.start_url
                });
                sendResponse({ start: true });
            });
        }
    }
    if (request.action == "stop") {
        active = false;
        chrome.tabs.sendMessage(tab_id, { action: "stop" });
        sendResponse({});
    }
    if (request.action == "get_items") {
        sendResponse({ items: testcase_items });
    }
});
