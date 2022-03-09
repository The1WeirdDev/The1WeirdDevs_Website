//Libraries
const express = require("express")
const fs = require("fs")
const {lookup}  = require('geoip-lite');

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

//Fnaf Plagiarized
server.use(express.static(__dirname + '/Pages/Games/fnaf1/'));
console.log(__dirname + '/Pages/Games/fnaf1/')

//Getting all request at the same time
server.get("*",function(req, res){
    currentReq = req;
    currentRes = res;
    
    var date = new Date();

    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    var url = req.url;
    var location = lookup(ip);

    
    var am_or_pm = (date.getHours() < 12 ? "AM" : "PM")
    var hours = (date.getHours() < 12 ? date.getHours() : date.getHours() - 12);

    //Had a bug where the day would show the day of the week instead of the date
    var data = `${ip} location: ${location ? location.city : "Unavailable"} is requesting data from "${url}" on ${date.getMonth() + 1}/${date.getDate()}/${date.getDate()} at ${hours}:${date.getMinutes()}:${date.getSeconds()} ${am_or_pm}`
    console.log(data)

    if(enableLogging)
        accessLogStream.write(data + "\n")

    if(!inMaintenance){
        if(url == "/")res.redirect("/home")

        else if(url == "/home" || url == "/about" || url == "/games" || url == "/projects" || url == "/emulators" || url == "/mods")
            loadFileData("Home" + url + ".html");
        
        else if(url.startsWith("/games/")){
            var newPath = url.replace('/games/','');     
            
            if(newPath == "fnaf1" || newPath == "fnaf2" || newPath == "fnaf3" || newPath == "fnaf4")  
                loadFileData("Games/" + newPath + "/" + newPath + ".html");
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

function loadFileData(location){
    newloc = "Pages/" + location
    fs.readFile(newloc, function(error, data){
        if(error){
            currentRes.writeHead(404, {'Content-Type':'text/html'})
            currentRes.write("<hmtl><title>Error 404</title><p1>This page does not exist</p1></html>")
            console.log(`This File Does not exist at ${newloc}`);
        }else{
            currentRes.writeHead(200, {'Content-Type':'text/html'})
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
