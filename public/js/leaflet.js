



var map = new L.map('map').setView([45, 0], 2);

var Stadia_AlidadeSmoothDark = new L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);


var dictVille = {
    "Seattle": [47.600605, -122.341842],
    "SanFrancisco": [37.841072, -122.376919],
    "LosAngeles": [33.887783, -118.243438],
    "Houston": [29.748463, -95.367863]
  };
  

function flyToVille (map, ville) {
    var value = ville.toString();
    map.flyTo(dictVille[value], 9);

}


let villeSelect = document.getElementById("ville-select");

villeSelect.addEventListener('change', (event) => {
    console.log(villeSelect.value)
	flyToVille(map, villeSelect.value);

  });



//SANKEY
// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 450 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(290)
    .size([width, height]);


var graph = {
  "nodes":[
  {"node":0,"name":"node0"},
  {"node":1,"name":"node1"},
  {"node":2,"name":"node2"},
  {"node":3,"name":"node3"},
  {"node":4,"name":"node4"}
  ],
  "links":[
  {"source":0,"target":2,"value":2},
  {"source":1,"target":2,"value":2},
  {"source":1,"target":3,"value":2},
  {"source":0,"target":4,"value":2},
  {"source":2,"target":3,"value":2},
  {"source":2,"target":4,"value":2},
  {"source":3,"target":4,"value":4}
  ]};



// load the data
  // Constructs a new Sankey generator with the default settings.
  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(1);

  // add in the links
  var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", sankey.link() )
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

  // add in the nodes
  var node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { console.log(d); return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.drag()
        .subject(function(d) { return d; })
        .on("start", function() { this.parentNode.appendChild(this); })
        );

  // add the rectangles for the nodes
  node
    .append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    // Add hover text
    .append("title")
      .text(function(d) { return d.name + "\n" + "There is " + d.value + " stuff in this node"; });


  // add in the title for the nodes
  node
  .append("text")
    .attr("x", -6)
    .attr("y", function(d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) { return d.name; })
  .filter(function(d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");



  /* const graph2 = {
      // define nodes
      const nodes = Array.from(new Set(paths.flatMap(d => [d.source, ...d.stops, d.target])), iso => {
        const [x, y] = centroid(iso);
        return { id: iso, x, y };
      });
      // define links
      let links = [], linkValues = new Map;
      for (let path of paths) {
        const stops = [path.source, ...path.stops, path.target];
        let pairs = d3.pairs(stops).map(([source, target]) => ({ source, target, value: path.value }));
        for (let pair of pairs) {
          const key = `${pair.source} - ${pair.target}`;
          const value = linkValues.get(key) || 0;
          if (!value) links.push(pair);
          linkValues.set(key, value + pair.value);
        }
      }
      links.forEach(d => (d.value = linkValues.get(`${d.source} - ${d.target}`)))
      return { nodes, links }
    }

 */
