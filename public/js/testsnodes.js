
////////////////////////////////////////////////////////////////
///////////////TESTS SANKEY////////////////////////////////////
///////////////////////////////////////////////////////////////



/* .then(() => {
    downloadSvg();
}); */

let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);


function drawNodes(geojson) {

	const path = d3.geoPath(projection);

	d3.selectAll("circle").remove();
	var node = svg.append("g")

	node.selectAll('circle')
		.data(geojson.features)
		.enter()
		.append('circle')
		.attr('d', map)
		.attr('d', 'dots')
		.attr("cx", function (d){return projection([d.geometry.coordinates[1], d.geometry.coordinates[0]])[0];})
		.attr("cy", function (d){return projection([d.geometry.coordinates[1], d.geometry.coordinates[0]])[1];})
		.style("fill", "white")
		.style("opacity", 0.6)
		.style("stroke", "white")
		.style("stroke-width", 0.5)
		.style("r", "3px");


	node.selectAll('circle')
		.on('mouseover', function(e, node) {
			d3.select(this)
			.style("opacity", 1)
			.style("cursor", "pointer")
		
			tooltip
				.style("display", "block");
			tooltip
				.transition().duration(200).style("opacity", 0.9);
			tooltip
				.html("Node : " + node.properties.cluster)
				.style("left", e.pageX  + 10 + "px")
				.style("top", e.pageY + "px");
 
		})
		.on("mouseout", function(e) {
			d3.select(this)
			.style("opacity", 0.7)
		 
			tooltip.style("left", "-500px").style("top", "-500px");
		});

}




//TESTS POUR ENVOYER LA VALEUR DE NBK DANS L'URL
let nbK = document.getElementById("nbK")
let submitBtn = document.getElementById("SubmitBtn")
let threshold = document.getElementById("threshold")
let label_threshold = document.getElementById("label_threshold")
let visiblenodes = document.getElementById("visiblenodes")
let flux_select = document.getElementById("flux-select")
let tailleflux = document.getElementById("tailleflux")
let label_tailleflux = document.getElementById("label_tailleflux")
let loader = document.getElementById("loader")



tailleflux.addEventListener("change", function() {

	label_tailleflux.innerHTML = "Taille des flux (valeur * " + tailleflux.value + ")"

	svg.selectAll(".main")
		.style("stroke-width", d => {
			if (d.value * tailleflux.value < 0.1) {
				return 0.1
			} else {
			return d.value * tailleflux.value
			}
		});

	downloadSvg();
	
});

visiblenodes.addEventListener("change", function() {
	if(visiblenodes.checked == true){
		svg.selectAll("circle")
			.classed("hidden", true);
	} else {
		svg.selectAll("circle")
			.classed("hidden", false);
	}

	//downloadSvg();
});

threshold.addEventListener("change", () => {
	label_threshold.innerHTML = "Nombre minimum de personnes = " + threshold.value
});



let valueKmeans = nbK.value

//EVENT LISTENER PRINCIPAL POUR LES KMEANS

submitBtn.addEventListener("click", (event) => {

	//réitinitialisation des options
	visiblenodes.checked = false;
	tailleflux.value = 0.0003;
	label_tailleflux.innerHTML = "Taille des flux (valeur * " + tailleflux.value + ")";
	
	loader.classList.remove("hidden");

	var nodes = []
	var links = []
	let test = []
	var node_geojson = {
		type: "FeatureCollection",
		features: [],
	};

	let url_nodes = `http://localhost:3000/api/${villeAffichee}/nodes`
	let url_links = `http://localhost:3000/api/${villeAffichee}/links`

	var getNodes = fetch(url_nodes)
		.then(r => r.json())
		.then(r => {
			nodes = r;
			console.log(nodes)
		});

	var getLinks = fetch(url_links)
		.then(r => r.json())
		.then(r => {
			links = r;
		});

	Promise.all([getNodes, getLinks])
	.then(console.log("chargement data fait"))
	.then(() => {

		links = select_income(links)

		test = {"nodes": nodes, "links": links};
		console.log(test)
	})
	.then(() => {
		nodeToGeojson(nodes, node_geojson);
	})
	.then(() => {
		console.log("drawing nodes...")
		drawNodes(node_geojson);
	})
	.then(() => {
		valueKmeans = nbK.value

		let result = clusterNodes(nbK.value, node_geojson)
		let centroids = centroidsClusters(result)

		drawNodes(centroids);
		new_flows = applyKmeans(result, centroids, links);

		drawAllFlux(new_flows);
	});

	
  });

//Fonction des revenus

