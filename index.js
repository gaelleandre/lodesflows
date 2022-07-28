const express = require('express'); //Import the express dependency  
const turf = require('@turf/turf');


const { body,validationResult } = require('express-validator');
var bodyParser = require('body-parser');


const app = express();
const path = require("path");
/* const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "app_lodes",
  password: "scrogneupluf",
  port: 5432
});
console.log("Connexion réussie à la base de données"); */


const http = require('http');
const port = 3000;                  //Save the port number where your server will be listening

const fs = require('fs');
const csv = require('csv-parser');


//TESTS SQL


/* const sql_create = `CREATE TABLE IF NOT EXISTS AllFlux AS (
  SELECT source, target, value
  FROM se_links
);`;

pool.query(sql_create, [], (err, result) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Création réussie de la table 'allflux'");
}); */


app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
    //console.log("link", link);
    //console.log(links)
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
  
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});


app.get("/map", (req, res) => {
    //console.log("Bonjour le monde...");
    res.render("map");
  });

app.get("/leaflet", (req, res) => {
    console.log("Carte Leaflet");
    app.get("/api/nodes", (req, res) => {
      // pour lire les parametres suivant le ? dans l'adresse
      // console.log(req.query);
      res.json(data_test);
    });
    res.render("leaflet");
  });


app.get('/api/data', (req, res) => {
  console.log("node");
  //node = JSON.parse(fs.readFileSync('./nodes_se_K.json', 'utf8') )
  res.send({"nodes": node, "links": links});
})


app.get('/api/nodes', (req, res) => {
  console.log("node");
  res.send(node);
})

app.get('/api/links', (req, res) => {
  console.log("link");
  res.send(links);
})


//SEATTLE
const links_se = [];
fs.createReadStream('./data/SE/links.csv')
  .pipe(csv())
  .on('data', function (row) {

    //console.log(row);
    
    const link_se = {
        source: parseInt(row.source),
        target: parseInt(row.target),
        value: parseInt(row.value),
        value_low: parseInt(row.LOW),
        value_mid: parseInt(row.MID),
        value_high: parseInt(row.HIGH)
          }
    links_se.push(link_se)
  })
  .on('end', function () {
      console.log("SE fini")
      // TODO: SAVE links data to another file
    })


node_se = JSON.parse(fs.readFileSync('./data/SE/nodes.json', 'utf8') )


app.get('/api/Seattle/nodes', (req, res) => {
  console.log("Seattle nodes...");
  res.send(node_se);
})

app.get('/api/Seattle/links', (req, res) => {
  console.log("Seattle links...");
  res.send(links_se);
})

//SAN FRANCISCO
const links_sf = [];
fs.createReadStream('./data/SF/links.csv')
  .pipe(csv())
  .on('data', function (row) {

    //console.log(row);
    
    const link_sf = {
        source: parseInt(row.source),
        target: parseInt(row.target),
        value: parseInt(row.value),
        value_low: parseInt(row.LOW),
        value_mid: parseInt(row.MID),
        value_high: parseInt(row.HIGH)
          }
    links_sf.push(link_sf)
  })
  .on('end', function () {
      console.log("SF fini")
      // TODO: SAVE links data to another file
    })


node_sf = JSON.parse(fs.readFileSync('./data/SF/nodes.json', 'utf8') )

app.get('/api/SanFrancisco/nodes', (req, res) => {
  console.log("San Francisco nodes...");
  res.send(node_sf);
})

app.get('/api/SanFrancisco/links', (req, res) => {
  console.log("San Francisco links...");
  res.send(links_sf);
})

//LOS ANGELES
const links_la = [];
fs.createReadStream('./data/LA/links.csv')
  .pipe(csv())
  .on('data', function (row) {

    //console.log(row);
    
    const link_la = {
        source: parseInt(row.source),
        target: parseInt(row.target),
        value: parseInt(row.value),
        value_low: parseInt(row.LOW),
        value_mid: parseInt(row.MID),
        value_high: parseInt(row.HIGH)
          }
    links_la.push(link_la)
  })
  .on('end', function () {
      console.log("LA fini")
      // TODO: SAVE links data to another file
    })


node_la = JSON.parse(fs.readFileSync('./data/LA/nodes.json', 'utf8') )

app.get('/api/LosAngeles/nodes', (req, res) => {
  console.log("LA nodes...");
  res.send(node_la);
})

app.get('/api/LosAngeles/links', (req, res) => {
  console.log("LA links...");
  res.send(links_la);
})

//HOUSTON

const links_ho = [];
fs.createReadStream('./data/HO/links.csv')
.pipe(csv())
.on('data', function (row) {

  //console.log(row);
  
  const link_ho = {
      source: parseInt(row.source),
      target: parseInt(row.target),
      value: parseInt(row.value),
      value_low: parseInt(row.LOW),
      value_mid: parseInt(row.MID),
      value_high: parseInt(row.HIGH)
        }
  links_ho.push(link_ho)
})
.on('end', function () {
    console.log("HO fini")
    // TODO: SAVE links data to another file
  })


node_ho = JSON.parse(fs.readFileSync('./data/HO/nodes.json', 'utf8') )


app.get('/api/Houston/nodes', (req, res) => {
  console.log("Houston nodes...");
  res.send(node_ho);
})

app.get('/api/Houston/links', (req, res) => {
  console.log("Houston links...");
  res.send(links_ho);
})


//TESTS///////////////////////////

const https = require('https');
const zlib = require('zlib');
//const urltest = 'https://lehd.ces.census.gov/data/lodes/LODES7/ca/od/ca_od_main_JT00_2019.csv.gz';

const test = [];


/* https.get(urltest, (stream) => {
  stream.pipe(zlib.createUnzip())
  .pipe(csv())
  .on('data', async function(value){
  
   //console.log(value); 
   test.push(value)
  //can get csv file data here
  
  }).on('end', async function(){
   console.log("csv file ended");            
  })
});

app.get("/tests", (req, res) => {
    res.send(test)
    console.log("has sent ftp")
});

 */


/* app.post('/somewhere', (req, res) => {
  console.log('Got body:', req.body);
  res.sendStatus(200);
});
 */