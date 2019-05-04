// catch on document...
document.addEventListener("page:Cert", function(){
	if(!document.querySelector("#scrCert .page_cnt")){
		pageCertLoader();
	}
});


function pageCertLoader(){
	// get template from server
	tmplLoader("cert", "", function(response){
		if(verbose){console.log("Loading:\tCert\t| Type: tmpl\t\t| Success");}
		
		// add template html to document div
		document.getElementById("scrCert").innerHTML = response;
		
		// get certificate scan results
		getCertScan();
		
		// add EventListener | trigger upload field with another button
		document.getElementById("uploadCert").addEventListener("click", function(){
			document.getElementById("f").click();
		});
		
		// add EventListener | submit certificate upload form
		document.getElementById("f").addEventListener("change", function(event){
			event.preventDefault();
			submitCertForm();
		});
		
		// add EventListener | get the root certificate for iotappstory.com and upload it to the esp
		document.getElementById("getCertFromIAS").addEventListener("click", function(event){
			event.preventDefault();
			getCertFromIAS();
		});

	}, function(response){
		if(verbose){console.log("Loading:\tCert\t| Type: tmpl\t\t| Failed");}
	});
}


// submit certificate form	
function submitCertForm(){
	var thisForm = document.getElementById("form_certSave");
	
	if(!thisForm[0].checkValidity()){
		// not valid check form
		alert("not valid");
	}else{
		
		// generate form data from certificate upload form
		var formData = new FormData(thisForm);
		
		// upload form data and refresh certificate list
		uploadCertToESP(formData);
	}
}


// send get request to iotappstory.com for certificate
function getCertFromIAS(){
	if(verbose){console.log("Get IAS root certificate");}
	iasComm("GET", {"json":"getcert", "MACADR":MACADR}, "json", function(response){
		response = JSON.parse(response);
		
		if(!response.status){
			// failed try again...
			alert("Error: "+response.text);
		}else{
			
			// add received certificate to formData
			var formData = new FormData();
			formData.append('file', new File([new Blob([response.cert])], response.filename));
		
			// upload formData and refresh certificate list
			uploadCertToESP(formData);
		}
	});
}


// delete clicked certificate and refresh list
function btnDelCert(){
	event.preventDefault();

	// this clicked certificate
	var thisVal = event.path[2].getAttribute('data-del');

	// delete thisVal and get certificate scan results
	devComm("/csr", "GET", {"d":thisVal}, "text", function(ret){
		if(ret != ""){
			certScanToTable(ret);
		}else{
			alert("Failed to delete certificate!");
		}
	});
}


// upload certificates to esp helper function
function uploadCertToESP(formData){
	// setup new ajax request
	var xhttp = new XMLHttpRequest();
	
	// setup callbacks for success & failure
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			// get certificate scan results
			getCertScan(function(){
				// reset upload field
				document.getElementById("f").value = "";
			});
		}
	};
	
	// start ajax request
	xhttp.open('POST', '/certupl');

	// send ajax request with parameters
	xhttp.send(formData);
}


// get certificate scan results from device
function getCertScan(callback){
	devComm("/csr", "GET", "", "text", function(ret){
		
		certScanToTable(ret);
		
		// if present callback
		if(callback){callback();}
	});
}


function certScanToTable(ret){
	if(verbose){console.log("Update:\t\tCert scan results");}
	
	// scan results to table
	var retHtml = "";
	
	// if ret is is not empty create table data
	if(ret != "[]"){
		var obj = JSON.parse(ret);
		
		obj.forEach(function(value, key){
			retHtml += '<tr>';
			retHtml += '<td>'+ value.n +'</td>';
			retHtml += '<td>'+ value.s +' bytes</td>';
			retHtml += '<td class="col_del"><a href="#" data-del="'+ value.n +'" onclick="btnDelCert()" title="Delete this certificate"><svg viewBox="0 0 48 48"><path id="svg_1" fill="none" d="m0,0.083757l48,0l0,48l-48,0l0,-48z"/><path stroke="null" id="svg_2" d="m8.051476,42.582679c0,2.923896 2.392278,5.316174 5.316174,5.316174l21.264698,0c2.923896,0 5.316174,-2.392278 5.316174,-5.316174l0,-31.897046l-31.897046,0l0,31.897046zm6.552185,-18.925581l3.761193,-3.761193l5.635145,5.635145l5.635145,-5.635145l3.761193,3.761193l-5.635145,5.635145l5.635145,5.635145l-3.761193,3.761193l-5.635145,-5.635145l-5.635145,5.635145l-3.761193,-3.761193l5.635145,-5.635145l-5.635145,-5.635145zm18.699643,-20.945727l-2.658087,-2.658087l-13.290436,0l-2.658087,2.658087l-9.303305,0l0,5.316174l37.213221,0l0,-5.316174l-9.303305,0z"/></svg></a></td>';
			retHtml += '</tr>';
		});
	}
	
	// add the rows to the table
	document.querySelector('#scrCert .certList').innerHTML = retHtml;
}