function select_income(links){

	console.log(flux_select.value)
	if (flux_select.value == "low") {

		links.forEach( function(data) {
			data['value'] = data['value_low'];
			delete data['value_low'];
			delete data['value_mid'];
			delete data['value_high'];
		  });

		links.filter(function(e) { return e.value > 0 });

	} else if (flux_select.value == "mid") {

		links.forEach( function(data) {
			data['value'] = data['value_mid'];
			delete data['value_low'];
			delete data['value_mid'];
			delete data['value_high'];
		  });

		links.filter(function(e) { return e.value > 0 });

	} else if (flux_select.value == "high") {

		links.forEach( function(data) {
			data['value'] = data['value_high'];
			delete data['value_low'];
			delete data['value_mid'];
			delete data['value_high'];

		  });

		links.filter(function(e) { return e.value > 0 });

	}

	return links;

}

//Fonction qui applique les K-means
function clusterNodes(value, node_geojson) {
	var points = node_geojson;
	var options = {numberOfClusters: value};

	let clustered = turf.clustersKmeans(points, options);

	return clustered;
}

function centroidsClusters(clusters){

	let liste_nodes = clusters

	var centroids = {
		type: "FeatureCollection",
		features: [],
	  };


	  let missing = []
	  //BOUCLE
	  for (i = 0; i < valueKmeans; i++) {

		let match = false;

			for (j = 0; j < liste_nodes.features.length; j++) {

				if (liste_nodes.features[j].properties.cluster == i) {

					centroids.features.push({
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [liste_nodes.features[j].properties.centroid[0], liste_nodes.features[j].properties.centroid[1]]
						},
						"properties": {
							"cluster": i,
						}
						});

					match = true;

					break;

				}

			}

		if (match == false) {

			missing.push(i)
			centroids.features.push({
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [0, 0]
				},
				"properties": {
					"cluster": i,
				}
				});

		}

			
	  
	}

	//console.log(missing)
		
	return centroids;
}


//CONVERTIT EN GEOJSON
function nodeToGeojson(nodes, node_geojson) {
	  for (i = 0; i < nodes.length; i++) {
		
		node_geojson.features.push({
		  "type": "Feature",
		  "geometry": {
			"type": "Point",
			"coordinates": [nodes[i].coords_Y, nodes[i].coords_X]
		  },
		  "properties": {
			"node": nodes[i].node,
		  }
		});
	  };

}



function applyKmeans(result, centroids, links) {

	//On crée la table de correspondances

	let table_clusters = [];

	//console.log(result.features.length)

	for (i = 0; i < result.features.length; i++) {
		//console.log(i)
		table_clusters.push(result.features[i].properties.cluster)
	}

	//console.log("tableclusters", table_clusters)

	for (i = 0; i < links.length; i++) {
		links[i].source = table_clusters[links[i].source]
		links[i].target = table_clusters[links[i].target]
	}


	let new_links = groupby(links);
	new_links.sort((a, b) => b.value - a.value)
	let new_nodes = [];

	//console.log("centroids ici", centroids)

	for (i = 0; i < centroids.features.length; i++) {
		//console.log(i)
		new_nodes.push({node: centroids.features[i].properties.cluster, 
						coords_X: centroids.features[i].geometry.coordinates[1], 
						coords_Y: centroids.features[i].geometry.coordinates[0]}
						)
						//console.log(new_nodes[i])

	}

	//console.log("new_nodes", new_nodes)


	new_nodes.sort((a, b) => a.node - b.node)

	//console.log("new_nodes", new_nodes)

	let new_array = {"nodes": new_nodes, "links": new_links};
	console.log("new array", new_array)
	return new_array;


} 


function groupby(data) {

	data.forEach( function(data) {
		data['a'] = data['source'];
		data['b'] = data['target'];
		data['c'] = data['value'];
		delete data['source'];
		delete data['target'];
		delete data['value'];
	  });

	//console.log(data)
    
	data = data.filter(item => item.a != item.b);

	var data_grouped = alasql('SELECT a,b,SUM(c) as c FROM ? GROUP BY a,b',[data]);
	//console.log(data_grouped)

	data_grouped.forEach( function(data) {
		data['source'] = data['a'];
		data['target'] = data['b'];
		data['value'] = data['c'];
		delete data['a'];
		delete data['b'];
		delete data['c'];
	  });

	  data_grouped.forEach((item, i) => {
		item.id = i + 1;
	  });

	console.log(data_grouped)

	return(data_grouped);
}

