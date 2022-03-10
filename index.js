//Libraries
const express = require("express")
const fs = require("fs")
const {lookup}  = require('geoip-lite');
const { blockResources } = require('./middleware');
const { imageExists, cssExists } = require('./plugins');
const { logger } = require('./util');

//Will Be using a config file in the future

//Server Data/Logs
var accessLogStream = createLogger("logs", getDate())
var errorLogStream = createLogger("crash-reports", getDate())

const server = express()
var currentReq;
var currentRes;

//Server Port & Hostname
const port = 8080
const hostname = "0.0.0.0"












var inMaintenance = false;
var enableLogging = true;
var closeOnException = false;
var isFileThere = false;


function createLogger(loc, loggerName){
    var location = __dirname + `/${loc}/`
    fs.mkdir(location, (err) => {});
    
    var stream = fs.createWriteStream(location + loggerName + ".log", {flags: 'a'})
    return stream;
}

server.listen(port, hostname, function(error, data){
    if(error){
        console.log(`Error listening on port ${port} reason ${data}`)
    }else{
        console.log(`Listening on http://localhost:${port}`)
    }
})

//Error Handeling
process.on('uncaughtException', err => {
    console.log(`Uncaught Exception: ${err.stack}`)

    errorLogStream.write(err.stack + "\n\n")

    if(closeOnException)
        process.exit(1)
})

//Getting all request at the same time
server.get("*",function(req, res){
    currentReq = req
    currentRes = res;
    
    var date = new Date();

    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    var url = req.url;
    var location = lookup(ip);

    
    var am_or_pm = (date.getHours() < 12 ? "AM" : "PM")
    var hours = (date.getHours() < 12 ? date.getHours() : date.getHours() - 12);

    //Had a bug where the day would show the day of the week instead of the date
    var data = `${ip} location: ${location ? location.city : "Unavailable"} is requesting data from "${url}" on ${date.getMonth() + 1}/${date.getDate()}/${date.getDate()} at ${hours}:${date.getMinutes()}:${date.getSeconds()} ${am_or_pm}`
    //console.log(data)

    if(url.slice(-1) == '/')
        url = url.slice(0, -1);

    if(enableLogging)
        accessLogStream.write(data + "\n")

    if(!inMaintenance){
        if(url == "/" || url == "")res.redirect("/home")

        else if(url == "/home" || url == "/about" || url == "/games" || url == "/proxys" || url == "/emulators" || url == "/mods")
            loadFileData("Home" + url + ".html");
            
        
        else if(url.startsWith("/games/")){
            var newPath = url.replace('/games/','');     
            
            //Fix Fnaf1   || newPath == "fnaf1" 
            if(newPath == "fnaf2" || newPath == "fnaf3" || newPath == "fnaf4")  
                loadFileData("Games/Fnaf/" + newPath + "/" + newPath + ".html");
        
            else if(getFilesWithName(newPath, "spelunky")){

            }

            else{
                loadFileData("status/404/index.html");
            }
        }

        else if(url.startsWith("/images/")){
            var newPath = url.replace('/images/','');
                
            switch(newPath){
                case "home.png":
                    res.sendFile(__dirname + "/Pages/Home/images/" + newPath)
                    break;   
                case "mario.png":
                    res.sendFile(__dirname + "/Pages/Home/images/" + newPath)
                    break;   
                case "games.png":   
                    res.sendFile(__dirname + "/Pages/Home/images/" + newPath)
                    break;   
                case "proxy.png":
                    res.sendFile(__dirname + "/Pages/Home/images/" + newPath)
                    break;   
                default:
                    loadFileData("status/404/index.html");
                    break;
                }
        }else{
            loadFileData("status/404/index.html");
        }
    }else{
        loadFileData("status/503/index.html");
    }
})

function getFilesWithName(url, name){
    if(url.startsWith(name)){
        var newPathf = url.split(name.length)

        console.log(newPathf);
    }

    isFileThere = false;
    return false;
}

function loadFileData(location, doSomethingIfNot = true){

    currentRes.setHeader('content-type', 'text/html');

    newloc = "Pages/" + location
    fs.readFile(newloc, function(error, data){

        if(error){
            if(doSomethingIfNot){
                currentRes.write("<hmtl><title>Error 404</title><p1>This page does not exist</p1></html>")
                console.log(`This File Does not exist at ${newloc}`);
            }
            isFileThere = false;
        }else{
            currentRes.write(data)
            isFileThere = true;
            
        }
        currentRes.end()
    })

    
}

function getDate(){
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    return `${month}_${day}_${year}`;
}



//Proxy
const parseIncomingRequest = (clientRequest, clientResponse) => {
    const requestToFulfil = url.parse(clientRequest.url);
  
    // Frame the request to be forwarded via Backend to External Source
    const options = {
      method: clientRequest.method,
      headers: clientRequest.headers,
      host: requestToFulfil.hostname,
      port: requestToFulfil.port || 80,
      path: requestToFulfil.path
    }
  
    // PLUGINS
    if (blockResources(options, imageExists)) {
      options.allowed = false;
      logger(options);
  
      // Don't allow the request to proceed and terminate here itself
      clientResponse.end();
    } else {
      options.allowed = true;
      logger(options);
  
      // Execute the Request
      executeRequest(options, clientRequest, clientResponse);
    }
  
  }
  
  const executeRequest = (options, clientRequest, clientResponse) => {
    const externalRequest = http.request(options, (externalResponse) => {
  
      // Write Headers to clientResponse
      clientResponse.writeHead(externalResponse.statusCode, externalResponse.headers);
  
      // Forward the data being received from external source back to client
      externalResponse.on("data", (chunk) => {
        clientResponse.write(chunk);
      });
  
      // End the client response when the request from external source has completed
      externalResponse.on("end", () => {
        clientResponse.end();
      });
    });
  
    // Map data coming from client request to the external request being made
    clientRequest.on("data", (chunk) => {
  
      if(JSON.parse(chunk.toString()).language === "english") {
        chunk = Buffer.from(JSON.stringify({"language":"spanish"}))
      }
      externalRequest.write(chunk);
    });
  
    // Map the end of client request to the external request being made
    clientRequest.on("end", () => {
      externalRequest.end();
    });
  }