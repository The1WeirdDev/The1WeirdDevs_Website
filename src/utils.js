const fs = require('fs')

module.exports = function() { 
    this.createLogger = function(loc, loggerName){
        var location = __dirname + `/../${loc}/`
        fs.mkdir(location, (err) => {/*Not going to do anything if the folder is created */});
        
        var stream = fs.createWriteStream(location + loggerName + ".log", {flags: 'a'})
        return stream;
    }
}