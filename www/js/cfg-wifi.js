document.addEventListener("page:Wifi", function(){
	if(!document.querySelector("#scrWifi .page_cnt")){
		pageWifiLoader();
	}else{
		getWifiScan();
	}
});

	
function pageWifiLoader(){
	tmplLoader("wifi", "", function(response){
	//devComm("/tmpl/wifi.htm", "GET", "", "text", function(response){
		if(verbose){console.log("Loading:\tWifi\t| Type: tmpl\t\t| Success");}
		
		// add received template to the page html
		document.getElementById('scrWifi').innerHTML = response;
	
		// update template values
		updateWifiTmpl();
		
		// add EventListener | btn click scan for wifi AP
		document.getElementById("scanWifi").addEventListener("click", btnAPScan);
		
		// add EventListener | btn click select AP tab
		var tabs = document.querySelectorAll(".aps_header .aps_tab");
		for(var i = 0; i < tabs.length; i++){
			tabs[i].children[0].addEventListener("click", function(event){
				btnSwitchTab(event.path[1]);
			});
		}
		
		// add EventListener | save wifi credentials: AP1, AP2, etc.
		var apForms = document.querySelectorAll(".aps_cred .form_saveWifi");
		for(var i = 0; i < apForms.length; i++){
			apForms[i].addEventListener("submit", function(event){
				event.preventDefault();
				saveWifiCred(event.path[0]);
			});
		}
	}, function(response){
		if(verbose){console.log("Loading:\tWifi\t| Type: tmpl\t\t| Failed");};
	});
};

function updateWifiTmpl(){
	if(verbose){console.log("Update:\t\tWifi tmpl values");}
	
	// update values
	document.querySelector('.aps_cred.t1 #s').value = SSID[0];
	document.querySelector('.aps_cred.t2 #s').value = SSID[1];
	document.querySelector('.aps_cred.t3 #s').value = SSID[2];

	// get a list of available AP's from your device and add them to the page
	getWifiScan();
}


// button clicked | (re)scan for wifi AP's
function btnAPScan(){
	if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
	
	getWifiScan(function(){
		if(typeof navigator.vibrate === "function"){ navigator.vibrate(45,400,45); }
	});
}


// scan results row clicked | select this wifi AP
function c(thisEl){
	if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }
	
	document.querySelector(".aps_cred.active #s").value = thisEl.innerHTML;
	document.querySelector(".aps_cred.active #s").focus();
};


// select AP tab on click
function btnSwitchTab(tab){
	if(typeof navigator.vibrate === "function"){ navigator.vibrate(35); }

	// t1, t2 or t3
	var current = tab.getAttribute('class');
	current = current.replace('aps_tab ','');
	current = current.replace(' active','');
	
	// remove all active classes from the tabs
	var tabs = document.querySelectorAll(".aps_header .aps_tab");
	for(var i = 0; i < tabs.length; i++){
		tabs[i].classList.remove('active');
	}
	// add active class to the current tab
	tab.classList.add('active');
	
	// remove all active classes from the aps_cred boxes
	var boxes = document.querySelectorAll(".aps_cred");
	for(var i = 0; i < boxes.length; i++){
		boxes[i].classList.remove('active');
	}
	// add active class to the current aps_cred box
	document.querySelector('.aps_cred.'+current).classList.add('active');
}


// check form validity and send values to device
function saveWifiCred(formEl){
	if(!formEl.checkValidity()){
		// not valid check form
		alert("not valid");
	}else{
			
		devComm("/wsa", "POST", {"i":formEl.elements["i"].value, "s":formEl.elements["s"].value, "p":formEl.elements["p"].value}, "text", function(ret){
			
			cusAlert("Saved", "Your Wifi settings are saved");
		});
	}
}


// get wifi scan results from device
function getWifiScan(callback){
	if(verbose){console.log("Update:\t\tWifi scan results");}
	
	// animate the scanning icon
	document.getElementById('scanWifi').classList.add('active');
	
	// change title to scanning
	document.querySelector('.scanResHdr h2').innerHTML = "Scanning";
	
	// get wifi scan from esp
	devComm("/wsc", "GET", "", "text", function(ret){
		
		// return the received AP list
		document.querySelector('.scanRes.apList').innerHTML = ret;
		
		// add locked icon & classes to the returned html
		var table = document.querySelector('.scanRes.apList');
		for(var i = 0, row; row = table.rows[i]; i++){
			for(var j = 0, col; col = row.cells[j]; j++){
				
				if(j == 1){
					col.classList.add('col_perc');
				}else if(j == 2){
					var tv = col.innerHTML;
					var retIcon = '';
					
					col.classList.add('col_lock');
					col.removeAttribute('data-e');
					
					if(tv != "7"){
						retIcon = '<svg viewBox="5 0 128 128"><path d="M94.23,32.851v22.938H48.745V32.851c0-12.558,10.184-22.743,22.744-22.743C84.048,10.107,94.23,20.29,94.23,32.851    M62.367,84.167c0-5.039,4.085-9.122,9.122-9.122c5.039,0,9.122,4.083,9.122,9.122c0,3.889-2.437,7.198-5.864,8.514v29.277H68.23   V92.681C64.804,91.366,62.367,88.054,62.367,84.167 M120.946,136.716L120.946,136.716l0.001-76.429h-0.001   c0-0.004,0.001-0.008,0.001-0.012c0-2.478-2.008-4.487-4.487-4.487c-0.004,0-0.008,0.001-0.012,0.001v-0.001h-12.107V32.851   C104.341,14.707,89.632,0,71.489,0C53.345,0,38.637,14.707,38.637,32.851v22.938H26.529v0.001c-0.004,0-0.009-0.001-0.013-0.001   c-2.478,0.001-4.485,2.009-4.485,4.487c0,0.004,0.001,0.008,0.001,0.012h-0.001v76.429h0.001c0,0.007-0.001,0.011-0.001,0.015   c0,2.475,2.008,4.486,4.486,4.486c0.004,0,0.009-0.001,0.013-0.001v0.001h89.921v-0.001c0.004,0,0.008,0.001,0.012,0.001   c2.477,0,4.488-2.008,4.488-4.486C120.947,136.724,120.946,136.72,120.946,136.716"/></svg>';
					}
					
					col.innerHTML = retIcon;
				}
			}  
		}
		
		// stop animate the scanning icon
		document.getElementById('scanWifi').classList.remove('active');
		
		// return the org title
		document.querySelector('.scanResHdr h2').innerHTML = "Scan Results:";
		
		// if present callback
		if(callback){callback();}
	});
}