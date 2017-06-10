var article_picked_comments;

try{
	if(localStorage.notify_switch==1){
		document.getElementById("switchInput").checked=true;
	}
	if(localStorage.notify_switch==0){

		document.getElementById("switchInput").checked=false;
	}
	//通知开关控制
	document.getElementById("switchInput").onclick = function() {
		if(document.getElementById("switchInput").checked){
			localStorage.notify_switch=1;
		}else{
			localStorage.notify_switch=0;
		}
	}
}catch(err){
	console.log(err);
}
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

	// var page=[1];
	// for(n in page){
	// 	if(page[n]!=1){
	// 		time_sort=current.substring(0,5)+"000000";
	// 	}
		ajaxUrl='https://api.smzdm.com/v1/util/editors_recommend?channel_id=18&smzdm_id=0&page='+1+'&limit=20&time_sort='+time_sort;
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

				innerHtml +='<a class="list-group-item" href="'+list[i].article_url+'" target="_blank"><div><img src="'+list[i].article_pic+'" class="main_img" alt="pic" ></div><div class="right_td" id="'+list[i].article_id+'"><h4 class="title">'+list[i].article_title+'</h4><p class="price">'+list[i].article_price+'<small class="date">'+list[i].article_date+'</small></p></div><div class="worthy"><h1>'+parseInt(worthy/(worthy+unworthy)*100)+'% 值</h1></div></a>';
				

				var url="https://api.smzdm.com/v1/comments?article_id="+list[i].article_id+"&type=haitao&limit=50&offset=0&smiles=0&atta=0&ishot=1&f=android"
				
				
				getComment(url,list[i].article_pic,list[i].article_title,list[i].article_url,list[i].article_price,list[i].article_id,list[i].article_date);
								
				}
			}
			//每10分钟获取一遍
	        setTimeout(checkStatus, 600000);
	        try{
	        	document.getElementById("innerContent").innerHTML=innerHtml;
	        }catch(err){
	        	console.log(err);
	        }
	    });

}


function getComment(url,article_pic,article_title,article_url,article_price,article_id,article_date){
	//请求所有评论内容 没有阻塞		
	httpRequest(url,function(result){
		result=JSON.parse(result);
		var resultList=result.data.rows;
		var defineKeyWord;
		var title;

		//如果设置了商品标题跟踪
		if(localStorage.title!=null){
			title=JSON.parse(localStorage.title);
			for(var n in title){
				if(article_title.indexOf(title[n])>0){
					//筛选关键字
					if(localStorage.keyword==null){
						article_picked_comments.push({article_id:article_id,article_pic:article_pic,article_url:article_url,article_price:article_price,article_title:article_title});
					}else{
						defineKeyWord=JSON.parse(localStorage.keyword);
					}


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

						}
					}
				}
			}
		}
		
		localStorage.article_picked_comments=JSON.stringify(article_picked_comments);
		
	});	

}


checkStatus();



