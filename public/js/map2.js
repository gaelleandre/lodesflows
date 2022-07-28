

const width = screen.width, height = 900;


//QUELLE CARTE AFFICHER ?

let selectVille = document.getElementById("ville-select");
let villeAffichee = selectVille.value;
let flows_in = document.getElementById("flows_in");
let toggle = document.getElementById("toggle")



var dictVilles = {
	"LosAngeles": "California",
	"SanFrancisco": "California",
	"Seattle": "Washington",
	"Houston": "Texas"
  };


const map = d3.geoPath();
//const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

let svg = d3.select("#carte1")
		.append("svg")
		.attr("id", "svg1")
		.attr("width", width)
		.attr("height", height);

var projection = d3.geoAlbers();

let county = svg.append("g");
let tracts = svg.append("g");
let flux = svg.append("g");

//let projection = []
let tract_clique = []

let click = false

let MG = false;

// DRAW FLUX

function draw_all_flux() {

	d3.selectAll("line").remove();
	flux = svg.append("g");


	for (let i = 0; i < data_flux_clusters.X_WORK.length; i++) {

			let cWORK = projection([data_flux_clusters.X_WORK[i], data_flux_clusters.Y_WORK[i]])
			let cHOME = projection([data_flux_clusters.X_HOME[i], data_flux_clusters.Y_HOME[i]])

			flux.append('line')
				.style("stroke", "#77b68c")
				.style("opacity", 0.7)
				.style("stroke-width", data_flux_clusters.JOBS[i] * 0.0002)
				.attr("x1", cWORK[0])
				.attr("y1", cWORK[1])
				.attr("x2", cHOME[0])
				.attr("y2", cHOME[1]);



	}

}


//FONCTION QUI FONCTIONNE MAIS PAS TRES PROPRE

function draw_flux(tract_clicked) {

	d3.selectAll("line").remove();
	flux = svg.append("g");



	for (let i = 0; i < data_flux.X_WORK.length; i++) {

		if (flows_in.checked == true & data_flux.WORK_GEOID20[i] == tract_clicked & data_flux.JOBS[i] >= parseInt(threshold.value)) {

			let cWORK = projection([data_flux.X_WORK[i], data_flux.Y_WORK[i]])
			let cHOME = projection([data_flux.X_HOME[i], data_flux.Y_HOME[i]])

			flux.append('line')
				.style("stroke", function () {
					
					if (data_flux.INCOME[i] == 'HIGH') {return '#44c184'}
					else if (data_flux.INCOME[i] == 'MID') {return '#f9e058'}
					else {return '#cf4135'}

				}
				)
				.style("opacity", 0.7)
				.style("stroke-width", data_flux.JOBS[i] * 0.05)
				.attr("x1", cWORK[0])
				.attr("y1", cWORK[1])
				.attr("x2", cHOME[0])
				.attr("y2", cHOME[1]);


			/* if (data_flux.INCOME[i] == 'HIGH'){
				flux.selectAll('line')
					.style("stroke", "#44c184")
			} else if (data_flux.INCOME[i] == 'MID'){
				flux.selectAll('line')
					.style("stroke", "#f9e058")
			} else {
				flux.selectAll('line')
					.style("stroke", "#cf4135")
			}; */

		} else if (flows_in.checked == false & data_flux.HOME_GEOID20[i] == tract_clicked & data_flux.JOBS[i] >= parseInt(threshold.value)) {

			let cWORK = projection([data_flux.X_WORK[i], data_flux.Y_WORK[i]])
			let cHOME = projection([data_flux.X_HOME[i], data_flux.Y_HOME[i]])

			flux.append('line')
				.style("stroke", function () {
					
					if (data_flux.INCOME[i] == 'HIGH') {return '#44c184'}
					else if (data_flux.INCOME[i] == 'MID') {return '#f9e058'}
					else {return '#cf4135'}
							
				})
				.style("opacity", 0.7)
				.style("stroke-width", data_flux.JOBS[i] * 0.05)
				.attr("x1", cWORK[0])
				.attr("y1", cWORK[1])
				.attr("x2", cHOME[0])
				.attr("y2", cHOME[1]);

			/* if (data_flux.INCOME[i] == 'HIGH'){
					flux.selectAll('line')
						.style("stroke", "#44c184")
			} else if (data_flux.INCOME[i] == 'MID'){
					flux.selectAll('line')
						.style("stroke", "#f9e058")
			} else {
					flux.selectAll('line')
						.style("stroke", "#cf4135")
			}; */

		}

	}

}

d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
	  this.parentNode.appendChild(this);
	});
  };
  

