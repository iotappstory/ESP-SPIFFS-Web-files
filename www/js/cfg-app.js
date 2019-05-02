document.addEventListener("page:App", function(){
	pageAppLoader();
});

	
function pageAppLoader(){

	devComm("/app", "GET", "", "json", function(ret){
		var data = JSON.parse(ret);
		
		if(verbose){console.log("Received app json from device:"); console.log(data); console.log("Generating App tmpl page");}

		var retHtml = '<div class="page_cnt"><h1>App Settings</h1><br><form id="formAppSave" method="post">';
		for(i=0; i < NRXF; i++){
			
			if(data[i].t == 'T'){
				
				// generate html for label & textarea
				retHtml += fieldTextarea(data[i].l, data[i].n, data[i].v, (data[i].m-1));
				
			}else if(data[i].t == 'C'){
				
				// generate html for label & checkbox
				retHtml += fieldCheckbox(data[i].l, data[i].n, data[i].v, i);

			}else if(data[i].t == 'S'){
				
				// generate html for label & selectbox
				retHtml += fieldSelectbox(data[i].l, data[i].n, data[i].v);
				
			}else if(data[i].t == 'I'){
				
				// generate html for label & interval field
				retHtml += fieldInterval(data[i].l, data[i].n, data[i].v, (data[i].m-1));
				
			}else if(data[i].t == 'N'){
				
				// generate html for label & number field
				retHtml += fieldNumber(data[i].l, data[i].n, data[i].v, (data[i].m-1), data[i].t);
				
			}else{
				
				// generate html for label & field(textline, pinnumber, timezone)
				retHtml += fieldOther(data[i].l, data[i].n, data[i].v, (data[i].m-1), data[i].t);
			}
		}
		retHtml += '<div class="btn_bar_cnt"><button class="button" type="submit" disabled="disabled">Save</button></div>';
		retHtml += '</form></div>';
		
		// add generated template to the page html
		document.getElementById("scrApp").innerHTML = retHtml;
		
		// load dependencys
		loader = setInterval(function(){
			loadFileArrays();
		}, 50);
		
		
		// add EventListener | update hidden value when a checkbox is changed
		var cboxes = document.querySelectorAll("input[type=checkbox]");
		for(var i = 0; i < cboxes.length; i++){
			cboxes[i].addEventListener("change", function(event){
				event.preventDefault();
				updCboxVal(event.path[0]);
			});
		}
		
		formDuraField();
		
		var thisForm = document.getElementById("formAppSave");
		btnFormSubmit(thisForm, function(){
			submitAppForm(thisForm);
		});

	}, function(response){
		if(verbose){console.log("Failed to get app json from device");};
	});
}




/* --------------------------------- field related --------------------------------- */

// submit app settings form
function submitAppForm(thisForm){
	
	// serialize this data
	var formData = new FormData(thisForm);

	// check for validity
	if(!thisForm[0].checkValidity()){
			// not valid check form
			alert("not valid");
	}else{
		// setup new ajax request
		var xhttp = new XMLHttpRequest();
		
		// setup callbacks for success & failure
		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){
				cusAlert("Saved", "Your App settings are saved");
			}
			if(this.readyState == 4 && this.status != 200){
				cusAlert("Error!", "Could not save your App settings. Try again!");
			}
		};
		
		// start ajax request
		xhttp.open('POST', '/as');

		// send ajax request with parameters
		xhttp.send(formData);
	
	
	
		/*
		// post formData to esp
		devComm("/as", "POST", formData, "text", function(ret){
			console.log(ret);
			cusAlert("Saved", "Your App settings are saved");
		});
		*/
	}
}

// update hidden value when a checkbox is changed
function updCboxVal(thisEl){
	var nrof = thisEl.getAttribute("rel");
	if (thisEl.checked == true){
		document.querySelector('.realCBval_' + nrof).value = "1";
	}else{
		document.querySelector('.realCBval_' + nrof).value = "0";
	}
}

