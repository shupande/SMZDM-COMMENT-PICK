var id;

if (localStorage.notify_switch == 1) {
    console.log("work");
    setInterval(setNotification(), 100000);
}

//浏览器通知
function setNotification() {

    //查询设置通知权限
    Notification.requestPermission(function(status) { //status值有三种：default/granted/denied
        if (Notification.permission !== status) {
            Notification.permission = status;
        }
    });

    //读取评论
    var comments = JSON.parse(localStorage.article_picked_comments);
    var tempComments = comments;
    var count = 0,
        url;
    var index = new Array();

    for (var i = 0; i < comments.length; i++) {
        //两个数组遍历对比并计数
        for (var j = 0; j < tempComments.length; j++) {
            if ((comments[i].article_id == tempComments[j].article_id) && (i != j) && (comments[i].comment_content != tempComments[j].comment_content)) {
                count++;
                index.push(j);
            }
        }

        //大于一条评论
        var items = new Array();
        items.push({ title: "价格：", message: comments[i].article_price });
        items.push({ title: "评论：", message: comments[i].comment_content });
        if (count > 0) {
            for (n in index) {
                items.push({ title: "评论：", message: comments[index[n]].comment_content });
            }
        }

        var opt = {
            type: "list", //带按钮样式的通知
            title: comments[i].article_title,
            message: comments[i].comment_content,
            iconUrl: comments[i].article_pic,
            // requireInteraction: true, //通知保持常驻，用户点击才消失
            buttons: [{
                title: "(づ｡◕‿‿◕｡)づ报告！找到一个符合您的要求>>>",
                iconUrl: chrome.runtime.getURL("go.png"),
            }, {
                title: "点这里查看全部-值评论！",
                iconUrl: chrome.runtime.getURL("icon.png"),
            }],
            items: items
        }

        index = [];
        count = 0;
        id = comments[i].article_id;
        url = comments[i].article_url;

        chrome.notifications.create(id, opt, function() {});


    }

}

chrome.notifications.onClicked.addListener(function(id) {
    chrome.tabs.create({ url: "http://www.smzdm.com/p/" + id }, function() {});
});


chrome.notifications.onButtonClicked.addListener(function(id, buttonIndex) {
    if (buttonIndex == 0) {
        chrome.tabs.create({ url: "http://www.smzdm.com/p/" + id }, function() {});
    } else {
        chrome.tabs.create({ url: "more.html" }, function() {});
    }
});
