function notify_device(url, config) {
    var version = window.utils.cookie.getVersion();
    try {
        if (window.utils.isAndroidDevice()) {
            // Android 4.7.0 后和iOS同步
            if (version < "4.7.0") {
                window.JSInterface.url_changed(url, JSON.stringify(config));
            } else {
                var data = { url: url, config: config };
                WebViewJavascriptBridge.callHandler('url_changed', data)
            }
        } else if (window.utils.isIOSDevice()) {
            var data = { url: url, config: config };
            if (window.utils.isIOSNewVersion()) {
                WebViewJavascriptBridge.callHandler('url_changed', data)
            } else {
                window.webkit.messageHandlers.url_changed.postMessage(data);
            }
        }
    } catch (e) {
        console.debug(e)
    }
}

function is_device() {
    return navigator.userAgent.indexOf('native_navbar') > -1 || Boolean(Cookies.get("v"));
}

function isVersionGreaterOrEquals(android_ver, ios_ver) {
    var versionStr = Cookies.get("v"); // ios_2.1.3  or  android_3.5.0
    if (!Boolean(versionStr)) {
        return false;
    }

    var _ios_ver = ios_ver || android_ver;

    var sysAndVer = versionStr.split("_");
    if (sysAndVer[0].toLowerCase() == "ios") {
        return getStandardVersion(sysAndVer[1]) >= getStandardVersion(_ios_ver)
    } else {
        return getStandardVersion(sysAndVer[1]) >= getStandardVersion(android_ver)
    }
}

// 将显示用的版本号转为标准版本号
// 原则上版本号规则是 X.X.X 都是1位，但由于历史包袱，这里支持 XX.XX.XX 和 XX.XX ，对于1位的，将其补齐2位
// 例如: 3.5.2 => 30502  早期版本  2.45  => 24500
function getStandardVersion(displayVersion) {
    var verSplit = displayVersion.split(".");
    var fullVer = verSplit[0];
    if (verSplit[1].length == 1) {
        fullVer = fullVer + "0";
    }
    fullVer += verSplit[1];

    if (verSplit.length > 2) { // 标准版本是 XX.XX.XX
        if (verSplit[2].length == 1) {
            fullVer = fullVer + "0";
        }
        fullVer += verSplit[2];
    } else { // 早期版本是 XX.XX  如2.45 他的结果应该是 24500
        fullVer += "00";
    }

    return parseInt(fullVer);
}

function call_device(func_name, param, callback) {
    window.utils.chartWithNative(func_name, param, callback);
}

function show_loading() {
    call_device("show_loading", true);
}

function hide_loading() {
    call_device("show_loading", false);
}

function open_support() {
    location.href = '/faqs'
}

/**
 * Android 3.6.0, ios 1.8.0 版本可以调用这个方法关闭当前的webview
 */
function close_webview_page() {
    if (window.isVersionGreaterOrEquals('3.6.0', '1.8.0')) {
        call_device('close_webview_page')
    }
}

/**
 * Android/ios 4.5.3 版本可以调用这个方法
 */
function open_webview_page(url) {
    if (window.isVersionGreaterOrEquals('4.5.3')) {
        window.open(url);
    } else {
        window.location.href = url;
    }
}

/**
 * 注册成功通知客户端
 * @param registerMethod: 注册方式
 */
function registSucceed(registerMethod) {
    if ($.url().param('redirect') && $.url().param('redirect').indexOf('join/') > -1) {
        $.ajax({
            url: "/auth2/sign_up_confirm",
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({
                channel: "group_buy",
                type: "join",
                groupId: $.url().param('redirect').split("join/")[1]
            }),
        })
    }

    var version = window.utils.cookie.getVersion();
    if (window.utils.isAndroidDevice() && version >= '3.4.1') {
        call_device('regist_succeed', registerMethod);
    } else if (window.utils.isIOSDevice() && version >= '1.8.0') {
        call_device('regist_succeed', registerMethod);
    }
}

/**
 * 调用客户端接口register_pageid, 向客户端注册页面id
 * 客户端需要知道h5页面的页面id，供客户端上报使用
 *
 * @param pageid: 页面id
 */
function registerPageid(pageid) {
    if (is_device()) {
        call_device("register_pageid", pageid);
    }
}

/**
 * 解析url的query
 * 这是个私有方法，为下面getPageid调用的，因为某些pageid
 * 的判断是通过参数判断的: CategoryId 和 query页面
 *
 * @return query_obj
 */
function parseUrl(url) {
    var result = [];
    var query = url.split("?")[1];
    var queryArr = query.split("&");
    var obj = {};
    queryArr.forEach(function (item) {
        var value = item.split("=")[1];
        var key = item.split("=")[0];
        obj[key] = value;
    });
    return obj;
}


/**
 * 这是个私有方法，是调用add_event相关接口是需要提供页面的id
 * 通过这个方法获取我们自己定义的页面id
 * 通过url的正则规则匹配我们自定义的页面id
 *
 * @return pageid: 页面id
 */
