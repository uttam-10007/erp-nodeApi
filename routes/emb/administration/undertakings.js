var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con.js')
var mysqlPool = require('../../../connections/mysqlConnection.js');


var SqlString = require('sqlstring');
var moment = require('moment')


router.get('/getundertakings:dtls',(req,res)=>{
    let objectToSend={}

    let db = "svayam_" + req.params.dtls + "_ebill";
    let sql="SELECT * from "+db+".undertakings"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->administration-->undertakings-->getundertakings", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
})


router.post('/addUndertaking', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let role_cd = SqlString.escape(obj["role_cd"])
    let doc_type = SqlString.escape(obj["doc_type"])
    let fields = SqlString.escape(obj["fields"])
    let create_user_id = SqlString.escape(obj["create_user_id"])

    let data = SqlString.escape(obj["data"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))




    let sql = "insert into " + db + ".undertakings (doc_type,role_cd,fields,data,create_user_id,create_timestamp) values "
        + "(" + doc_type + "," + role_cd + "," + fields + "," + data + "," + create_user_id + "," + create_timestamp + ")"

   
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->administration-->undertakings-->addUndertaking", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })

})





router.put('/UpdateUndertaking', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let role_cd = SqlString.escape(obj["role_cd"])
    let id = SqlString.escape(obj["id"])

    let doc_type = SqlString.escape(obj["doc_type"])
    let fields = SqlString.escape(obj["fields"])
    let update_user_id = SqlString.escape(obj["update_user_id"])

    let data = SqlString.escape(obj["data"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))




    let sql = "update " + db + ".undertakings set doc_type=" + doc_type + ",role_cd=" + role_cd + ",fields=" + fields + ",data=" + data 
            + ",update_user_id="+update_user_id+",update_timestamp= "+update_timestamp +" where id="+id

   
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->administration-->undertakings-->UpdateUndertaking", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })

})





module.exports = router;
