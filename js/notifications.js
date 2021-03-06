var id;

setInterval(function(){
	try{
		if (localStorage.notify_switch == 1) {
			if(localStorage.article_picked_comments!=null){
				setNotification();
			}else{
				console.log("not null");
			}
		}
	}catch(err){
		console.log(err);
	}
},100000); //30分钟通知一次

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

    //
    if(comments.indexOf("comment_content")>0){
    	console.log("有评论");

    	var tempComments = comments;
	    var count = 0;
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
	            requireInteraction: true, //通知保持常驻，用户点击才消失
	            buttons: [{
	                title: "(づ｡◕‿‿◕｡)づ报告！找到一个符合您的评论商品>>>",
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


        chrome.notifications.create(id, opt, function() {});


    }

    }else{
    	console.log("没有符合的评论");

    	for (var i = 0; i < comments.length; i++) {

	    	var items = new Array();
	        items.push({ title: "价格：", message: comments[i].article_price });

	    	var opt = {
	            type: "list", //带按钮样式的通知
	            title: comments[i].article_title,
	            message: "",
	            iconUrl: comments[i].article_pic,
	            requireInteraction: true, //通知保持常驻，用户点击才消失
	            buttons: [{
	                title: "(づ｡◕‿‿◕｡)づ报告！找到一个符合要求的商品>>>",
	                iconUrl: chrome.runtime.getURL("go.png"),
	            }, {
	                title: "点这里查看全部-值评论！",
	                iconUrl: chrome.runtime.getURL("icon.png"),
	            }],
	            items: items
	        }

	        chrome.notifications.create(comments[i].article_id, opt, function() {});

   		 }
    
	}
        

}

chrome.notifications.onClicked.addListener(function(id) {
    chrome.tabs.create({ url: "http://www.smzdm.com/p/" + id }, function() {
    	localStorage.article_picked_comments=""; //清空
    });
});


chrome.notifications.onButtonClicked.addListener(function(id, buttonIndex) {
    if (buttonIndex == 0) {
        chrome.tabs.create({ url: "http://www.smzdm.com/p/" + id }, function() {
        	localStorage.article_picked_comments=""; //清空
        });
    } else {
        chrome.tabs.create({ url: "more.html" }, function() {
        	localStorage.article_picked_comments=""; //清空
        });
    }
});

//关闭清空
chrome.notifications.onClosed.addListener(function(id) {
	console.log("通知关闭");
 	localStorage.article_picked_comments=""; //清空
});