var verbose 		= false;
var winWidth, pageHldWidth;
var nrOfPage 		= 0;
var currPage 		= 1;
var swipeBusy 		= false;
var mobMenu 		= false;
var online 			= false;
var SSID, ARDUINO_BOARD, FLASH_SIZE, ACTCODE, MACADR = "";

var loader;
var loadFileArray 	= [];
var loadNext 		= true;
var loadNextNr 		= 0;

/**
	Add / load js & css
*/
loadFileArray.push({
	name:	"jQuery",
	type: 	"JS", 
	url:	"https://code.jquery.com/jquery-3.3.1.min.js", 
	inte: 	"sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=",
	cross:	"anonymous",
	loaded:	null,
	ignoreFail: true
});
loadFileArray.push({
	name:	"touchSwipe",
	type: 	"JS", 
	url:	"https://cdn.jsdelivr.net/npm/jquery-touchswipe@1.6.18/jquery.touchSwipe.min.js", 
	inte: 	"sha256-kWfLN+0hQF75VWZGuDeJogmcFTmPXOqGdHDfHoF1Lhc=",
	cross:	"anonymous",
	loaded:	null,
	ignoreFail: true
});

// get the board info as json from your device
boardInfo(function(){
	if(loadFileArray.length){
		// load xtra css & js files. When finished setup the page layout
		loader = setInterval(function(){
			loadFileArrays(setupPageLayout);
		}, 100);
	}else{
		setupPageLayout();
	}
});


function boardInfo(callback){	
	devComm("/i", "GET", "", "json", function(ret){
		var data = JSON.parse(ret);

		SSID 				= [data.s1, data.s2, data.s3];
		ARDUINO_BOARD 		= data.ab;
		
		CHIP_ID 			= data.cid;
		FREE_SKETCH_SPACE 	= parseInt(data.fss);
		SKETCH_SIZE 		= parseInt(data.ss);
		FLASH_SIZE 			= parseInt(data.fs);
		FLASH_CHIP_ID 		= parseInt(data.fid);
		
		ACTCODE 			= data.ac;
		MACADR 				= data.mc;
		NRXF 				= data.xf;
		FNGPRINT			= data.f;

		if(callback){callback();}
	});
}

/**
	Functions for loading js & css files -------------------------------------------------------------------------------------------------------------------------------------------------------
*/
function loadFileArrays(doneFunc=""){
	if(loadNext){
		loadNext = false;
		var i = loadNextNr;
		
		// load this file from the array
		loadFile(loadFileArray[i], function(){

			// load next or clear the loading interval & do callback if present
			if(loadNextNr < (loadFileArray.length-1)){
				loadNextNr++;
			}else{
				clearInterval(loader);
				loadNextNr = 0;
				if(doneFunc){
					doneFunc();
				}
			}
			
		});
	}
}

function loadFile(file, doneFunc = ""){
	if(loadFileSuccess(file.name)){
		//if(verbose){console.log("Loading:\t" + file.name + "\t| Type: " + file.type + "\t| Already loaded");}
		// skip this one
		loadNext = true;
		if(doneFunc){doneFunc();}
	}else{
		var script;

		
		// JS or CSS file? | create element
		if(file.type == "JS"){
			script = document.createElement('script');
		}else{
			script = document.createElement('link');
		}
		
		// if the file is loaded
		script.onload = function () {
			// success loading file
			file.loaded = true;
			
			// continue loading files
			loadNext = true;
			
			// print console log
			if(verbose){console.log("Loading:\t" + file.name + "\t| Type: " + file.type + "\t| Success");}
			
			if(doneFunc){doneFunc();}
		};
		
		// if loading the file failed
		script.onerror = function () {
			// failed to load file
			file.loaded = false;
			
			if(file.ignoreFail){
				// continue anyway
				loadNext = true;
			}else{
				// fail, don't load next
				loadNext = false;
			}
			
			// print console log
			if(verbose){console.log("Loading:\t" + file.name + "\t| Type: " + file.type + "\t\t| Failed");}
			
			if(doneFunc){doneFunc();}
		};
		
		// JS or CSS file? | set attributes
		if(file.type == "JS"){
			script.src = file.url;
			script.setAttribute("integrity", file.inte);
			script.setAttribute("crossorigin", file.cross);
		}else{
			script.href = file.url;
			script.setAttribute("rel", "stylesheet");
			script.setAttribute("type", "text/css");
		}

		if(file.loc != "bot"){
			// add script to document head
			document.head.appendChild(script);
		}else{
			// add script to the end of the document body
			document.body.appendChild(script);
		}
	}
}