////////////SANKEY///////////////
function drawSankey(test, drawlink, defs) {

	// Set the sankey diagram properties
	var sankey = d3.sankey()
		.nodeWidth(36)
		.nodePadding(290)
		.size([width, height]);
	
	var graph = test;
	//console.log("graph", graph)
	
	// load the data
	  // Constructs a new Sankey generator with the default settings.
	  sankey
		  .nodes(graph.nodes)
		  .links(graph.links)
		  .layout(1);

		//console.log(graph.links)
	
	  // add in the links
	  var link = svg.append("g")

	
	  link.selectAll("path")
	  .data(graph.links)
	  .enter()
	  .append("path")
	  .attr("class", "main")
	  .attr("value", d => d.value)
		//.filter(function(d) {return fluxAngle(d) == "H" })
		.attr("d", sankeyLinkHorizontal())
		.style("opacity", 0.6)
		.style("fill", "none")
		.style("stroke", "white")
		.style("stroke-width", d => {
				if (d.value * 0.0003 < 0.1) {
					return 0.1
				} else {
				return d.value * 0.0003
				}
			})
		//.style("stroke-width", d => {return d.value * 0.0003})
		.style('stroke', (d) => {
			// make unique gradient ids
			//pour avoir des gradients uniques
			//console.log(d)
			const gradientId = `gradient${d.id}`;

			let angle_gradient = fluxAngle(d);
			//console.log(angle_gradient[0])

			const startColor = "#79dab4";
			const stopColor = "#C8196B";

			const linearGradient = defs.append('linearGradient')
				.attr('id', gradientId)
				.attr("x1", angle_gradient[0])
      			.attr("x2", angle_gradient[1])
      			.attr("y1", angle_gradient[2])
     			.attr("y2", angle_gradient[3]);

			linearGradient.append('stop')
				.attr('offset', '30%')
				.attr('stop-color', startColor);

			linearGradient.append('stop')
				.attr('offset', '70%')
				.attr('stop-color', stopColor);

			/* linearGradient.selectAll('stop')
				.data([
					{ offset: '20%', color: startColor },
					{ offset: '80%', color: stopColor }
				])
				.enter().append('stop')
				.attr('offset', d => d.offset)
				.attr('stop-color', d => d.color); */

			return `url(#${gradientId})`;
		})
		.style("fill", "none");

		 link.selectAll("path")
			.on('mouseover', function(e, link) {

				let calculAngle = GETAngle(link);
				let source_Y = projection([link.source.coords_X, link.source.coords_Y])[1];
				let target_Y = projection([link.target.coords_X, link.target.coords_Y])[1];	

				d3.select(this)
				.style("opacity", 1)
				.style("cursor", "pointer")
			
				tooltip
					.style("display", "block");
				tooltip
					.transition().duration(200).style("opacity", 0.9);
				tooltip
					.html("Nombre de personnes : " + link.value + "<br>Source : " + link.source.node + "<br>Target : " + link.target.node)
					.style("left", e.pageX  + 10 + "px")
					.style("top", e.pageY + "px");
	 
			})
			.on("mouseout", function(e) {
				d3.select(this)
				.style("opacity", 0.7)
			 
				tooltip.style("left", "-500px").style("top", "-500px");
			});
	
	
		return link
	
	};
	
	
	function sankeyLinkHorizontal() {

	
		var link = d3.linkHorizontal()
						.source(function(d) {
							let sourceX = projection([d.source.coords_X, d.source.coords_Y])[0];
							let sourceY = projection([d.source.coords_X, d.source.coords_Y])[1];
							return [sourceX, sourceY];
						})
						.target(function(d) {
							let targetX = projection([d.target.coords_X, d.target.coords_Y])[0];
							let targetY = projection([d.target.coords_X, d.target.coords_Y])[1];
							return [targetX, targetY];
						});
	
		return link         
	}
	
	function sankeyLinkVertical() {
	
		var link = d3.linkVertical()
						.source(function(d) {
							let sourceX = projection([d.source.coords_X, d.source.coords_Y])[0];
							let sourceY = projection([d.source.coords_X, d.source.coords_Y])[1];
							return [sourceX, sourceY];
						})
						.target(function(d) {
							let targetX = projection([d.target.coords_X, d.target.coords_Y])[0];
							let targetY = projection([d.target.coords_X, d.target.coords_Y])[1];
							return [targetX, targetY];
						});
	
		return link         
	}
	
	
	//A STOCKER EN DUR POUR UN CHARGEMENT PLUS RAPIDE ?
	function fluxAngle(d) {

		let source_X = projection([d.source.coords_X, d.source.coords_Y])[0];
		let source_Y = projection([d.source.coords_X, d.source.coords_Y])[1];
		let target_X = projection([d.target.coords_X, d.target.coords_Y])[0];
		let target_Y = projection([d.target.coords_X, d.target.coords_Y])[1];	

		var angleR = (Math.pow(target_X - source_X, 2)) / (Math.sqrt(Math.pow(target_X - source_X, 2) + Math.pow(target_Y - source_Y, 2)) * (target_X - source_X))
		//console.log(angleR)

		var arccos = Math.acos(angleR)
		//console.log(arccos)
		var angleD = (Math.acos(angleR) *180)/Math.PI
		//console.log(angleD)

		if (target_Y - source_Y > 0) {
			angleD = -angleD 
		}

		if (angleD >= -180 && angleD < -150) {
			return ["100%", "0%", "0%", "0%"];
		} else if (angleD >= -150 && angleD < -120) {
			return ["70%", "30%", "30%", "70%"];
		} else if (angleD >= -120 && angleD < -60) {
			return ["0%", "0%", "0%", "100%"];
		} else if (angleD >= -60 && angleD < -30) {
			return ["30%", "70%", "30%", "70%"];
		} else if (angleD >= -30 && angleD < 30) {
			return ["0%", "100%", "0%", "0%"];
		} else if (angleD >= 30 && angleD < 60) {
			return ["30%", "70%", "70%", "30%"];
		} else if (angleD >= 60 && angleD < 120) {
			return ["0%", "0%", "100%", "0%"];
		} else if (angleD >= 120 && angleD < 150) {
			return ["70%", "30%", "70%", "30%"];
		} else if (angleD >= 150 && angleD <= 180) {
			return ["100%", "0%", "0%", "0%"];
		} else {
			console.log("erreur dans le calcul d'angle")
		};

	}
	



	function GETAngle(d) {
	
		let source_X = projection([d.source.coords_X, d.source.coords_Y])[0];
		let source_Y = projection([d.source.coords_X, d.source.coords_Y])[1];
		let target_X = projection([d.target.coords_X, d.target.coords_Y])[0];
		let target_Y = projection([d.target.coords_X, d.target.coords_Y])[1];	

		var angleR = (Math.pow(target_X - source_X, 2)) / (Math.sqrt(Math.pow(target_X - source_X, 2) + Math.pow(target_Y - source_Y, 2)) * (target_X - source_X))
		//console.log(angleR)

		var arccos = Math.acos(angleR)
		//console.log(arccos)
		var angleD = (Math.acos(angleR) *180)/Math.PI
		//console.log(angleD)

		if (target_Y - source_Y > 0) {
			angleD = -angleD 
		}
	
		return angleD;
	} 
	
	
	const send = link =>
	  new Promise(resolve =>
		setTimeout(() => resolve(link), 100)
	  );
	
	


	const drawAllFlux = async (test) => {

	console.log("test in draw ALL FLUX", test)
	
	  let toPrint = [];
	  d3.selectAll(".main").remove();
	  const drawlink = svg.append("g");
	  const defs = svg.append('defs');

	  console.log(test.links.length)
	
	  for (link of test.links) {


		//console.log(test.links.indexOf(link))
		//console.log(link.value, threshold.value)
	
		if (link.value > threshold.value) {
			
			toPrint.push(link)
	
			if (toPrint.length >= 2) {

				if (toPrint[0].source == toPrint[1].target && toPrint[1].source == toPrint[0].target) {
					let element1 = {"nodes": test.nodes, "links": [toPrint[0]]};
					drawSankey(element1, drawlink, defs);
					let element2 = {"nodes": test.nodes, "links":  [toPrint[1]]};
					drawSankey(element2, drawlink, defs);
		
					const link_details = await send(link);
					
				} else {
	
					test2 = {"nodes": test.nodes, "links": toPrint};
					const link_details = await send(link);
		
					drawSankey(test2, drawlink, defs);
					
			}

			//reinitialisation
			toPrint = [];
		}
	
		}
	  }
	  console.log('All flows have been drawn');
	  downloadSvg();
	  loader.classList.add("hidden");
	}; 



//DOWNLOAD SVG
function downloadSvg() {

	var svg = d3.select("svg");
	var source = (new XMLSerializer).serializeToString(svg.node());

	source = source.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	
	source = source.replace(/ns\d+:href/g, 'xlink:href'); // Safari NS namespace fix.
	
	if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
		source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
	}
	if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
		source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
	}
	
	var preface = '<?xml version="1.0" standalone="no"?>\r\n';
	var svgBlob = new Blob([preface, source], { type: "image/svg+xml;charset=utf-8" });
	var svgUrl = URL.createObjectURL(svgBlob);
	var downloadLink = document.getElementById("link");
	downloadLink.href = svgUrl;
	var name = "flowfigure"
	downloadLink.download = name;
	//document.body.appendChild(downloadLink);
	//downloadLink.click();
	//document.body.removeChild(downloadLink);
}


//TESTS FORMULAIRE

 