// input types | translate IAS letters to input types
function inputType(type){
	switch(type){
		case 'L':
			return "text";
		break;
		case 'N':
			return "number";
		break;
		case 'P':
			if(loadFileSuccess('jQuery') && !loadFileSuccess('pinout')){
				// load dependency
				loadFileArray.push({
					name:	"pinout",
					type: 	"JS", 
					url:	"https://iotappstory.com/ota/config/js/pinouts.js", 
					inte: 	"",
					cross:	"",
					loaded:	null,
					ignoreFail: true
				});
			}
			return "pinnumber";
		break;
		case 'Z':
			if(loadFileSuccess('jQuery') && !loadFileSuccess('timeZonesMap')){
				// load dependency
				loadFileArray.push({
					name:	"timeZonesMap",
					type: 	"JS", 
					url:	"https://iotappstory.com/ota/config/js/timeZonesMap.js", 
					inte: 	"",
					cross:	"",
					loaded:	null,
					ignoreFail: true
				});
				loadFileArray.push({
					name:	"momentLocales",
					type: 	"JS", 
					url:	"https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.0/moment-with-locales.min.js", 
					inte: 	"sha256-RD4uaXz3KfJR/tER2O0FDpPftthhg8kJih3adpCUkUU=",
					cross:	"anonymous",
					loaded:	null,
					ignoreFail: true
				});		
				loadFileArray.push({
					name:	"momentTimezone",
					type: 	"JS", 
					url:	"https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.14/moment-timezone-with-data-2012-2022.min.js", 
					inte: 	"sha256-vBJSPpSAuUKYXDA+2hx2dQmyhkmM91vYjXI/o5QjnmA=",
					cross:	"anonymous",
					loaded:	null,
					ignoreFail: true
				});
				loadFileArray.push({
					name:	"tzPicker",
					type: 	"JS", 
					url:	"https://iotappstory.com/js/timezone-picker.js.php", 
					inte: 	"",
					cross:	"",
					loaded:	null,
					ignoreFail: true
				});
			}
			return "timezone";
		break;
		default:
			return "text";
		break;
	}
}


/* --------------------------------- fieldTypes --------------------------------- */
function fieldTextarea(label, name, value, maxlength){
	var retHtml = "";

	retHtml += '<label for="' + name + '">' + label + '</label>';
	retHtml += '<textarea name="' + name + '" id="' + name + '" maxlength="' + maxlength + '" rows="5">' + value + '</textarea><div class="clearem"></div>';

	return retHtml;
}

function fieldCheckbox(label, name, value, i){
	var retHtml = "";
	var parts 	= label.split(':');
	var options = parts[1].split(',');
	var label 	= parts[0];
	
	var eclass = "";
	if(value == "1"){
		eclass = ' checked';
	}
	
	retHtml += '<label for="' + name + '">' + label + '</label>';
	retHtml += '<div class="inpHldB"><input type="hidden" name="' + name + '" value="' + value + '" class="realCBval_' + i + '"/><label><input type="checkbox" name="tmpCB_' + i + '" ' + eclass + ' rel="'+ i +'"/>'+ options[0] +'</label></div><div class="clearem"></div>';

	return retHtml;
}

function fieldSelectbox(label, name, value){
	var retHtml = "";
	var parts = label.split(':');
	var options = parts[1].split(',');
	var label = parts[0];
	
	retHtml += '<label for="' + name + '">' + label + '</label>';
	retHtml += '<select name="' + name + '" id="' + name + '">';
	for(ii = 0; ii < options.length; ii++){
		if(ii == value){
			retHtml += '<option value="'+ ii +'" selected="selected">'+ options[ii] +'</option>';
		}else{
			retHtml += '<option value="'+ ii +'">'+ options[ii] +'</option>';
		}
	}
	retHtml += '</select><div class="clearem"></div>';
	
	return retHtml;
}

function fieldInterval(label, name, value, maxlength){
	var retHtml = "";
	
	retHtml += '<label for="' + name + '">' + label + '</label>';
	retHtml += '<div class="inpHldB duration">';
	retHtml += '<input type="hidden" class="duraVal" name="' + name + '" id="' + name + '" value="' + value + '" maxlength="' + maxlength + '"/>';
	retHtml += '<select class="minPD">';
	var adder = 1;
	for(ii = 1; ii < 60; ii=ii + adder){
		if(ii >= 10 && ii < 20){
			adder = 5;
		}else if(ii >= 20){
			adder = 10;
		}
		if(ii == value){
			retHtml += '<option value="'+ ii +'" selected="selected">'+ ii +'</option>';
		}else{
			retHtml += '<option value="'+ ii +'">'+ ii +'</option>';
		}
	}						
	retHtml += '</select>';						
	
	retHtml += '<select class="hourPD">';
	for(ii = 1; ii < 24; ii++){

		if(ii == value){
			retHtml += '<option value="'+ ii +'" selected="selected">'+ ii +'</option>';
		}else{
			retHtml += '<option value="'+ ii +'">'+ ii +'</option>';
		}
	}						
	retHtml += '</select>';						
	
	retHtml += '<select class="dayPD">';
	var adder = 1;
	for(ii = 1; ii <= 35; ii=ii + adder){
		if(ii >= 7){
			adder = 7;
		}
		if(ii == value){
			retHtml += '<option value="'+ ii +'" selected="selected">'+ ii +'</option>';
		}else{
			retHtml += '<option value="'+ ii +'">'+ ii +'</option>';
		}
	}						
	retHtml += '</select>';
	
	retHtml += '<select name="duraType" class="duraType">';
	retHtml += '<option value="0">Minutes</option>';
	retHtml += '<option value="1">Hours</option>';
	retHtml += '<option value="2">Days</option>';
	retHtml += '</select><div class="clearem"></div>';
	retHtml += '</div><div class="clearem"></div>';
	
	return retHtml;
}