function loadFileSuccess(file){
	var res = loadFileArray.find(o => o.name === file);
	if(res){
		if(res.loaded){
			return true;
		}
	}
	return false;
}


/**
	. -------------------------------------------------------------------------------------------------------------------------------------------------------
*/
function setupPageLayout(){
	if(verbose){console.log("\nSetting up Page Layout\n\n");}
	
	pageBuilder();
}

function pageBuilder(){
	// navigation el
	var ul = document.getElementsByClassName("mainNav")[0];
	
	// if this boards app uses "extra added fields" add the App Settings page to the navigation
	if(NRXF > 0){
		var newEl = document.createElement('li');
		newEl.setAttribute("class", "btn");
		newEl.setAttribute("data-src", "App");
		newEl.setAttribute("data-js", "true");
		newEl.innerHTML = '<div class="icon"><svg viewBox="0 0 32 32"><title/><g id="Fill"><path d="M8,12.14V2H6V12.14a4,4,0,0,0,0,7.72V30H8V19.86a4,4,0,0,0,0-7.72ZM7,18a2,2,0,1,1,2-2A2,2,0,0,1,7,18Z"/><path d="M17,20.14V2H15V20.14a4,4,0,0,0,0,7.72V30h2V27.86a4,4,0,0,0,0-7.72ZM16,26a2,2,0,1,1,2-2A2,2,0,0,1,16,26Z"/><path d="M29,8a4,4,0,0,0-3-3.86V2H24V4.14a4,4,0,0,0,0,7.72V30h2V11.86A4,4,0,0,0,29,8Zm-4,2a2,2,0,1,1,2-2A2,2,0,0,1,25,10Z"/></g></svg></div><div class="btnText">App</div>';
		ul.insertBefore(newEl, ul.children[document.querySelectorAll(".mainNav li").length-1]);
	}
	
	// navigation items
	var items = ul.getElementsByTagName("li");

	// loop thru all nav items except Exit
	for (var i = 0; i < items.length; ++i) {
		
		if(items[i].getAttribute("data-src") != "Exit"){
			// button nr / page index
			var index = i+1;
			
			// get src, js & css from the nav item
			var src = items[i].getAttribute("data-src");
			var js = items[i].hasAttribute("data-js") == true ? (items[i].getAttribute("data-js").toLowerCase() == 'true' ? true : false) : false;
			var css = items[i].hasAttribute("data-css") == true ? (items[i].getAttribute("data-css").toLowerCase() == 'true' ? true : false) : false;
			var url = "js/cfg-" + src.toLowerCase();
			
			// add pagehld for every nav item
			var pageHld = document.createElement('div');
			pageHld.setAttribute("class", "page");
			pageHld.setAttribute("id", "scr"+src);
			document.getElementById("pageScr").appendChild(pageHld);
			
			// add js file to the header or bottom of the body
			if(js){
				loadFileArray.push({
					name:	src,
					type: 	"JS", 
					url:	url + ".js", 
					inte: 	"",
					cross:	"",
					loc:	"bot",
					loaded:	null,
					ignoreFail: true
				});
			}
			
			// add css file to the header or bottom of the body
			if(css){
				loadFileArray.push({
					name:	src,
					type: 	"CSS", 
					url:	url + ".css", 
					inte: 	"",
					cross:	"",
					loc:	"bot",
					loaded:	null,
					ignoreFail: true
				});
			}

			// add on click listener to this button
			items[i].addEventListener("click", btnMainNavEvent.bind(null, items[i], index, src));
			
			// update page counter
			nrOfPage++;
		}else{
			// add on click listener to the exit button
			items[i].addEventListener("click", btnMainNavExit);
		}
	}
	
	// load dependencys
	loader = setInterval(function(){
		loadFileArrays();
	}, 100);
	
	// add on click listener to the mob button(hamburger) pulldown
	document.querySelector("nav .mobMenuBtn").addEventListener("click", btnMainNavMob);

	// give it a little to settle then runPage and scroll to the first
	setTimeout(function() {
		runPage();
		window.scrollTo(0,1);
	}, 100);
}

