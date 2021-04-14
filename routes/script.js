const fs = require('fs')
const spawn = require('child_process').spawn

var moment = require('moment')



var exec = require('child_process').exec;
var child =  setInterval(() => {
const ts = moment().format('YYYY-MM-DD HH:mm:ss')

    let name="lda_ldaemb_"+ts.replace(" ","_")+".sql"
     exec(' mysqldump -u root -proot svayam_14_ebill > backup/'+name,function(err, stdout, stderr) {
        if (err) {
        console.error(err);
        return;
        }
        console.log("complete") 

        }); 
 }, 10800000);;


   
      
      module.exports = {child};
    // function scriptfun(){
    //     dump
    //     .stdout
    //     .pipe(writeStream)
    //     .on('finish', function () {
    //         console.log('Completed')
    //     })
    //     .on('error', function (err) {
    //         console.log(err)
    //     })
    // }
    
    
          
    //       module.exports = {scriptfun};
