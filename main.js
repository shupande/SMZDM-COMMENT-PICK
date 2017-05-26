
checkStatus();
var article_picked_comments,
			  comment_count,
					temp_id;

//ajax 
function httpRequest(url, callback) { 
	var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) { 
        	callback(xhr.responseText); 
        } 
    }
    xhr.onerror=function(){
    	callback(false);
    }
    xhr.send(); 
}



//定时获取精选数据并解析
function checkStatus(){
	var current=Math.round(new Date().getTime()/10);
	console.log(current);
	//初始化
	article_picked_comments=new Array();
	temp_id=[];

    httpRequest('https://api.smzdm.com/v1/util/editors_recommend?channel_id=18&smzdm_id=0&page=1&limit=20&time_sort=',function(data){
		//解析JSON
		data=JSON.parse(data);
		var list=data.data.rows;
		//定义空字符串用来拼接显示网页
		var innerHtml='';
		//如果用户没有自定义，默认显示60%值以上的商品
		var defineWorthyValue=localStorage.defineWorthyValue || 60;
		//详细解析json并赋值
		for(var i in list){
			//值值大于50的
			var worthy=parseInt(list[i].article_worthy);
			var unworthy=parseInt(list[i].article_unworthy);

			//大于用户设定值和评论数在2个以上的才进行筛选
			if((worthy/(worthy+unworthy)*100)>defineWorthyValue && parseInt(list[i].article_comment) >2){
				// console.log(localStorage.defineWorthyValue);
				
				var m=i;
				innerHtml +='<tr><td><img src="'+list[m].article_pic+'" class="main_img" alt="pic" ></td><td class="right_td" id="'+list[m].article_id+'"><h4 class="title">'+list[m].article_title+'</h4><p class="price">'+list[m].article_price+'<small class="date">'+list[m].article_date+'</small></p><p><a href="'+list[m].article_url+'" class="btn btn-success" role="button" target="_blank">查看</a></p></td><td><h1 class="worthy">'+parseInt(worthy/(worthy+unworthy)*100)+'% 值</h1></td></tr>';
				document.getElementById("innerContent").innerHTML=innerHtml;

				var url="https://api.smzdm.com/v1/comments?article_id="+list[i].article_id+"&type=haitao&limit=50&offset=0&smiles=0&atta=0&ishot=1&f=android"
				
				// console.log(list[i].article_title+"====数组编号："+i);
				// console.log(list[m].article_url);
				
				getComment(url,list[i].article_pic,list[i].article_title,list[i].article_url,list[i].article_price,list[i].article_id,list[i].article_date);
								
			}
		}
		//每10分钟刷新一遍
        setTimeout(checkStatus, 1000000);
    });
}


function getComment(url,article_pic,article_title,article_url,article_price,article_id,article_date){
	//请求所有评论内容 没有阻塞		
	httpRequest(url,function(result){
		result=JSON.parse(result);
		var resultList=result.data.rows;
		//筛选关键字
		var defineKeyWord=JSON.parse(localStorage.keyword) || "{快}";
		comment_count=0;//重置

		console.log("↓↓↓↓↓↓↓↓↓一个商品的评论开始↓↓↓↓↓↓↓↓↓");
		//筛选评论
		for(var k in resultList){
			console.log(resultList[k].comment_content);

			for(var j in defineKeyWord ){

				//评论关键字筛选
				if(resultList[k].comment_content.indexOf(defineKeyWord[j])>0){
				//排除快递字样
					if(((resultList[k].comment_content.indexOf("快递")>0) || (resultList[k].comment_content.indexOf("营养快线")>0)) ==false){
						
					
						temp_id.push(article_id);

						for(var l in temp_id){
							if(article_id==temp_id[l]){
								comment_count++;
							}
						}
						
						article_picked_comments.push({article_id:article_id,comment_content:resultList[k].comment_content});

						// setNotification(article_pic,article_title,article_url,resultList[k].comment_content,article_price,article_id);



						// console.log("符合条件:》》》》》》===="+resultList[k].comment_content);
						// console.log(article_url);
					}

				}

				//
				

				//多条评论组合
	
			}
		}

		localStorage.article_picked_comments=JSON.stringify(article_picked_comments);
		console.log(comment_count);
		
	});	

}


//浏览器通知
function setNotification(article_pic,article_title,article_url,comment_content,article_price,article_id){
	
	
	var comments=JSON.parse(localStorage.article_picked_comments);

	for(var i in comments){
		console.log(comments[i].article_id);
	}

	//查询设置通知权限
	// Notification.requestPermission().then(function(permission) { 

	 // });
	Notification.requestPermission(function(status){  //status值有三种：default/granted/denied
	  if(Notification.permission !== status){
	    Notification.permission = status;
	  }
	});
	// var tag='';

	//chrome rich notifications
    var opt = {
		  type: "list",	 //带按钮样式的通知
		  title: article_title,
		  message: comment_content,
		  iconUrl: article_pic,
		  // requireInteraction: true, //通知保持常驻，用户点击才消失
		  buttons: [{
	    	title: "(づ｡◕‿‿◕｡)づ报告！找到一个符合您的要求>>>",
			iconUrl: chrome.runtime.getURL("go.png"),
    	  },{
	    	title: "点这里查看全部-值评论！",
			iconUrl: chrome.runtime.getURL("icon.png"),
    	  }],
		  items: [{ title: "价格：", message: article_price},
		          { title: "评论：", message: comment_content},
		          { title: "Item3", message: ""}]
		}

     chrome.notifications.create(article_id,opt,function (article_id) {
     	// console.log(article_id);
     });


     //点击主体
     chrome.notifications.onClicked.addListener(function(article_id) {
     							// window.open(article_url);
								chrome.tabs.create({url:article_url}, function(){});
							});
     //点击按钮
     chrome.notifications.onButtonClicked.addListener(function(article_id,buttonIndex){
     							if(buttonIndex==0){
     								 chrome.tabs.create({url:article_url}, function(){});
     							}else{
     								 chrome.tabs.create({url:"more.html"}, function(){});
     							}
							});

	// //通知的各项参数
	// var options={
	//             type: "list",
	//             title: "test",
	//             iconUrl: "/icon.png",
	//             items: items,
	//             // body: article_title+"\n价格："+article_price+"\n\n"+"评价内容："+comment_content,
	//             buttons:[{
	//             	title:"去看看",
	//             	iconUrl: chrome.runtime.getURL("icon.png"),
	//             }]
	//         };
	//  //rich notifications
	//  var Id = article_id;
	//  try{
	//  	chrome.notifications.create(Id, options, function(){});
	//  }catch(e){

	//  }
	 
	//显示通知，及点击通知后跳转设置
	// if(Notification && Notification.permission === "granted"){
 //        var n = new Notification("新发现符合要求的商品！", options,function() {});    
 //        n.onshow = function(){
 //            console.log("You got me!");
 //        };
 //        n.onclick = function() {
 //            console.log("You clicked me!");
 //            window.open(article_url);
 //        };
 //        n.onclose = function(){
 //            console.log("notification closed!");
 //        };        
 //        n.onerror = function() {
 //            console.log("An error accured");
 //        }            
 //    }
}


//



//去重复
function id_unique(arr) {
        var newArr = [],
        		   i=0;
        for(; i < arr.length; i++) {
            var a = arr[i];
            console.log(a);
            if(newArr.indexOf(a) !== -1) {  
                continue;
            }else {
                newArr[newArr.length] = a;    
            } 
        }
         console.log(newArr)
     // return newArr;                    
}