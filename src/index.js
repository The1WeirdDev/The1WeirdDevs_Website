//Libraries
var Unblocker = require('unblocker')
const express = require('express')
const {lookup}  = require('geoip-lite');
const fs = require('fs')
const path = require('path')

//Files
var utils = require(__dirname + '/utils.js')();
var config = require('./config.js');

//Server Logs
var accessLogStream = createLogger("logs", getDate())
var errorLogStream = createLogger("crash-reports", getDate())

//Server Data
const server = express()
var unblocker = Unblocker({})
var currentReq;
var currentRes;
var currentHeaders;

function getProxy(url, gameUrl, name){ 
  if(url.startsWith("/" + name)){

    var newPath = currentReq.url.slice(name.length + 1)
    if(newPath == "/")
      newPath = ""

      currentRes.writeHead(200, currentHeaders)
      return currentRes.end(
      `
      <title>${name}</title>
      <embed src="${gameUrl}${newPath}" width="100%" height="100%"/>
      `
    )
  }else
    return false
}


server.listen(config.port, config.hostname, function(error, data){
    if(error){
        console.log(`Error listening on port ${config.port} reason ${data}`)
        
    }else{
        console.log(`Listening on http://localhost:${config.port}`)
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
  currentRes = res


  //Getting Information

  //var date = new Date();
  //var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
  var url = req.url;
  //var location = lookup(ip);
  //var am_or_pm = (date.getHours() < 12 ? "AM" : "PM")
  //var hours = (date.getHours() < 12 ? date.getHours() : date.getHours() - 12);
  //var data = `${ip} location: ${location ? location.city : "Unavailable"} is requesting data from "${url}" on ${date.getMonth() + 1}/${date.getDate()}/${date.getDate()} at ${hours}:${date.getMinutes()}:${date.getSeconds()} ${am_or_pm}`
  
  //Displaying Data
  //console.log(data)

  //Logging Data to file
  //if(config.enableLogging)
    //accessLogStream.write(data + "\n")
  var headers = {"content-type": "text/html"}
  currentHeaders = headers;

  unblocker(req,res,function(err){
        
    if(url.slice(-1) == '/')
      url = url.slice(0, -1);

    if(!config.inMaintenance){
      if(url == "")res.redirect("/home")
      else if(url =="/home" || url =="/about" || url =="/games" || url =="/proxys" || url =="/emulators" || url =="/mods")loadFileData("home" + url + ".html")
      else if(url.startsWith("/images/")){
        
        console.time("dbsave");
        loadFileData("home/"+url.slice(1))
        console.timeEnd("dbsave");
        return;
      }

      else if(url.startsWith("/games/")){
        var i = url.slice(7)

        if(i.startsWith("fnaf")){
          var _fnaf = i.slice(4)
          var _loc

          if(_fnaf == "1" || _fnaf == "2" || _fnaf == "3" || _fnaf == "4")
            _loc = _fnaf + "/fnaf" + _fnaf + ".html"
          else
          _loc = _fnaf
          
          loadFileData("/games/fnaf/fnaf" + _loc);
        }
        else{
          loadFileData("status/404/index.html");
        }
      }



      //Proxys
      else if(getProxy(req.url, "http://slither.io","proxy-slither")){}
      else if(getProxy(req.url, "https://skribbl.io","proxy-skribbl")){}
      else if(getProxy(req.url, "https://1v1.lol","proxy-1v1")){}
      else if(getProxy(req.url, "https://krunker.io","proxy-krunker")){}
      else if(getProxy(req.url, "https://covirus.io","proxy-covirus")){}

      else if(getProxy(req.url, "http://paper.io","proxy-paper")){}
      else if(getProxy(req.url, "https://smashkarts.io","proxy-smashkarts")){}
      else if(getProxy(req.url, "http://wormax.io","proxy-wormax")){}
      else if(getProxy(req.url, "https://shellshock.io","proxy-shellshock")){}
      else if(getProxy(req.url, "https://diep.io","proxy-diep")){}
      else if(getProxy(req.url, "https://hole-io.com","proxy-hole")){}
      else if(getProxy(req.url, "https://evoworld.io/","proxy-evoworld")){}


      //404 Not Found
      else{
        loadFileData("status/404/index.html");
        return;
      }
    }
    else{
      loadFileData("status/500/index.html");
    }

  })

})


function loadFileData(location){
  newloc = __dirname + "/Pages/" + location

  
  //Setting Required Headers
  //var ext = path.extname(newloc)
  currentRes.setHeader('Content-Type', 'text/html')

  fs.readFile(newloc, function(error, data){
    
    if(error){
      currentRes.write("<hmtl><title>Error 404</title><p1>This page does not exist</p1></html>")
      console.log(`This File Does not exist at ${newloc}`)
    }else{
      currentRes.write(data)
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