function getPageid() {
    var pathname = window.location.pathname;
    if (pathname.match("/product_list")) {
        if (window.location.search) {
            query = parseUrl(window.location.search);
            if (query["q"]) {
                pageid = 15;
            } else if (query["categoryId"] && query["categoryId"] != "0") {
                pageid = 8;
            } else {
                pageid = 1;
            }
        } else {
            pageid = 1;
        }
    } else if (pathname.match("/cart")) {
        pageid = 3;
    } else if (pathname.match("/product/[0-9]+")) {
        pageid = 5;
    } else if (pathname.match("/theme/group/list")) {
        pageid = 9;
    } else if (pathname.match("/theme/flash_sale") || pathname.match("/flash_sale")) {
        pageid = 10;
    } else if (pathname.match("/theme/collect_like")) {
        pageid = 38;
    } else if (pathname.match("/theme/phone_case")) {
        pageid = 39;
    } else if (pathname.match("/theme/brand")) {
        pageid = 32;
    } else if (pathname.match("/theme/group/product/[0-9]+")) {
        pageid = 12;
    } else if (pathname.match("/theme/[a-zA-Z0-9_]+")) {
        pageid = 16;
    } else if (pathname.match("/payment/complete/SO[0-9]+")) {
        pageid = 11;
    } else if (pathname.match("/payment/failed/SO[0-9]+")) {
        pageid = 37;
    } else if (pathname.match("/payment\/SO[0-9]+\/method")) {
        pageid = 7;
    } else if (pathname.match("/payment") || pathname.match("/order_payment")) {
        pageid = 6;
    } else if (pathname.match("/wishlist")) {
        pageid = 13;
    } else if (pathname.match("/auth2/login")) {
        pageid = 22;
    } else if (pathname.match("/user_center/orders/[0-9]+")) {
        pageid = 23;
    } else if (pathname.match("/user_center/product_scan")) {
        pageid = 24;
    } else if (pathname.match("/user_center")) {
        pageid = 4;
    } else if (pathname.match("/coupon/list")) {
        pageid = 25;
    } else {
        pageid = 0;
    }
    return pageid;
}

/**
 * 调用客户端接口add_event, 向客户端添加h5 click事件, 通过客户端取整合事件
 *
 * @param h5_event {
 *  mid: 模块id
 * }
 */
function notify_add_click_event(h5_event) {
    if (is_device()) {
        pageid = getPageid();
        h5_event["mid"] = "1." + pageid + "." + h5_event["mid"];
        h5_event["et"] = "click";
        call_device("add_event", h5_event);
    }
}

/**
 * 调用客户端接口add_event, 向客户端添加事件的曝光,
 * et 为impression
 *
 * @param h5_event {
 *  mid: 模块id
 * }
 */
function notify_add_impression_event(h5_event) {
    if (is_device()) {
        pageid = getPageid();
        h5_event["mid"] = "1." + pageid + "." + h5_event["mid"];
        h5_event["et"] = "impression";
        call_device("add_event", h5_event);
    }
}

/**
 * 调用客户端接口add_event, 向客户端添加商品的曝光,
 * et 为product
 *
 * @param h5_event {
 *  mid: 模块id
 * }
 */
function notify_add_product(h5_event) {
    if (is_device()) {
        pageid = getPageid();
        h5_event["mid"] = "1." + pageid + "." + h5_event["mid"];
        h5_event["et"] = "product";
        call_device("add_event", h5_event);
    }
}

/**
 * 调用客户端接口add_event, 在支付成功后，向客户端添加商品支付的消息，这里只针对支付成功后单独上报商品的支付用
 * et 为purchase
 *
 * @param h5_event {
 *  mid: 模块id
 * }
 */
function notify_purchase_product(h5_event) {
    if (is_device()) {
        pageid = getPageid();
        h5_event["mid"] = "1." + pageid + "." + h5_event["mid"];
        h5_event["et"] = "pay_success";
        call_device("add_event", h5_event);
    }
}