//AFFICHE CARTE
function afficheCarte(ville) {

	let geojson_ville = [];

	if (MG == false) {
		geojson_ville = eval('geojson_' + ville);
	} else {
		geojson_ville = eval('geojson_' + ville + 'MG');
	}

	let geojson_state = eval('geojson_' + dictVilles[ville]);


	const centerMap = d3.geoCentroid(geojson_ville)

	projection.fitSize([width - 0.3 * screen.width, height], geojson_ville);

	map.projection(projection);

	//ON NETTOIE ET ON REMET LE SVG
	d3.select("svg").remove();
	svg = d3.select("#carte1")
		.append("svg")
		.attr("id", "svg1")
		.attr("width", width)
		.attr("height", height);

	county = svg.append("g");
	tracts = svg.append("g");


	county.selectAll("path")
	// La variable geojson_pays est créée dans le fichier JS qui contient le GeoJSON
		.data(geojson_state.features)
		.enter()
		.append("path")
		.attr("d", map)
		.attr("class", "county")
		// Sémiologie (par défaut) des objets
		.style("fill", "#E3E3E3")
		.style("stroke", "#E3E3E3")
		.style("stroke-width", 1);
									
	tracts.selectAll("path")
	// La variable geojson_pays est créée dans le fichier JS qui contient le GeoJSON
		.data(geojson_ville.features)
		.enter()
		.append("path")
		.attr("d", map)
		.attr("class", "tracts")
		// Sémiologie (par défaut) des objets
		.style("fill", "#ffffff")
		.style("stroke", "#E3E3E3")
		.style("stroke-width", 1)
		.on("mouseover", function(e, tracts) {
			d3.select(this)
			.style("stroke", "#181818")
			.moveToFront()
			//.style("stroke-width", 2)
			//.style("cursor", "pointer")
		})
		.on("mouseout", function(d) {
			d3.select(this)
			.style("stroke", "#E3E3E3")
			//.style("stroke-width", 1)
		});
		/* .on("click", function(e, tract_clicked) {
			tracts.selectAll("path")
			.style("fill", "#000000")
			d3.select(this)
			.style("fill", "#ffffff")

			tract_clique = tract_clicked.properties.GEOID
			console.log(tract_clique)
			console.log("click");

			//draw_flux(tract_clique);
 		
			tooltip
				.style("display", "block");
			tooltip
				.transition().duration(200).style("opacity", 0.9);
			tooltip
				.html(tract_clicked.properties.GEOID)
				.style("left", (e.pageX + 10) + "px")
				.style("top", (e.pageY - 10) + "px"); 


			//appel à la fonction draw_flux
		
		  }); */

	//return(projection)

  };


  



//CREATION DES FLUX

//UPDATE DU TEXTE
//let title = document.getElementById("titre").innerHTML;

function updateTxt(ville) {

	let villeTxt = 	ville.options[ville.selectedIndex].text

	document.getElementById("titre").innerHTML = "Flux domicile-travail à " + villeTxt ;

};

//EVENT LISTENER SELECT VILLE
window.onload = function() {
	afficheCarte(selectVille.value)
	console.log(selectVille.value)
	//draw_all_flux();
  };

selectVille.addEventListener('change', (event) => {
	MG = false;
	villeAffichee = selectVille.value
	afficheCarte(selectVille.value)
	console.log(selectVille.value)
	updateTxt(selectVille)
	//draw_flux()
  });

/*   toggle.addEventListener('change',(event) => {
	//draw_flux(tract_clique)
	//draw_flux()
  });
 */
 



//CHECKBOX
let kmeans = document.getElementById("kmeans");

/* kmeans.addEventListener('change', function() {
	if (this.checked) {
	  nbK.classList.remove("hidden");
	} else {
	  nbK.classList.add("hidden");
	} 
  }); */



//ZOOM
let zoombtn = document.getElementById("zoombtn");

zoombtn.addEventListener("click", () => {

	console.log("click on zoom")

	geojson_ville = eval('geojson_' + selectVille.value + 'MG');

	var paths = svg.selectAll("path")
	


	var t0 = projection.translate(),
      s0 = projection.scale();

    // Re-fit to destination
    projection.fitSize([width - 0.4 * screen.width, height - 0.1 * screen.height], geojson_ville);

    // Create interpolators
    var interpolateTranslate = d3.interpolate(t0, projection.translate()),
        interpolateScale = d3.interpolate(s0, projection.scale());

    var interpolator = function(t) {
      projection.scale(interpolateScale(t))
        .translate(interpolateTranslate(t));
      paths.attr("d", d3.geoPath().projection(projection));

	  d3.selectAll(".tracts")
	  	.style("stroke", "white");
    };

    d3.transition()
      .duration(1000)
      .tween("projection", function() {
        return interpolator;
      });
	

}) 