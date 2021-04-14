const fs = require('fs')
const spawn = require('child_process').spawn
var propObj = require('../../config_con.js')

var moment = require('moment')



var exec = require('child_process').exec;
var child =  setInterval(() => {
const ts = moment().format('YYYY-MM-DD HH:mm:ss')

    let name="lda_ldaemb_"+ts.replace(" ","_")+".sql"
    let dbs=propObj.backup_databases.join(" ")
     exec(' mysqldump -u root -proot --databases '+dbs+' > backup/'+name,function(err, stdout, stderr) {
        if (err) {
        console.error(err);
        return;
        }
        console.log("complete") 

        }); 
 }, 10800000);
module.exports = {child}