function notify_device_title(title) {
    notify_device(
        "",
        {
            'title': title,
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}

function notify_login(title) {
    notify_device(
        'login',
        {
            'title': title ? title : 'Log In',
            'show_header_navibar': true,
            'show_footer_navibar': true
        }
    );
}

/**通知客户端将本webview页面关闭*/
function notify_close_web_view_page() {
    call_device("close_webview_page")
}

function notify_login_success() {
    call_device("login_succeed")
}

function notify_my_center(title) {
    notify_device(
        'my_center',
        {
            'title': title ? title : 'My Center',
            'show_header_navibar': true,
            'show_footer_navibar': true
        }
    );
}
function notify_categories(title) {
    notify_device(
        'Categories',
        {
            'tab_index': 1,
            'title': title ? title : 'Categories',
            'show_header_navibar': true,
            'show_footer_navibar': true
        }
    );
}
function notify_my_orders(title) {
    notify_device(
        'my_orders',
        {
            'title': title ? title : 'My Orders',
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}
function notify_contact_info(title) {
    notify_device(
        'contact_info',
        {
            'title': title ? title : 'Contact Info',
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}
function notify_balance(title) {
    notify_device(
        'my_orders',
        {
            'title': title ? title : 'Balance',
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}

function notify_tracking() {
    notify_device(
        'order_tracking',
        {
            'title': 'Tracking Info',
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}
function notify_cashback(title) {
    notify_device(
        title,
        {
            'title': title,
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}
function notify_product_detail() {
    notify_device(
        'product_detail',
        {
            'title': '',
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}
function notify_wishlist() {
    notify_device(
        'wishlist',
        {
            'title': 'Wishlist',
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}
function notify_cart(title) {
    notify_device(
        'cart',
        {
            'title': title ? title : 'Shopping Cart',
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}

function notify_cart_quantity(quantity) {
    call_device('change_cart_num', quantity);
}

function notify_product_list() {
    notify_device('shop_list', {});
}

function notify_theme(title) {
    notify_device(
        'theme',
        {
            'title': title,
            'show_header_navibar': true,
            'show_footer_navibar': false
        }
    );
}

function notify_order_detail(title) {
    notify_device('order_detail', {
        title: title,
        'show_header_navibar': true,
        'show_footer_navibar': false
    })
}

/**
 * 打开客服对话框
 * @param tag: 固定格式  "before_delivered" / "after_delivered"
 * @param msg: 对话内容
 */
function openSpecialConversation(tag, msg) {
    var flag = isVersionGreaterOrEquals('3.6.0', '1.9.0')
    if (flag) {
        if (window.utils.isIOSDevice()) {
            WebViewJavascriptBridge.callHandler('open_special_conversation', {
                tag: tag,
                msg: msg
            })
        } else {
            call_device('open_special_conversation', {
                tag: tag,
                msg: msg
            })
        }
    }
}

function notify_category(category_id, parent_id, name) {
    var params = {
        parent_id: parent_id,
        category_id: category_id
    };

    try {
        if (window.utils.isAndroidDevice()) {
            params['name'] = name;
            var version = window.utils.cookie.getVersion()
            if (version < "4.7.0") {
                window.JSInterface.change_categ(JSON.stringify(params));
            } else {
                WebViewJavascriptBridge.callHandler('change_categ', params)
            }
        } else if (window.utils.isIOSDevice()) {

            if (window.utils.isIOSNewVersion()) {
                WebViewJavascriptBridge.callHandler('change_categ', params)
            } else {
                window.webkit.messageHandlers.change_categ.postMessage(params);
            }
        }
    }
    catch (e) {
        console.debug(e)
    }
}

function getFBMarketingIds(contentId, cb) {
    $.ajax({
        url: "https://www.clubfactory.com/marketing/facebook/productTag/",
        data: {
            productNoList: contentId.join(',')
        },
        success: function (resp) {
            cb(resp)
        }
    });
}

function facebookNeedToReport(contentId, cb) {
    $.ajax({
        url: 'https://www.clubfactory.com/marketing/facebook/orderFilter/status',
        data: {
            productNoList: contentId.join(','),
        },
        success: function (resp) {
            cb(resp.status)
        }
    })
}

function device_add_to_cart(param) {
    console.log(param);
    getFBMarketingIds(param.product_nos, function (ids) {
        if (window.utils.isMarketNewVersion()) {
            report_event({
                "facebook": "fb_mobile_add_to_cart"
            }, {
                    "fb_content_id": JSON.stringify(ids),
                    "fb_content_type": "product",
                    "fb_currency": "USD",
                    // "fb_currency": param.currency_unit, //当地货币
                    "_valueToSum": param.us_price
                })
            report_event({
                "adjust_ios": "qw7s0a",
                "adjust_android": "wwvdl0"
            }, {
                    "item_id": ids.join(","),
                    "currency": "USD",
                    // "currency": param.currency_unit, //当地货币
                    "price": param.us_price
                })
            ids.forEach(function (id, index) {
                report_event({
                    "firebase": "add_to_cart"
                }, {
                        "item_id": id,
                        "currency": "USD",
                        // "currency": param.currency_unit, //当地货币
                        "price": (id == param.product_nos[0]) ? param.us_price : 0
                    })
            })
        }
        else {
            var contentIds = param.product_nos;
            if (window.utils.isAndroidDevice()) {
                window.utils.chartWithNative('add_to_cart', {
                    content_id: ids.join(','),
                    item_id: contentIds.join(','),
                    content_type: "product",
                    value: param.us_price
                })
            } else if (window.utils.isIOSDevice()) {
                window.utils.chartWithNative('add_to_cart', {
                    content_id: ids.join(','),
                    item_id: contentIds.join(','),
                    content_type: "product",
                    value: param.us_price
                })
            }
        }
    })
}

function device_add_to_wishlist(param) {
    getFBMarketingIds([param.product_no], function (ids) {
        if (window.utils.isMarketNewVersion()) {
            report_event({
                "facebook": "fb_mobile_add_to_wishlist"
            }, {
                    "fb_content_id": JSON.stringify(ids),
                    "fb_content_type": "product",
                    "fb_currency": "USD",
                    // "fb_currency": param.currency_unit, //当地货币
                    "_valueToSum": param.us_price
                })
            report_event({
                "adjust_ios": "6fjpaj",
                "adjust_android": "y59lhn"
            }, {
                    "item_id": ids.join(","),
                    "currency": "USD",
                    // "currency": param.currency_unit, //当地货币
                    "price": param.us_price
                })
            ids.forEach(function (id, index) {
                report_event({
                    "firebase": "add_to_wishlist"
                }, {
                        "item_id": id,
                        "currency": "USD",
                        // "currency": param.currency_unit, //当地货币
                        "price": (id == param.product_no) ? param.us_price : 0
                    })
            })
        }
        else {
            window.utils.chartWithNative('add_to_wishlist')
        }
    })
}

function device_confirm_order() {
    if (window.utils.isMarketNewVersion()) {
        report_event({
            "facebook": "submit_order",
            "adjust_ios": "13jvsa",
            "adjust_android": "mj3em4",
            "firebase": "submit_order"
        }, {})
    }
    else {
        if (window.utils.isAndroidDevice()) {
            var version = window.utils.cookie.getVersion()
            if (version < "4.7.0") {
                window.JSInterface.add_to_confirm_order();
            } else {
                WebViewJavascriptBridge.callHandler('confirm_order')
            }
        } else if (window.utils.isIOSDevice()) {
            WebViewJavascriptBridge.callHandler('confirm_order')
        }
    }
}

function device_payment_success(param) {
    console.log(param)
    getFBMarketingIds(param.product_nos, function (ids) {
        if (window.utils.isMarketNewVersion()) {
            facebookNeedToReport(param.product_nos, function (canReport) {
                if (canReport) {
                    report_event({
                        "facebook": "fb_mobile_purchase"
                    }, {
                            "fb_content_id": JSON.stringify(ids),
                            "fb_content_type": "product",
                            "fb_currency": "USD",
                            // "fb_currency": param.currency_unit, //当地货币
                            "_valueToSum": param.amount_usd
                        })
                    if (param.channel == 'cod') {
                        report_event({
                            "facebook": "purchase_payment_method_cod"
                        }, {
                                "_valueToSum": param.amount_usd
                            })
                    }
                    else {
                        report_event({
                            "facebook": "purchase_payment_method_prepay"
                        }, {
                                "_valueToSum": param.amount_usd
                            })
                    }
                }
            })
            report_event({
                "adjust_ios": "cfxs27",
                "adjust_android": "add_to_payment_success" //"2g9b2q"
            }, {
                    "currency": "USD",
                    // "currency": param.currency_unit, //当地货币
                    "price": param.amount_usd.toString(),
                    "value": param.amount_usd.toString(),
                    "revenue": param.amount_usd,
                })
            ids.forEach(function (id, index) {
                report_event({
                    "firebase": "ecommerce_purchase"
                }, {
                        "item_id": id,
                        "currency": "USD",
                        // "currency": param.currency_unit, //当地货币
                        "price": Math.round((param.amount_usd / ids.length) * 100) / 100,
                        "value": Math.round((param.amount_usd / ids.length) * 100) / 100,
                    })
            })
        }
        else {
            var contentJson = null;
            var contentIds = param.product_nos;
            var amount = param.amount_usd;
            var version = window.utils.cookie.getVersion();
            if (window.utils.isAndroidDevice()) {
                contentJson = JSON.stringify({
                    content_id: ids.join(','),
                    item_id: contentIds.join(','),
                    content_type: "product",
                    amount: amount
                });

                if (version < "4.7.0") {
                    window.JSInterface.add_to_payment_success(contentJson)
                } else {
                    WebViewJavascriptBridge.callHandler('payment', contentJson)
                }
            } else if (window.utils.isIOSDevice()) {
                contentJson = JSON.stringify({
                    content_id: ids.join(','),
                    item_id: contentIds.join(','),
                    content_type: "product",
                    amount: amount
                });
                WebViewJavascriptBridge.callHandler('payment', contentJson)
            }
        }
    })
}

/**
 * 商品详情页上报客户端
 * @param contentIds
 */
function device_view_content(param) {
    console.log(param)
    getFBMarketingIds(param.product_nos, function (ids) {
        if (window.utils.isMarketNewVersion()) {
            report_event({
                "facebook": "fb_mobile_content_view"
            }, {
                    "fb_content_id": JSON.stringify(ids),
                    "fb_content_type": "product",
                    "fb_currency": "USD",
                    // "fb_currency": param.currency_unit, //当地货币
                    "_valueToSum": param.us_price
                })
            report_event({
                "adjust_ios": "abj14j",
                "adjust_android": "z7qd35"
            }, {
                    "currency": "USD",
                    "item_id": ids.join(","),
                    // "currency": param.currency_unit, //当地货币
                    "price": param.us_price
                })
            ids.forEach(function (id, index) {
                report_event({
                    "firebase": "view_item"
                }, {
                        "item_id": id,
                        "currency": "USD",
                        // "currency": param.currency_unit, //当地货币
                        "price": (id == param.product_nos[0]) ? param.us_price : 0
                    })
            })
        }
        else {
            var version = window.utils.cookie.getVersion();
            if (window.utils.isAndroidDevice() && version >= '3.5.0') {
                window.utils.chartWithNative('view_content', {
                    content_id: ids.join(','),
                    content_type: "product",
                    value: param.us_price
                });
            } else if (window.utils.isIOSDevice() && version >= '1.8.0') {
                window.utils.chartWithNative('view_content', {
                    content_id: ids.join(','),
                    content_type: "product",
                    value: param.us_price
                });
            }
        }
    })
}

function device_fb_login() {
    window.utils.chartWithNative('fb_login');
}

function device_fb_logout() {
    window.utils.chartWithNative('fb_logout');
}

function device_share(product_id) {
    var config = {
        url: 'share.fromfactory.club/p/' + product_id,
        title: 'Club Factory'
    };
    window.utils.chartWithNative('share_product', config);
}

/**
 * 选择国家
 */
function selectCountry() {
    var version = window.utils.cookie.getVersion()
    if (version >= '3.9.0') {
        window.utils.chartWithNative('selectCountry')
    }
}

/**
 * 选择语言
 */
function selectLanguage() {
    var version = window.utils.cookie.getVersion()
    if (version >= '3.9.0') {
        window.utils.chartWithNative('selectLanguage')
    }
}

/*
 * 调用客户端上报的新接口
 * 接口新方法名为report_event
 * 改为通用接口
 */
function report_event(event_name, event_param) {
    var version = window.utils.cookie.getVersion();
    if (version >= '4.0.0') {
        var param = {
            event: event_name,
            params: event_param
        }
        window.utils.chartWithNative('report_event', param);
    }
}

function mailVerify(obj) {
    var $input = $(obj);
    $input.parent().find($(".list")).remove();
    $input.after($("<ul class='list'></ul>"));

    var mail = new Array("gmail.com", "yahoo.com", "hotmail.com");
    for (var i = 0; i < mail.length; i++) {
        $("<li><span></span>@" + mail[i] + "</li>").appendTo("ul.list");
    };
    $(".list").width($input.outerWidth());

    $(".list li").click(function () {
        $input.val($(this).text());
        $(".list").hide();
    })

    $input.on("input", function () {
        $(".list span").text($input.val().split("@")[0]);
        if ($input.val().indexOf("@") > -1) {
            if ($(".list").is(":hidden")) {
                $(".list").show();
            }
            $(".list li").each(function () {
                if ($(this).text() == $input.val()) {
                    $(".list").hide();
                }
                else if ($(this).text().indexOf($input.val()) != 0) {
                    $(this).hide();
                }
                else {
                    $(this).show();
                };
            })
        }
        else {
            if (!$(".list").is(":hidden")) {
                $(".list").hide();
            };
        };
    })

    $("body:not(.list)").click(function () {
        if (!$(".list").is(":hidden")) {
            $(".list").hide();
        };
    })
}

function setOverMinus(obj, offline) {
    if ($("#new_year_sale").length && !$("#new_year_sale").is(":hidden")) {
        if (offline) {
            $(obj).css("text-decoration", "none");
            $("#afterMinus").hide();
            return;
        };
        var $preSale_total = $("#preSale_total").text();
        var $price = $(obj).text();
        var $over = new Array($("#new_year_sale .o1").text(), $("#new_year_sale .o2").text());
        var $minus = new Array($("#new_year_sale .m1").text(), $("#new_year_sale .m2").text());

        if ($preSale_total >= parseInt($over[1])) {
            $price -= $minus[1];
        } else if ($preSale_total >= parseInt($over[0])) {
            $price -= $minus[0];
        } else {
            $(obj).css("text-decoration", "none");
            $("#afterMinus").hide();
            return;
        }

        $(obj).css("text-decoration", "line-through");
        if ($("#afterMinus").length) {
            $("#afterMinus").text(" " + $price.toFixed(2));
            $("#afterMinus").show();
        } else {
            $("<span id='afterMinus' style='color:#F15440;'>" + " " + $price.toFixed(2) + "</span>").insertAfter(obj);
        };
    };
}

function continueShop() {
    if (is_device()) {
        notify_device('shop_list', {});
    } else {
        location = '/product_list';
    }
}

function update_gender() {
    $.ajax({
        url: "/sex/update",
        contentType: 'application/json',
        type: 'POST',
        success: function (data) {
            if (data.changed) {
                call_device("change_gender", data.gender)
            }
        }
    })
}

function add_ga_list_data(ga_list_data) {
    for (var idx in ga_list_data.products) {
        ga('ec:addImpression', {
            'id': ga_list_data.products[idx].product_no,     // 商品货号 (string).必填
            'name': ga_list_data.products[idx].product_no,   // 商品标题 (string).必填
            'brand': ga_list_data.products[idx].id + ' & ' + ga_list_data.products[idx].price,
            'price': ga_list_data.products[idx].price,       // 商品售价 (Currency).
            'list': ga_list_data.type,                       // 列表的标识 (string).
            'position': ga_list_data.products[idx].pos,      // 列表中的排序 (number).
        })
    }
}


window.utils = {
    toast: {
        error: function (text, showTime) {
            this.base('error', text, showTime);
        },
        success: function (text, showTime) {
            this.base('success', text, showTime);
        },
        normal: function (text, showTime) {
            this.base('', text, showTime);
        },
        base: function (type, text, showTime) {
            showTime = showTime || 1500;
            var iconfont = '';
            if (type === 'error') {
                iconfont = '&#xe6c2;';
            } else if (type === 'success') {
                iconfont = '&#xe614;';
            }
            else {
                iconfont = '';
            }
            var html = ['<div id="toastModal">',
                '<div style="display:flex;align-items:center;justify-content:center;height:100%;width:100%">',
                '<div class="alertContent" style="background:rgba(0,0,0,0.8);color:white;opacity:1;padding:10px;border-radius:5px;min-width:100px;max-width:80vw">',
                '<div class="toast ' + type + '">',
                '<i class="iconfont">' + iconfont + '</i>',
                '<p style="margin: 0; color: white;">' + text + '</p>',
                '</div>',
                '</div>',
                '</div>',
                '</div>',
            ];

            $("#toastModal").remove();
            $('body').append(html.join(''));
            $('#toastModal').fadeIn(1500);
            // 虽然这里有点问题，但是因为在toast弹出后用户点击页面的按钮其实没有响应，所以避免了出现多个计时器错乱的问题
            setTimeout(function () {
                $('#toastModal').fadeOut(1500);
            }, showTime)
        }
    },

    alert: {
        base: function (options) {
            var _options = $.extend({}, {
                stick: true,
                template: '',
                textOk: 'OK',
                eventClose: '',
                onOkClick: ''
            }, options);
            var html = [
                '<div id="alert">',
                '<div class="bg"></div>',
                '<div class="content">',
                '<div class="right-button">',
                '<i class="iconfont close">&#xe69a;</i></div>',
                _options.template,
                '<div class="btn-ok">' + _options.textOk + '</div>',
                '</div>',
                '</div>'
            ];

            var _close = function () {
                $('#alert').remove();
                $body.css('overflow', 'auto');
                // 移除禁用滚动的事件
                document.removeEventListener('touchmove', touchmoveHandler);
                var eventClose = _options.eventClose;
                if (eventClose && typeof (eventClose) === 'function') {
                    eventClose();
                }
            };
            var $body = $('body');
            $body.append(html.join(''));
            $body.css('overflow', 'hidden');

            document.addEventListener('touchmove', touchmoveHandler, { passive: false, capture: false });

            function touchmoveHandler(event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.nativeEvent) {
                    event.nativeEvent.stopImmediatePropagation();
                }
            }

            $('#alert .close').click(function () {
                _close();
            });

            $('#alert .bg').click(function () {
                if (!_options.stick) {
                    _close();
                }
            });

            $('#alert .btn-ok').click(function () {
                var onOkClick = _options.onOkClick;
                if (onOkClick && typeof (onOkClick) === 'function') {
                    onOkClick();
                }
                _close();
            });

            // todo 暂时没有加动画，有需要优化可以自己动手了

        },
        alreadyPaid: function (title, context, eventClose) {
            var template = [
                '<div class="already-paid-content">',
                '<i class="iconfont top-smile-face">&#xe627;</i>',
                '<div class="title">' + title + '</div>',
                '<div class="detail">' + context + '</div>',
                '</div>'
            ];
            var options = {
                template: template.join(''),
                eventClose: eventClose
            };
            this.base(options)
        }
    },

    Modal: {
        delete: function (options) {
            var _options = $.extend({}, {
                confirm: null
            }, options);
            var template = [
                '<div class="modal" id="modalDelete">',
                '<div class="modal-body">',
                '<div class="title"><b style="font-size:20px;">Are you sure</b> <br> you want to delete this item?</div>',
                '<button class="btn-confirm-delete">Yes, delete it</button>',
                '<button class="btn-cancel">Cancel</button>',
                '</div>',
                '</div>'
            ];

            var $body = $('body');
            $('#modalDelete').empty();
            $body.append(template.join(''));

            $('.modal').css({ display: 'block' });

            $('.modal .btn-cancel').click(function () {
                $('#modalDelete').remove();
            });

            $('.modal .btn-confirm-delete').click(function () {
                if (_options.confirm) {
                    _options.confirm()
                }
                $('#modalDelete').remove();
            });
        },

        message: function (message, options) {
            var template = [
                '<div class="tax-modal">',
                '<div class="modal-bg"></div>',
                '<div class="modal-wrap">',
                '<div class="modal-message">' + message + '</div>',
                '<div class="btn-modal-ok">OK</div>',
                '</div>',
                '</div>',
            ];

            var $body = $('body')
            $('#tax-modal').empty()
            $body.append(template.join(''))

            $('.tax-modal .btn-modal-ok').click(function () {
                $('.tax-modal').remove()
            })
        },
        confirm: function (options) {
            var _default = {
                'title': '',
                'message': '',
                'confirmText': 'OK',
                'cancelText': 'Cancel',
                confirm: null,
                cancel: null
            }
            options = $.extend({}, _default, options)
            var template = [
                '<div class="confirm">',
                '<div class="modal-body">',
                '<div class="title"><b style="font-size:20px;">' + options.title + '</b> <br> ' + options.message + '</div>',
                '<div class="modal-footer">' +
                '<button class="btn-cancel">' + options.cancelText + '</button>',
                '<button class="btn-confirm">' + options.confirmText + '</button>' +
                '</div>',
                '</div>',
                '</div>'
            ];
            var $body = $('body');
            var $confirmModal = $('.confirm')
            $confirmModal.empty();
            $body.append(template.join(''));
            $confirmModal = $('.confirm')

            $confirmModal.css({ display: 'block' });

            $('.confirm .btn-cancel').click(function () {
                if (options.cancel) {
                    options.cancel()
                }
                $confirmModal.remove();
            });

            $('.confirm .btn-confirm').click(function () {
                if (options.confirm) {
                    options.confirm()
                }
                $confirmModal.remove();
            });
        }
    },

    GAEvents: {
        base: function (event, hitType, eventCategory, eventAction, eventLabel, hitCallback, nonInteraction) {
            if (nonInteraction === undefined) {
                nonInteraction = true
            }
            ga(event, {
                hitType: hitType,
                eventCategory: eventCategory,
                eventAction: eventAction,
                eventLabel: eventLabel,
                nonInteraction: nonInteraction,
                hitCallback: hitCallback
            })
            if (isMidEast()) {
                ga('MidEast.' + event, {
                    hitType: hitType,
                    eventCategory: eventCategory,
                    eventAction: eventAction,
                    eventLabel: eventLabel,
                    nonInteraction: nonInteraction
                })
            }
        },

        GAMember: function (action, label, hitCallback, nonInteraction) {
            this.base('send', 'event', 'Member', action, label, hitCallback, nonInteraction)
        },

        GACheckout: function (action, label, hitCallback, nonInteraction) {
            this.base('send', 'event', 'Checkout', action, label, hitCallback, nonInteraction)
        },

    },
    validatePhone: function (phoneNum) {
        // var countryCode = Cookies.get('country_code');
        // var pattern = this.validatePhonePattern(countryCode);
        // if (!phoneNum) {
        //     return false;
        // } else {
        //     return pattern.test(phoneNum);
        // }
        return true
    },

    validateEmail: function (email) {
        if (!email) {
            return false;
        } else {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(email)
        }
    },

    validateNumber: function (value) {
        if (!value) {
            return false
        } else {
            return /^\d+$/.test(value)
        }
    },

    ajax: function (settings, ga_error_func, element, callbackJson) {
        show_loading();
        if (element) {
            element.attr('disabled', true);
        }
        return $.ajax(settings)
            .always(function (resp) {
                console.log('always: ', resp);
                hide_loading();
                if (element) {
                    element.attr('disabled', false);
                }
                return resp
            })
            .fail(function (resp) {
                console.log('fail resp: ', resp);
                if (resp && resp.status === 401) {
                    if (callbackJson && callbackJson['unauthorized']) {
                        callbackJson['unauthorized'](resp);
                    } else {
                        window.location.href = '/auth2/login?redirect=' + location.pathname
                    }
                } else {
                    var responseJSON = (resp && resp.responseJSON) ? resp.responseJSON : null;
                    var message = "";
                    if (responseJSON && responseJSON.message) {
                        message = responseJSON.message
                    } else if (resp && resp.statusText) {
                        message = resp.statusText;
                    } else {
                        message = 'An error occur. Please try again later'
                    }
                    window.utils.toast.error(message);

                    // send ga with error message
                    if (ga_error_func) {
                        ga_error_func(message);
                    }
                }
            })
    },
    getUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.search.slice(1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },

    getQueryParamByName: function (name) {
        // var queryParams = this.getUrlVars();
        // return queryParams[name]?queryParams[name]:''
        return $.url().param(name) || "";
    },
    is_device: function () {
        return navigator.userAgent.indexOf('native_navbar') > -1;
    },
    validatePhonePattern: function (country_code) {
        var phonePatternMaps = {
            'in': /^\d{10}$/,
            'sa': /^\d{9}$/,
        };

        return phonePatternMaps[country_code] || /^\d+$/;
    },

    isIOSNewVersion: function () {
        return window.utils.cookie.getVersion() >= '1.6.2'
    },

    isMarketNewVersion: function () {
        return window.utils.cookie.getVersion() >= '5.1.0'
    },

    isAndroidDevice: function () {
        return navigator.userAgent.indexOf('android_native_navbar') > -1
    },

    isIOSDevice: function () {
        return navigator.userAgent.indexOf('ios_native_navbar') > -1
    },

    chartWithNative: function (funcName, params, callback) {
        try {
            // android 4.7.0以后和 iOS 的协议保持统一
            var version = window.utils.cookie.getVersion()
            params = typeof (params) === 'object' ? JSON.stringify(params) : params;
            if (window.utils.isAndroidDevice()) {
                if (version < "4.7.0") {
                    typeof (params) !== 'undefined' ? window.JSInterface[funcName](params) : window.JSInterface[funcName]();
                } else {
                    WebViewJavascriptBridge.callHandler(funcName, params, callback)
                }
            } else if (window.utils.isIOSDevice()) {
                if (window.utils.isIOSNewVersion()) {
                    WebViewJavascriptBridge.callHandler(funcName, params, callback)
                } else {
                    window.webkit.messageHandlers[funcName].postMessage(params);
                }
            }
        }
        catch (e) {
            console.debug(e)
        }
    },

    isAllChecked: function (element) {
        element = Array.prototype.slice.call(element);
        return element.every(function (item) {
            return $(item).hasClass('icon-xuanzhong')
        });
    },

    cookie: {
        setFacebookLogin: function () {
            Cookies.set('is_fb', true)
        },
        getFacebookLogin: function () {
            return Cookies.get('is_fb') === 'true';
        },
        setPhoneNum: function (num) {
            Cookies.set('pn', num)
        },
        getPhoneNum: function () {
            return Cookies.get('pn')
        },

        getVersion: function () {
            //    1.6.2
            var v = Cookies.get('v');
            if (v) {
                var versions = v.split('_');
                var ver = versions[versions.length - 1];
                return ver;
            } else {
                return null;
            }
        }
    },

    validate: {
        password: function (pwd) {
            if (!pwd) {
                return false;
            } else {
                return pwd.length >= 6;
            }
        }
    },

    pushState: {
        orders: function (uid, type) {
            history.pushState({}, "Orders", "/orders#/?type=" + type + "&_t=" + new Date().getTime());
        }
    },

    verify_login: function (callback) {
        console.log('login-------');
        var res;
        $.ajax({
            url: "/auth2/verify",
            contentType: 'application/json',
            type: 'POST',
            success: function (data) {
                res = Boolean(data.uid)
                callback && callback(data.uid)
            }
        }).fail(function () {
            res = false;
            callback && callback(false)
        })
        return res;
    }
};

$(function () {
    call_device("onRenderFinish");
    $(".countdown_timer").each(function () {
        new Timer($(this).attr("id"), $(this).data('callback'));
    })
})


function device_open_payment(order_name, url) {
    var paymentUrl = "/payment/" + order_name + "/method";
    if (url) {
        paymentUrl = url
    }
    var payment_workflow_ver = 1;

    var v = Cookies.get('v');
    if (v) {
        v = v.toLowerCase();
        var _versions = v.split('_');
        var ver = _versions[_versions.length - 1];
        if (v.indexOf('android') != -1 && ver >= '3.1.0') {
            payment_workflow_ver = 2;
        } else if (v.indexOf('ios') != -1 && ver >= '1.7.0') {
            payment_workflow_ver = 2;
        }
    }

    if (payment_workflow_ver >= 2) {
        // 调用原生接口
        var param = JSON.stringify({
            url: paymentUrl,
            order_name: order_name
        });
        call_device("open_payment", param);
    } else {
        location.href = paymentUrl;
    }
    return false;
}

function createFunctionWithTimeout(callback, opt_timeout) {
    var called = false;
    function fn() {
        if (!called) {
            called = true;
            callback();
        }
    }
    setTimeout(fn, opt_timeout || 1000);
    return fn;
}

// 只在设备内外都需要打开某页面时使用，没安装app引导下载,不带参数去首页
function open_specified_page(page_url) {
    if (is_device()) {
        if (page_url) {
            location.href = page_url;
        }
        else {
            notify_device('shop_list', {});
        }
    }
    else {
        if (!page_url) {
            page_url = '/product_list'
        }
        var isiOS = navigator.userAgent.match('iPad') || navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPod'), isAndroid = navigator.userAgent.match('Android'), isDesktop = !isiOS && !isAndroid;

        setTimeout(function () {
            if (isiOS) {
                setTimeout(function () { window.location = "itms-apps://itunes.apple.com/app/club-factory/id1112879717?mt=8"; }, 2000);
                window.location = "fromfactory:/" + page_url;
            } else if (isAndroid) {
                window.location = "intent://app.fromfactory.club" + page_url + "#Intent;scheme=fromfactory;package=club.fromfactory;end";
            } else {
                window.location = "http://clubfactory.com/";
            }
        }, 200)
    }
}


/**
 * 这个请求会产生三个事件
 * 1.收集用户的信息 => device_collect_{} 表
 * 2.收集用户的性别 => account 表
 * 3.对活跃用户进行上报
 *
 * @param is_index: 是否为首页，(collectDeviceID分为两种环境使用，一种是在首页上报，一种是切换用户信息上报)
 */
function collectDeviceID(is_index) {
    if (is_device()) {
        $.ajax({
            url: "/collect/device_id",
            data: JSON.stringify({
                is_index: is_index
            }),
            success: function (data) {
                console.log(data)
            },
            contentType: 'application/json',
            type: 'POST',
        }).fail(function () {
            console.log("An error has occurred. Please try again later.")
        });
    };
}


// 功能同open_specified_page, 但是使用了兼容性更好的market协议, 并且不写死跳转的域名
function openSpecifiedPage(pageURL) {
    if (window.utils.is_device()) {
        if (pageURL) {
            location.href = pageURL;
        } else {
            notify_device('shop_list', {});
        }
    } else {
        if (!pageURL) {
            pageURL = '/product_list';
        }
        var isiOS = navigator.userAgent.match('iPad') || navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPod'), isAndroid = navigator.userAgent.match('Android');
        if (isAndroid) {
            setTimeout(function () {
                //使用market协议处理android跳转到应用市场的逻辑
                window.location.href = 'https://app.adjust.com/7nzpgcz';
            }, 2000);
            window.location = 'fromfactory:/' + pageURL;
        } else if (isiOS) {
            setTimeout(function () {
                window.location = 'https://app.adjust.com/ulht75w';
            }, 2000);
            window.location = 'fromfactory:/' + pageURL;
        } else {
            window.location = "http://clubfactory.com/";
        }
    }
}

function Timer(name, callback) {
    this.name = name;
    this.seconds = $("#" + name).data("seconds");
    if (callback === undefined) {
        this.callback = null;
    } else {
        this.callback = eval(callback);
    }
    this.setTimer();
}

Timer.prototype = {
    constructor: Timer,
    setTimer: function setTimer() {
        if (this.seconds != 0) {
            var name = this.name;
            if (eval("typeof st_" + name) != 'undefined') {
                clearInterval(eval("st_" + name));
            }
            $("#" + name).css('display', 'inline-block');
            eval(name + "_left = this.seconds;");
            var $hour, $minute, $second;

            function left_time_to_box(name) {
                $hour = parseInt(eval(name + "_left") / 3600);
                $minute = parseInt(eval(name + "_left") / 60 % 60);
                $second = parseInt(eval(name + "_left") % 60);

                $("#" + name + " .hour_box").text($hour < 10 ? "0" + $hour : $hour);
                $("#" + name + " .minute_box").text($minute < 10 ? "0" + $minute : $minute);
                $("#" + name + " .second_box").text($second < 10 ? "0" + $second : $second);
            }

            if ($("#" + name).length && !$("#" + name).is(":hidden")) {
                left_time_to_box(name);
                if (this.callback === null) {
                    eval("st_"
                        + name
                        + "=setInterval(function(){if("
                        + name
                        + "_left==0) {if(location.pathname.indexOf('flash_sale')>-1){history.replaceState({},'','/theme/flash_sale');location.href='/theme/flash_sale'}else{call_device('errorReload')}clearInterval(st_"
                        + name
                        + ");return;}"
                        + name
                        + "_left -= 1;left_time_to_box('"
                        + name
                        + "');},1000);"
                    );
                } else {
                    var _callback = this.callback;
                    var id = this.name;

                    eval("st_"
                        + name
                        + "=setInterval(function(){if("
                        + name
                        + "_left==0) {_callback(id);clearInterval(st_"
                        + name
                        + ");return;}"
                        + name
                        + "_left -= 1;left_time_to_box('"
                        + name
                        + "');},1000);"
                    );
                }
            };
        }
    }
}


var IndiaTelephoneOperator = function () {
    this._data = {
        prepaid: [
            "Airtel",
            "BSNL",
            "Idea",
            "Jio",
            "MTNL",
            "T24",
            "Tata DoCoMo",
            "Telenor",
            "Vodafone"
        ],
        postpaid: [
            "Airtel",
            "BSNL",
            "Idea",
            "Jio",
            "MTNL Dolphin",
            "Matrix Postpaid",
            "Tata DoCoMo",
            "Tata Indicom",
            "Vodafone"
        ]
    };
    this._circleList = [
        "Andhra Pradesh & Telangana",
        "Assam",
        "Bihar & Jharkhand",
        "Chennai",
        "Delhi & NCR",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jammu & Kashmir",
        "Karnataka",
        "Kerala",
        "Kolkata",
        "Madhya Pradesh & Chhattisgarh",
        "Maharashtra & Goa",
        "Mumbai",
        "North East",
        "Orissa",
        "Punjab",
        "Rajasthan",
        "Tamil Nadu",
        "Uttar Pradesh East",
        "Uttar Pradesh West & Uttarakhand",
        "West Bengal"
    ];
};

IndiaTelephoneOperator.prototype = {
    getOperator: function getOperator(type) {
        return this._data[type];
    },
    getCircle: function getCircus(operator) {
        return this._circleList;
    }
};

$("input").click(function () {
    $(this).focus();
})

$("textarea").click(function () {
    $(this).focus();
})

function go_to_app_store() {
    var version = Cookies.get('v');
    if (!version) {
        return;
    }
    if (version.indexOf("android") > -1) {
        if (version.split("_")[1] < '4.5.0') {
            call_device('goToScore');
        }
        else {
            location.href = "https://play.google.com/store/apps/details?id=club.fromfactory";
        }
    }
    else {
        location.href = "itms-appss://itunes.apple.com/us/app/club-factory/id1112879717?mt=8";
    }
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18

function formatDate(data, fmt) {
    var data = new Date(data);
    var o = {
        "M+": data.getMonth() + 1, //月份
        "d+": data.getDate(), //日
        "h+": data.getHours(), //小时
        "m+": data.getMinutes(), //分
        "s+": data.getSeconds(), //秒
        "q+": Math.floor((data.getMonth() + 3) / 3), //季度
        "S": data.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (data.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//打开相册，选择图片
function getAlbumImages(limit, compress, max_width, callback) {
    WebViewJavascriptBridge.callHandler('getAlbumImages', 'fromfactory://clubfactory/album?limit=' + limit + 'compress=' + compress + '&max_width=' + max_width, function (data) {
        callback(data);
    })
}

