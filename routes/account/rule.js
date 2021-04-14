var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')




router.get('/getAllRule:dtls', (req, res) => {

    let objectToSend = {}
    let b_acct_id = req.params.dtls
    let db = "svayam_" + b_acct_id + "_account";

    let sql = "Select id,rule_name,priority,event_code,rule_data,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from "+db+".rule_info"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->rule-->getAllRules-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })

})

router.delete('/deleteRule:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let db = "svayam_" + b_acct_id + "_account";
    let id = obj.id;

    let sql_del_info = "delete from svayam_" + b_acct_id + "_account.rule_info where id=" + id;


    mysqlPool.query( sql_del_info, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->rule-->deleteRule--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })

})

router.post('/createRule', function (req, res) {
    var objectToSend = {};
    let obj = req.body
    let b_acct_id = obj["b_acct_id"]
    let rule_name = SqlString.escape(obj["rule_name"])
    let priority = SqlString.escape(obj["priority"])
    let rule_data =  SqlString.escape(obj["rule_data"])
    let event_code =  SqlString.escape(obj["event_code"])

    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));
    let db = "svayam_" + b_acct_id + "_account";

let sql="insert into "+db+".rule_info (rule_name,priority,event_code,rule_data,create_user_id,create_timestamp) values "
        +"("+rule_name+","+priority+","+event_code+","+rule_data+","+create_user_id+","+create_timestamp+")"
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->rule-->createRule-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Rule Added Successfully.'
            res.send(objectToSend);
        }
    })

});

router.put('/updateRule', function (req, res) {
    var objectToSend = {};
    let obj = req.body;
    let id = SqlString.escape(obj["id"])
    let rule_name = SqlString.escape(obj["rule_name"])
    let priority = SqlString.escape(obj["priority"])
    let rule_data =  SqlString.escape(obj["rule_data"])
    let event_code =  SqlString.escape(obj["event_code"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));
let b_acct_id=obj['b_acct_id'];

let db = "svayam_" + b_acct_id + "_account";
  
    let sql="update "+db+".rule_info  set rule_name="+rule_name+",priority="+priority+",event_code="+event_code
    +",rule_data="+rule_data+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

mysqlPool.query(sql, function (error, results) {
    if (error) {
        console.log("Error-->routes-->account-->rule-->updateRule-->", error)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    } else {
        objectToSend["error"] = false
        objectToSend["data"] = 'Rule Updated Successfully.'
        res.send(objectToSend);
    }
})

});



module.exports = router;
