var	keyWordInputResult=new Array();
var titleResult=new Array();

//显示设置的参数
try{
	var tempTitle=JSON.parse(localStorage.title);
	var str="";
	var i;
	for(i=0;i<tempTitle.length;i++){
		if(i==tempTitle.length-1){
			str += tempTitle[i];
		}else{
			str += tempTitle[i]+";";
		}
	}
	document.getElementById("titleInput").value=str;
	document.getElementById("worthyValueInput").value=localStorage.defineWorthyValue;
}catch(e){
	console.log(e);
}


// getTitle
document.getElementById("setTitle").onclick = function() {
	var tempTitle=document.getElementById("titleInput").value;
	if(tempTitle=="" || tempTitle==null || tempTitle==undefined || tempTitle==" "){
		err();
		return;
	}
	//数组
	if(tempTitle.indexOf(";")>0){
		titleResult=tempTitle.split(";");
	}else if(tempTitle.indexOf("；")>0){ //防止输入中文分号
		err();
		return;
	}else{
		titleResult=tempTitle;
	}

	localStorage.title=JSON.stringify(titleResult);
	success();
}

// getworthyvalue
document.getElementById("setworthyValue").onclick = function() {
	var tempValue=document.getElementById("worthyValueInput").value;

	if(tempValue.length>3 || tempValue>100){
		err();
		return;
	}
	localStorage.defineWorthyValue=tempValue;
	success();
}

//clearKeyword
document.getElementById("clearKeyWordButton").onclick = function() {
	localStorage.keyword = null;
	success();
}



//关键字设置
document.getElementById("setKeyWordButton").onclick = function() {

    pushKeyWord("keyWordInput");
    pushKeyWord("keyWordInput2");
    pushKeyWord("keyWordInput3");
    pushKeyWord("keyWordInput4");

    
    localStorage.keyword = JSON.stringify(keyWordInputResult);
    success();
    
    
}


function err(){
	document.getElementById("tips").innerHTML="<div style='color:red;'>参数错误!</div>";
	//延时清楚提示
    setInterval(function(){
    	document.getElementById("tips").innerHTML="";
    },500)
}


function success(){
	document.getElementById("tips").innerHTML="<div style='color:green;'>设置成功!</div>";
	    //延时关闭窗口
	    setInterval(function(){
	    	window.close();
	    	// if(){
	    	// 	window.open("more.html");
	    	// }
	    },500)
}


//新增关键字
function pushKeyWord(keyWordInput){
	
	console.log(keyWordInput);
	var keyWordInputTemp=document.getElementById(keyWordInput).value;
    if(keyWordInputTemp=="" || keyWordInputTemp==" " || keyWordInputTemp==null || keyWordInputTemp==undefined ){
    	return;
    }else{
    	keyWordInputResult.push(keyWordInputTemp);
    }

}