function runPage(){
	window.onresize = function(event) {
		resizeWin();	
	};

	// resize page if needed
	resizeWin();
	
	if(ACTCODE == "1"){
		// fade in navigation
		actFade();
		
		setTimeout(function() {
			// src aka which page to load
			var cpage = document.querySelector(".mainNav .btn:nth-child("+ currPage +")" )
			var src = cpage.getAttribute("data-src");
			cpage.classList.add("do");
			
			// Create a new event
			var event = new CustomEvent("page:"+src);

			// Dispatch the event
			document.dispatchEvent(event);
		}, 500);
	}else{
		setTimeout(function() {
			iasConfig();
		}, 100);
	}

	// if jQuery is loaded we have an internet connection and can signin to IAS
	if(loadFileSuccess('jQuery')){
		// load login screen
		$("body").on("click",".button.creatAccount", function(){
			var newWindow = window.open('https://iotappstory.com/', '_blank');
			if(newWindow){
				//Browser has allowed it to be opened
				newWindow.focus();
			}else{
				//Browser has blocked it
				cusAlert("New window blocked", "Your browser blocked us from opening a new window / tab for registering an account with iotappstory.com\n Allow popups for this website and try again. Or head over to iotappstory.com yourself.", function() {
					closePopup(false);
				});
			}
		});	

		$("body").on("click",".button.signin", function(){
			// check if this user allows local & third party cookies
			cookieCheck(function(){
				
				// only then present signinbox
				iasComm("GET", {"tmpl":"signin", "MACADR":MACADR}, "text", function(response){
					// open the signin popup 
					var popup = new openPopup("Signin", response);	
			
					// send signin cred to IAS
					$(".sendLoginBtn").on("click", function(event){
						event.preventDefault();
						var data = {"page":"signin", "MACADR":MACADR, "uname":$('.loginForm input[name=uname]').val(), "upass":$('.loginForm input[name=upass]').val()};
				
						iasComm("POST", data, "json", function(response){
							response = JSON.parse(response);
							
							// if signin was successfull update the current page, otherwise display alert
							if(response.status){
								// src aka which page to load
								var src = $(".mainNav .btn:nth-child("+ currPage +")" ).attr("data-src");
								
								// Create a new event
								var event = new CustomEvent("page:"+src);

								// Dispatch the event
								document.dispatchEvent(event);
							}else{
								cusAlert("Error", response.message);
							}
							
							popup.closePopup();
						});
					});
				});
			});
			
		});
	};	

	if(loadFileSuccess('jQuery') && loadFileSuccess('touchSwipe')){
		if(verbose){console.log("\ntouchSwipe loaded. Swiping is enabled!\n\n");}
		
		$("#pageScr").swipe({
			swipe:function(event, direction, distance, duration, fingerCount, fingerData){
				
				// swipe left
				if(!swipeBusy && direction == "left" && currPage != nrOfPage){
					
					swipeBusy = true;
					currPage++; 
					
					// src aka which page to load
					var src = $(".mainNav .btn:nth-child("+ currPage +")" ).attr("data-src");
					
					// Create a new event
					var event = new CustomEvent("page:"+src);

					// Dispatch the event
					document.dispatchEvent(event);
					
					$('#pageHld').animate({scrollLeft: $('#pageHld').scrollLeft()+pageHldWidth}, 400, function(){
						swipeBusy = false; 
					
						// take care of down states buttons
						$(".mainNav .btn").removeClass("do");
						$(".mainNav .btn:nth-child("+ currPage +")" ).addClass("do");
					});
				}
				
				// swipe right
				if(!swipeBusy && direction == "right" && currPage != 1){
					
					swipeBusy = true;
					currPage--;
					
					// src aka which page to load
					var src = $(".mainNav .btn:nth-child("+ currPage +")" ).attr("data-src");
					
					// Create a new event
					var event = new CustomEvent("page:"+src);

					// Dispatch the event
					document.dispatchEvent(event);
					
					$('#pageHld').animate({scrollLeft: $('#pageHld').scrollLeft()-pageHldWidth}, 400, function(){
						swipeBusy = false;
					
						// take care of down states buttons
						$(".mainNav .btn").removeClass("do");
						$(".mainNav .btn:nth-child("+ currPage +")" ).addClass("do");
					});
				}
			},
			threshold:75,
			excludedElements: "button, .aps_cred_cnt, input, select, textarea",
			allowPageScroll:'vertical'
		});
	}else{
		if(verbose){console.log("Could not load touchSwipe. Swiping is disabled!\n\n");}
	}
}


