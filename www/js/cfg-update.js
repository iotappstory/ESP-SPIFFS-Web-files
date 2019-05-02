document.addEventListener("page:Update", function(){
	if(!document.querySelector("#scrUpdate .page_cnt")){
		pageUpdateLoader();
	}
});


function pageUpdateLoader(){
	
	tmplLoader("update", "", function(response){
	//devComm("/tmpl/update.htm", "GET", "", "text", function(response){
		if(verbose){console.log("Loading:\tUpdate\t| Type: tmpl\t\t| Success");}
		
		// add template html to document div
		 document.getElementById('scrUpdate').innerHTML = response;
		
		// add EventListener | trigger upload field with another button
		document.getElementById("uploadFirm").addEventListener("click", function(){
			document.querySelector("#form_lclUpl #f").click();
		});
		
		// add EventListener | submit certificate upload form
		document.querySelector("#form_lclUpl #f").addEventListener("change", function(event){
			event.preventDefault();
			submitUplForm();
		});
	});
}


// submit upload form	
function submitUplForm(){
	var thisForm = document.getElementById("form_lclUpl");
	
	if(!thisForm.checkValidity()){
		// not valid check form
		alert("not valid");
	}else{
		
		// generate form data from certificate upload form
		var formData = new FormData(thisForm);
		
		// upload form data
		uploadFirmwareToESP(formData);
	}
}


// upload certificates to esp helper function
function uploadFirmwareToESP(formData){

	// setup new ajax request
	var xhttp = new XMLHttpRequest();
	
	// setup callbacks for success & failure
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4){
			// show popup with the received error
			cusAlert("Success", "Your firmware has been updated!</br>Your device is now rebooting. You can close this window.");
		}
	};
	
	// start ajax request
	xhttp.open('POST', '/update', true);

	// send ajax request with parameters
	xhttp.send(formData);
}