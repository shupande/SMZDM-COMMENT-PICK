var	keyWordInputResult=new Array();

//关键字设置
function setKeyWord() {
    document.getElementById("setKeyWordButton").onclick = function() {
   
	    pushKeyWord("keyWordInput");
	    pushKeyWord("keyWordInput2");
	    pushKeyWord("keyWordInput3");
	    pushKeyWord("keyWordInput4");

	    localStorage.defineWorthyValue=document.getElementById("worthyValueInput").value;
	    localStorage.keyword = JSON.stringify(keyWordInputResult);
	    
	    document.getElementById("tips").innerHTML="<div style='color:green;'>设置成功!</div>";
	    //延时关闭窗口
	    setInterval(function(){
	    	window.close();
	    	// if(){
	    	// 	window.open("more.html");
	    	// }
	    },500)
	    
	}
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

setKeyWord();