/**
	Functions handeling buttons -------------------------------------------------------------------------------------------------------------------------------------------------------
*/
// button func main nav
function btnMainNavEvent(thisEl, index, src){
	// if this device browser supports it: vibrate
	if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
	
	// Create a new event
	var event = new CustomEvent("page:"+src);

	// Dispatch the event
	document.dispatchEvent(event);
	
	// scroll to & load this page
	scrollToPage("scr"+src, function(){
		// update current page nr
		currPage = index;
		
		// change up & down state main nav buttons
		var btns = document.querySelectorAll("nav .btn");
		[].forEach.call(btns, function(btn){
			if(btn.getAttribute("data-src") == src){
				btn.classList.add("do");
			}else{
				btn.classList.remove("do");
			}
		});
	});
	
	if(mobMenu == true){
		mobMenuHide();
	}
}

// button func exit config
function btnMainNavExit(){
	// if this device browser supports it: vibrate
	if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
	
	if(mobMenu == true){
		mobMenuHide();
	}
	
	dialog("Exit", "Are you sure you want to exit config mode?",
		function(){
			
			// send close command to the esp, don't expect a respons
			var xh = new XMLHttpRequest();
			xh.open("GET", "/close", true);
			xh.send(null);
			
			// clear current pages
			fadeOut(document.getElementById("pageHld"), function(){
				fadeOut(document.querySelector("header"));
			});
			
			// wait 5 sec and then try to load local webapp if it responds
			setTimeout(function(){
				devComm("/", "GET", "", "text", function(ret){
					location.reload();
				});
			}, 5000);
		}
	);
}

// button func show / hide mob menu
function btnMainNavMob(){
	// if this device browser supports it: vibrate
	if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
	
	if(mobMenu == true){
		mobMenuHide();
	}else{
		mobMenuShow();
	}
}

// show mob(pulldown) menu
function mobMenuShow(){
	// this menu btn
	var btn = document.querySelector("nav .mobMenuBtn");
	
	// change btn to down state
	btn.classList.add("do");
	
	// create popup background
	var bgNav = document.createElement('div');
	bgNav.setAttribute("class", "bgPopup");
	
	// prepend background & popup to the document body
	document.body.prepend(bgNav);
	
	// fadeIn "popup" background
	fadeIn(bgNav);

	// remove fancy fadeIn from nav(used only in full menu)
	document.querySelector("header nav ul").classList.remove("fadeIn");
	document.querySelector("header nav ul").classList.add("display");
	
	// slide down menu
	if(loadFileSuccess('jQuery')){
		$('header nav ul').slideDown('slow', function(){
			mobMenu = true;
		});
	}else{
		document.querySelector("header nav ul").style.display = "block";
		document.querySelector("header nav ul").style.overflow = "visible";
	
		// wait 1 sec
		setTimeout(function(){
			mobMenu = true;
		}, 1000);
	}
}

