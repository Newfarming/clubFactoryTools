window.onload = function onpageload() {
    chrome.runtime.sendMessage({ action: "get_items" }, function (response) {
        // dt.items = response.items;
        // dt.render(with_xy);
        console.log('response', response)
        this.document.writeln(JSON.stringify(response));
    });
};