function fieldNumber(label, name, value, maxlength, type){
	var retHtml = "";
	var tempMaxVal = Math.pow(10, maxlength)-1;
	
	retHtml += '<label for="' + name + '">' + label + '</label>';
	retHtml += '<input type="' + inputType(type) + '" name="' + name + '" id="' + name + '" value="' + value + '" max="' + tempMaxVal + '" /><div class="clearem"></div>';

	return retHtml;
}

function fieldOther(label, name, value, maxlength, type){
	var retHtml = "";
	
	retHtml += '<label for="' + name + '">' + label + '</label>';
	retHtml += '<input type="' + inputType(type) + '" name="' + name + '" id="' + name + '" value="' + value + '" max="' + maxlength + '" /><div class="clearem"></div>';

	return retHtml;
}


/* --------------------------------- fieldInterval helpers --------------------------------- */
// transform given interval time(min, hour etc.) to miliseconds
function formDuraField(){
	if(document.querySelector(".duration")){
		var duraType;
		var duraFac = [60,3600,86400];
		var orgVal = document.querySelector(".duraVal").value;
		
		// default on load...
		if(orgVal < 3600){
			
			duraType = 0;
			document.querySelector(".minPD").value = (orgVal / duraFac[duraType]);
			duraField(duraType);
			
			document.querySelector('.duration .duraType option[value="0"]').selected = true;
			
		}else if(orgVal >= 3600 && orgVal < 86400){

			duraType = 1;
			document.querySelector(".hourPD").value = (orgVal / duraFac[duraType]);
			duraField(duraType);
			
			document.querySelector('.duration .duraType option[value="1"]').selected = true;
			
		}else if(orgVal >= 86400){
		
			duraType = 2;
			document.querySelector(".dayPD").value = (orgVal / duraFac[duraType]);
			duraField(duraType);
			
			document.querySelector('.duration .duraType option[value="2"]').selected = true;
		}
		
		
		
		document.querySelector('.duration .minPD').addEventListener("change", function() {
			document.querySelector(".duraVal").value = (this.value * duraFac[duraType]);
		});
		document.querySelector('.duration .hourPD').addEventListener("change", function() {
			document.querySelector(".duraVal").value = (this.value * duraFac[duraType]);
		});
		document.querySelector('.duration .dayPD').addEventListener("change", function() {
			document.querySelector(".duraVal").value = (this.value * duraFac[duraType]);
		});
		
		

		document.querySelector('.duration .duraType').addEventListener("change", function() {
			duraType = this.value;
			
			duraField(duraType, document.querySelector(".minPD").value * duraFac[duraType])
			
			if(duraType == 0){
				duraField(duraType, document.querySelector(".minPD").value * duraFac[duraType]);
				
			}else if(duraType == 1){
				duraField(duraType, document.querySelector(".hourPD").value * duraFac[duraType]);
				
			}else if(duraType == 2){
				duraField(duraType, document.querySelector(".dayPD").value * duraFac[duraType]);
			}
		});
		
		
	}
}

// update selected interval type: hour, min, sec
function duraField(duraType, val=""){
	if(duraType == 0){
		
		document.querySelector(".minPD").style.display = "block";
		document.querySelector(".hourPD").style.display = "none";
		document.querySelector(".dayPD").style.display = "none";
		
		if(val!=""){document.querySelector(".duraVal").value = val;}
		
	}else if(duraType == 1){
		
		document.querySelector(".minPD").style.display = "none";
		document.querySelector(".hourPD").style.display = "block";
		document.querySelector(".dayPD").style.display = "none";
		
		
		if(val!=""){document.querySelector(".duraVal").value = val;}
		
	}else if(duraType == 2){
		
		document.querySelector(".minPD").style.display = "none";
		document.querySelector(".hourPD").style.display = "none";
		document.querySelector(".dayPD").style.display = "block";
		
		if(val!=""){document.querySelector(".duraVal").value = val;}
	}
}