// hide mob(pulldown) menu
function mobMenuHide(menuOnly=false){
	
	// this menu btn
	var btn = document.querySelector("nav .mobMenuBtn");
	
	// slide up menu
	if(loadFileSuccess('jQuery')){
		$('header nav ul').slideUp('fast',function(){
			btn.classList.remove('do');
			mobMenu = false;
		});
	}else{
		document.querySelector("header nav ul").style.display = "none";
		document.querySelector("header nav ul").style.overflow = "hidden";
		btn.classList.remove('do');	
		
		// wait 1 sec
		setTimeout(function(){
			mobMenu = false;
		}, 1000);
	}
	
	document.querySelector("header nav ul").classList.add("fadeIn");
	document.querySelector("header nav ul").classList.remove("display");
	
	// fadeOut "popup" background
	if(!menuOnly){
		fadeOut(document.querySelector(".bgPopup"));
	}
}

// disable form submit button untill input has changed
function btnFormSubmit(thisForm, callback){
	// add form listeners for change & keyup
	// update submit btn: set enabled (disabled = false)
	thisForm.addEventListener("change", function(){
		updateSubmitBtn(false);
	});
	thisForm.addEventListener("keyup", function(){
		updateSubmitBtn(false);
	});
	
	// add form listener for submit btn
	thisForm.querySelector("button[type=submit]").addEventListener("click", function(event){
		event.preventDefault();
		
		// update submit btn: set disabled (disabled = true)
		updateSubmitBtn(true);
		if(callback){callback();}
	});

	function updateSubmitBtn(state){
		thisForm.querySelector("button[type=submit]").disabled = state;
	}

	this.updateSubmitBtn = function(state){
		updateSubmitBtn(state);
	}
}

/**
	Other Functions -------------------------------------------------------------------------------------------------------------------------------------------------------
*/
// device activated fade in all pages and scroll to IAS settings page
function activated(){
	actFade();
	scrollToPage('scrIas',function(){
	// Create a new event
	var event = new CustomEvent("page:Ias");

	// Dispatch the event
	document.dispatchEvent(event);
	},false);
}

// device activated fade in all pages & main nav
function actFade(){
	// display all pages as they are display:none; by default
	var pages = document.querySelectorAll("#pageHld .page");
	[].forEach.call(pages, function(page){
		page.style.display = "block";
	});
	
	// fadeIn the main nav li elements 1 by 1 (css ani)
	document.querySelector(".mainNav").classList.add("fadeIn");
}

// horizontal scroll to given element(page)
function scrollToPage(el, callback, ani = true){
	
	if(!loadFileSuccess('jQuery')){
		document.getElementById("pageHld").scrollLeft = document.getElementById(el).offsetLeft;
		if(callback){callback();}
	}else{
		if(ani){
			$('#pageHld').animate({scrollLeft: $("#" + el).position().left}, 300,function(){
				if(callback){callback();}
			});
		}else{
			$('#pageHld').scrollLeft($("#" + el).position().left);
			if(callback){callback();}
		}
	}
}

// setup new ajax request
function ajaxRequest(url, cross, type, data, dataType, callbackSuc, callbackErr=""){
	
	var xhttp = new XMLHttpRequest();
	
	// setup callbacks for success & failure
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			if(callbackSuc){callbackSuc(this.responseText);}
		}
		if(this.readyState == 4 && this.status != 200){
			if(callbackErr){callbackErr(this.responseText);}
		}
	};
	
	// format data if object
	if(data != ""){
		data = typeof data == 'string' ? data : Object.keys(data).map(
			function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
		).join('&');
	}
	
	// add data to url if GET
	if(type == "GET"){
		url = url + "?" + data;
	}
	
	// start ajax request
	xhttp.open(type, url, true);

	// if crossdomain add these headers
	if(cross == true){
		xhttp.withCredentials = true;
		xhttp.crossDomain = true;
		//xhttp.setRequestHeader('Content-Type', 'text/plain');
	}
	
	if(type == "POST"){
		
		// add post / form header
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		// send ajax request with parameters
		xhttp.send(data);
		
	}else if(type == "GET"){
		
		// send ajax request
		xhttp.send();
	}
}

