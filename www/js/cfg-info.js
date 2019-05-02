loadFileArray.push({
	name:	"ChartJs",
	type: 	"JS", 
	url:	"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.js", 
	inte: 	"sha256-JG6hsuMjFnQ2spWq0UiaDRJBaarzhFbUxiUTxQDA9Lk=",
	cross:	"anonymous",
	loaded:	null,
	ignoreFail: true
});

// load ChartJs
loader = setInterval(function(){
	loadFileArrays(function(){updateInfoTmpl()});
}, 50);


document.addEventListener("page:Info", function(){
	if(!document.querySelector("#scrInfo .page_cnt")){
		pageInfoLoader();
	}else{
		updateInfoTmpl();
	}
});

function pageInfoLoader(){
	tmplLoader("info", "", function(response){
		if(verbose){console.log("Loading:\tInfo\t| Type: tmpl\t\t| Success");};
		
		// add received template to the page html
		document.getElementById('scrInfo').innerHTML = response;
		
		// update template values
		updateInfoTmpl();
	}, function(response){
		if(verbose){console.log("Loading:\tInfo\t| Type: tmpl\t\t| Failed");};
	});
}

	


// update template values
function updateInfoTmpl(){
	if(verbose){console.log("Update:\t\tInfo tmpl values");}
	
	// update information with values from your device
	document.querySelector('#scrInfo .fss').innerHTML 	= bToMB_KB(FREE_SKETCH_SPACE);
	document.querySelector('#scrInfo .ss').innerHTML 	= bToMB_KB(SKETCH_SIZE);
	document.querySelector('#scrInfo .syss').innerHTML 	= bToMB_KB(FLASH_SIZE - FREE_SKETCH_SPACE - SKETCH_SIZE);
	document.querySelector('#scrInfo .fs').innerHTML 	= bToMB_KB(FLASH_SIZE);
	
		

	updateIASinfo();
	updatePieChart();
}

function updateIASinfo(){
	iasComm("GET", {"json":"info", "MACADR":MACADR}, "json", function(response){
		response = JSON.parse(response);
		if(response.status == true){
			// hide login message
			document.getElementById("needlogin").style.display = "none";
			
			// update information with values from IAS
			document.getElementById("dev_title").innerHTML 			= response.dev_title;
			document.getElementById("proj_title").innerHTML 		= response.proj_title;
			document.getElementById('brd_type').innerHTML 			= response.brd_type;
			//document.getElementById("brd_core").innerHTML 		= response.brd_core;
			document.getElementById("app_title").innerHTML 			= response.app_title;
			document.getElementById("dev_last_update").innerHTML 	= response.dev_last_update;
			document.getElementById("dev_last_check").innerHTML 	= response.dev_last_check;
			
			// update width of all pages
			var hiddenEl = document.querySelectorAll(".infbox.hidden");
			[].forEach.call(hiddenEl, function(el){
				el.classList.remove("hidden");
			});
		}else{
			// show login message
			document.getElementById("needlogin").style.display = "block";
		}
		
	},function(response){
		// show login message
		document.getElementById("needlogin").style.display = "block";
	});
}
function updatePieChart(){
	// if ChartJs is loaded(from online CDN) add pie chart to the page
	if(loadFileSuccess('ChartJs')){
	
		// only animate the piechart the first time
		if(!document.querySelector("#scrInfo .chartjs-size-monitor")){
			var pieChartAni = 1000;
		}else{
			var pieChartAni = 0;
		}

		// configure & create pie chart
		var config = {
			type: 'pie',
			data: {
				datasets: [{
					data: [SKETCH_SIZE, FREE_SKETCH_SPACE, (FLASH_SIZE - FREE_SKETCH_SPACE - SKETCH_SIZE)],
					backgroundColor: [
						"#fcbc12",
						"#5b5b5b",
						"#FFF",
						"#000"
					],
					borderWidth: '1',
					label: 'Dataset 1'
				}],
				labels: ["Sketch Size","Free Sketch","System"]
			},
			options: {
				animation: {
					duration: pieChartAni
				},
				title:{
					display:false,
					fontColor: "white",
					text:'Flash'
				},
				responsive: true,
				maintainAspectRatio: true,
				legend: {
					position: 'bottom',
					labels: {
						fontColor: "white",
					}
				},
				tooltips: {
					mode: 'index',
					intersect: true,
					callbacks: {
						label: function(tooltipItem, data) {
							var val = Number(data.datasets[0].data[tooltipItem.index]);
							return ' ' + data.labels[tooltipItem.index] + " - " + bToMB_KB(val);
						}
					}
				},
			}
		};

		var ctx = document.getElementById("flashmem").getContext("2d");
		window.myPie = new Chart(ctx, config);
	}
};