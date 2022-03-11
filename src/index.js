var http = require("http")
var Unblocker = require("unblocker")
var unblocker = Unblocker({})

var _headers;
var _req;
var _res;

function get(url, name){
  var can = true;

  var newPath = _req.url.slice(name.length)
  if(newPath == "/")
    newPath = ""

    _res.writeHead(200, _headers)
  return _res.end(
    `
    <title>${name}</title>
    <embed src="${url}${newPath}" width="100%" height="100%"/>
    `
  )

  return can
}

http.createServer(function(req,res){
  unblocker(req,res,function(err){
    var headers = {"content-type": "text/html"}
    if(err){
      res.writeHead(500, headers)
      return res.end(err.stack || err)
    }
    _headers = headers

    _req = req
    _res = res

    if(req.url == "/slither"){
      res.writeHead(200, headers)
      return res.end(
        `
        <title>Slither</title>
        <embed src="http://slither.io" width="100%" height="100%"/>
        `
      )
    }
    else if(get("http://slither.io","slither")){}
    else if(get("https://skribbl.io","skribble")){}
    else if(get("https://1v1.lol","1v1")){}
    else if(get("https://krunker.io","krunker")){}
    else if(get("https://covirus.io","covirus")){}

    else if(get("http://paper.io","paper")){}
    else if(get("https://smashkarts.io","smashkarts")){}
    else if(get("http://wormax.io/","wormax")){}
    else if(get("https://shellshock.io","shellshock")){}
    else if(get("https://diep.io/","diep")){}
    
    else{
      res.writeHead(404, headers)
      return res.end("ERROR 404: File Not Found.");
    }
  })
})
.listen(8080)
/*
//Libraries
const express = require("express")
const http = require("http")
const fs = require("fs")
const {lookup}  = require('geoip-lite');
var https = require('https');
const { response } = require('express');

//Files
var utils = require(__dirname + '/utils.js')();
var config = require('./config.js');

//Server Logs
var accessLogStream = createLogger("logs", getDate())
var errorLogStream = createLogger("crash-reports", getDate())

//Server Data
const server = express()
var currentReq;
var currentRes;


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
    
    var date = new Date();

    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    var url = req.url;
    var location = lookup(ip);

    
    var am_or_pm = (date.getHours() < 12 ? "AM" : "PM")
    var hours = (date.getHours() < 12 ? date.getHours() : date.getHours() - 12);

    //Had a bug where the day would show the day of the week instead of the date
    var data = `${ip} location: ${location ? location.city : "Unavailable"} is requesting data from "${url}" on ${date.getMonth() + 1}/${date.getDate()}/${date.getDate()} at ${hours}:${date.getMinutes()}:${date.getSeconds()} ${am_or_pm}`
    //console.log(data)

    onRequest("",req,res)

    /*
    if(url.slice(-1) == '/')
        url = url.slice(0, -1);
    if(config.enableLogging)
        accessLogStream.write(data + "\n")

    if(!config.inMaintenance){
        if(url == "/")res.redirect("/home")
        else if(url.startsWith("/proxy/web")){

          onRequest("/proxy/web",req,res)
        }
        else{
            loadFileData("status/404/index.html");
        }

       
    }else{
        loadFileData("status/503/index.html");
    }
})

function onRequest(base, client_req, client_res) {
  var options = {
    hostname: 'www.google.com',
    port: 80,
    path: "",
    method: client_req.method,
    headers: client_req.headers
  };

  var proxy = http.request(options, function (res) {
    client_res.writeHead(res.statusCode, res.headers)
    res.pipe(client_res, {
      end: true
    });
  });

  client_req.pipe(proxy, {
    end: true
  });
}

function loadFileData(location, doSomethingIfNot = true){
    var isThere;
    currentRes.setHeader('Content-Type', 'text/html')

    newloc = __dirname + "/Pages/" + location
    fs.readFile(newloc, function(error, data){

        if(error){
            if(doSomethingIfNot){
                currentRes.write("<hmtl><title>Error 404</title><p1>This page does not exist</p1></html>")
                console.log(`This File Does not exist at ${newloc}`)
            }
            isThere = false
        }else{
            currentRes.write(data)
            isThere = true
        }
        currentRes.end()
    })
    return isThere
}

function getDate(){
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    return `${month}_${day}_${year}`;
}*/