// communicate with IAS
function iasComm(type, data, dataType, callbackSuc, callbackErr=""){
	ajaxRequest("https://iotappstory.com/ota/config/cfg.php", true, type, data, dataType, callbackSuc, callbackErr);
}

// communicate with device	
function devComm(url, type, data, dataType, callbackSuc, callbackErr=""){
	ajaxRequest(url, false, type, data, dataType, callbackSuc, callbackErr);
}

// load tempate from the IAS cloud or spiffs
function tmplLoader(template, data, callbackSuc, callbackErr=""){
	devComm("/tmpl/"+ template +".htm", "GET", "", "text", function(response){
		if(callbackSuc){callbackSuc(response);}
	}, function(response){
		if(callbackErr){callbackErr(response);}
	});
}



function resizeWin(){
	winWidth = document.documentElement.clientWidth;
	pageHldWidth = document.getElementById("pageHld").offsetWidth;
	
	// update page horz scroller(swipe page to page...)
	document.getElementById("pageScr").style.width = (nrOfPage*pageHldWidth) + "px";
	
	// update width of all pages
	var pages = document.querySelectorAll(".page");
	[].forEach.call(pages, function(page){
		page.style.width = (pageHldWidth) + "px";
	});
	
	// scroll to the current page if misaligned during resize of window
	document.getElementById("pageHld").scrollLeft = document.querySelector(".page:nth-child("+ currPage +")").offsetLeft;
	
	// calculate navigation width
	var hdrWidth = document.querySelector("header .hld").clientWidth-20;
	var logoWidth = document.querySelector(".logo_hld").clientWidth;
	var navWidth = ((nrOfPage+1)*45)+10;
	
	// if navigation does not fit the header set it to "mobile" version
	if(hdrWidth > (navWidth+logoWidth)){
		if(mobMenu == true){
			mobMenu = false;
			fadeOut(document.getElementById("bgPopup"));
			document.querySelector("nav .mobMenuBtn").classList.remove("do");
		}
		document.querySelector("header .mainNav").classList.add("fadeIn");
		document.querySelector("header nav ul").style.display = "block";
		document.querySelector("header nav ul").classList.remove("display");
		document.querySelector("header nav ul").classList.add("fadeIn");
		document.querySelector("header nav").classList.remove("mob");
		document.querySelector("nav .mobMenuBtn").style.display = "none";
	}else{
		document.querySelector("header nav ul").style.display = "none";
		document.querySelector("header nav ul").classList.remove("fadeIn");
		document.querySelector("header nav ul").classList.add("display");
		document.querySelector("header nav").classList.add("mob");
		document.querySelector("nav .mobMenuBtn").style.display = "block";
	}
}

function fadeOut(thisEl, callback){
	thisEl.classList.add("fadeOut");
	setTimeout(function(){
		thisEl.style.display = "none";
		thisEl.classList.remove("fadeOut");
		if(callback){callback();}
	}, 1050);
}

function fadeIn(thisEl, callback){
	thisEl.style.display = "block";
	thisEl.classList.add("fadeIn");
	setTimeout(function(){
		thisEl.classList.remove("fadeIn");
		if(callback){callback();}
	}, 1050);
}

