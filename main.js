
checkStatus();
var article_picked_comments,
			  comment_count,
					temp_id,
					id;


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
	var current=Math.round(new Date().getTime()/10)+"";
	var time_sort="";
	var ajaxUrl="";
	//定义空字符串用来拼接显示网页
	var innerHtml='';
	// console.log(time_sort);
	//初始化
	article_picked_comments=new Array();
	temp_id=[];

	var page=[1];
	for(n in page){
		if(page[n]!=1){
			time_sort=current.substring(0,5)+"000000";
		}
		ajaxUrl='https://api.smzdm.com/v1/util/editors_recommend?channel_id=18&smzdm_id=0&page='+page[n]+'&limit=20&time_sort='+time_sort;
		//依次查询
		httpRequest(ajaxUrl,function(data){
		//解析JSON
		data=JSON.parse(data);
		var list=data.data.rows;

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

				innerHtml +='<tr><td><img src="'+list[i].article_pic+'" class="main_img" alt="pic" ></td><td class="right_td" id="'+list[i].article_id+'"><h4 class="title">'+list[i].article_title+'</h4><p class="price">'+list[i].article_price+'<small class="date">'+list[i].article_date+'</small></p><p><a href="'+list[i].article_url+'" class="btn btn-success" role="button" target="_blank">查看</a></p></td><td><h1 class="worthy">'+parseInt(worthy/(worthy+unworthy)*100)+'% 值</h1></td></tr>';
				

				var url="https://api.smzdm.com/v1/comments?article_id="+list[i].article_id+"&type=haitao&limit=50&offset=0&smiles=0&atta=0&ishot=1&f=android"
				
				// console.log(list[i].article_title+"====数组编号："+i);
				// console.log(list[m].article_url);
				
				getComment(url,list[i].article_pic,list[i].article_title,list[i].article_url,list[i].article_price,list[i].article_id,list[i].article_date);
								
				}
			}
			//每10分钟刷新一遍
	        setTimeout(checkStatus, 600000);
	        document.getElementById("innerContent").innerHTML=innerHtml;
	    });
	    
	}
	
    //设置通知
    setNotification();
}


function getComment(url,article_pic,article_title,article_url,article_price,article_id,article_date){
	//请求所有评论内容 没有阻塞		
	httpRequest(url,function(result){
		result=JSON.parse(result);
		var resultList=result.data.rows;
		//筛选关键字
		var defineKeyWord=JSON.parse(localStorage.keyword) || "{快}";

		//筛选评论
		for(var k in resultList){
			// console.log(resultList[k].comment_content);

			for(var j in defineKeyWord ){
				//评论关键字筛选
				if(resultList[k].comment_content.indexOf(defineKeyWord[j])>0){
				//排除快递字样
					if(((resultList[k].comment_content.indexOf("快递")>0) || (resultList[k].comment_content.indexOf("营养快线")>0)) ==false){

						article_picked_comments.push({article_id:article_id,article_pic:article_pic,article_url:article_url,article_price:article_price,article_title:article_title,comment_content:resultList[k].comment_content});

					}

				}

				//
				

				//多条评论组合
	
			}
		}

		localStorage.article_picked_comments=JSON.stringify(article_picked_comments);
		// console.log(comment_count);
		
	});	

}

//article_pic,article_title,article_url,comment_content,article_price,article_id

//浏览器通知
function setNotification(){

	//查询设置通知权限
		// Notification.requestPermission().then(function(permission) { 

		 // });
	Notification.requestPermission(function(status){  //status值有三种：default/granted/denied
	  if(Notification.permission !== status){
	    Notification.permission = status;
	  }
	});
	
	//读取评论
	var comments=JSON.parse(localStorage.article_picked_comments);
	var tempComments=comments;
	var count=0,url;
	var index=new Array();
	var tag='';

	for(var i=0;i<comments.length;i++){
		//两个数组遍历对比并计数
		for(var j=0; j<tempComments.length;j++){
			if((comments[i].article_id==tempComments[j].article_id) && (i!=j) && (comments[i].comment_content!=tempComments[j].comment_content)){
				count++;
				index.push(j);
			}
		}

			//大于一条评论
			var items=new Array();
			items.push({title:"价格：",message:comments[i].article_price});
			items.push({title:"评论：",message:comments[i].comment_content});
			if(count>0){
				for(n in index){
					items.push({title:"评论：",message:comments[index[n]].comment_content});
				}
			}

			var opt = {
			  type: "list",	 //带按钮样式的通知
			  title: comments[i].article_title,
			  message: comments[i].comment_content,
			  iconUrl: comments[i].article_pic,
			  // requireInteraction: true, //通知保持常驻，用户点击才消失
			  buttons: [{
		    	title: "(づ｡◕‿‿◕｡)づ报告！找到一个符合您的要求>>>",
				iconUrl: chrome.runtime.getURL("go.png"),
	    	  },{
		    	title: "点这里查看全部-值评论！",
				iconUrl: chrome.runtime.getURL("icon.png"),
	    	  }],
			  items: items
			}

		index=[];
		count=0;
		id=comments[i].article_id;
		url=comments[i].article_url;

		chrome.notifications.create(id,opt,function (id) {
		     	tag=id;
		   	});

		



		//
		// setInterval(function(){
		// 		chrome.notifications.create(id,opt,function () {
		//      	// console.log(article_id);
		//    	});
		// },10000);

		

	}

	
	//点击主体
	     
	 //点击按钮
	

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

chrome.notifications.onClicked.addListener(function(id) {
			// window.open(article_url);
		chrome.tabs.create({url:"http://www.smzdm.com/p/"+id}, function(){});
	});


chrome.notifications.onButtonClicked.addListener(function(id,buttonIndex){
		if(buttonIndex==0){
			 chrome.tabs.create({url:"http://www.smzdm.com/p/"+id}, function(){});
		}else{
			 chrome.tabs.create({url:"more.html"}, function(){});
		}
	});

// chrome.notifications.onClosed.addListener(function (id) {
//     chrome.notifications.onButtonClicked.removeListener(function(id){});
// });

// chrome.notifications.clear("tip_", function() {});
//