function cookieCheck(succesCallback){
	
	if(verbose){console.log("Starting cookieCheck()\nSetting local test cookie: LocalCookies=Yes;");}
	
	// local cookie check
	document.cookie = "LocalCookies=Yes;";
	
	if (document.cookie.indexOf("LocalCookies=") == -1){
		if(verbose){console.log("Local cookies are disabled");}
		cusAlert("Cookie info", "Local cookies are disabled. To enable these config pages to signin to IAS. Change your settings and enable both local & third party cookies for this site.");
	}else{
		if(verbose){console.log("Local cookies are enabled\nRemoving local test cookie: LocalCookies=Yes;");}
		
		// remove local testing cookie
		document.cookie = "LocalCookies= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	
		if(verbose){console.log("Setting third party test cookie: ThirdPartyCookies=Yes;");}
		
		// third party cookie check
		iasComm("GET", {"page":"cookieSet", "MACADR":MACADR}, "text", function(response){
			iasComm("GET", {"page":"cookieCheck", "MACADR":MACADR}, "text", function(response2){
				if(response2 == "0"){
					if(verbose){console.log("Third party cookies are disabled");}
					cusAlert("Cookie info", "Third party cookies cookies are disabled. To enable these config pages to signin to IAS. Change your settings and enable both local & third party cookies for this site.");
				}else if(response2 == "1"){
					if(verbose){console.log("Third party cookies are enabled\nRemoving third party test cookie: ThirdPartyCookies=Yes;");}
					if(succesCallback){succesCallback();}
				}
			});
		}, function(response){
			if(verbose){console.log("Setting Third party cookies failed");}
			cusAlert("Cookie info", "Setting Third party cookies failed. Check if you are connected to the internet & have cookies enabled.");
		});
	}
}

function extObj(currObj, extWith){
    Object.keys(extWith).forEach(function(key) { currObj[key] = extWith[key]; });
    return currObj;
}

function bToMB_Mb(val){
	var retVal = (val/1024)/1024;
	retVal = retVal + " MB ("+(retVal*8)+"Mb)";
	return retVal;
}
function bToMB_KB(val){
	var retVal = Math.round(val/1024);
	retVal = retVal + " KB";
	return retVal;
}

function openPopup(title, content, eclass=""){
	
	// create popup background
	var bgPopup = document.createElement('div');
	bgPopup.setAttribute("class", "bgPopup");
	
	// create popup
	var popup = document.createElement('div');
	popup.classList.add("popupCnt");
	
	// add extra classes
	if(eclass){
		for(i=0; i < eclass.length; i++){
			popup.classList.add(eclass[i]);
		}
	}
	
	// popup html
	popup.innerHTML = '<h1>'+ title +'</h1><div class="closePop"><a href="#"><img src="img/close.png" alt="Close"></a></div>' + content;
	
	// create popup listener close popup
	popup.querySelector(".closePop").addEventListener("click", function(){
		if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
		closePopup();
	});	
	
	// create bgPopup listener to close popup
	bgPopup.addEventListener("click", function(e){
		if(e.target !== e.currentTarget) return;
		if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
		closePopup();
	});
	
	// append popup to background
	bgPopup.appendChild(popup);
	
	// prepend background & popup to the document body
	document.body.prepend(bgPopup);
	
	// fade in background & popup
	fadeIn(bgPopup);
	fadeIn(popup);
	
	function closePopup(){
		fadeOut(bgPopup, function(){
			document.body.removeChild(bgPopup);
		});
	}
	
	this.closePopup = function(){
		closePopup();
	}
	
	this.window = function(){
		return bgPopup;
	}
}

function cusAlert(title, message, yesCallback) {

	var content = '<div class="popuptext">'+ message +'</div>';
	content += '<div class="popupBtnBar"><button id="btnYes">Ok</button></div>';
	
	var popup = new openPopup(title, content);

	// create dialog listener btn yes
	popup.window().querySelector(".popupBtnBar #btnYes").addEventListener("click", function(){
		if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
		if(yesCallback){yesCallback();}
		popup.closePopup();
	});
}

function dialog(title, message, yesCallback, noCallback){
	
	var content = '<div class="popuptext">'+ message +'</div>';
	content += '<div class="popupBtnBar"><button id="btnYes">Yes</button><button id="btnNo">Cancel</button></div>';
	
	var popup = new openPopup(title, content);

	// create dialog listener btn yes
	popup.window().querySelector(".popupBtnBar #btnYes").addEventListener("click", function(){
		if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
		if(yesCallback){yesCallback();}
		popup.closePopup();
	});
	
	// create dialog listener btn no
	popup.window().querySelector(".popupBtnBar #btnNo").addEventListener("click", function(){
		if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
		if(noCallback){noCallback();}
		popup.closePopup();
	});	
}
