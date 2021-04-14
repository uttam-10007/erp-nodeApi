var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')


router.get('/getscheme:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;


    let db = "svayam_" + b_acct_id + "_property";

    let sql_fetchCurr = "select id,scheme_code,scheme_name,"
    +"create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from " + db + ".scheme_info"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->scheme-->getscheme--", error)
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

router.post('/createscheme', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let scheme_code = SqlString.escape(obj.scheme_code)
    let scheme_name=SqlString.escape(obj.scheme_name)
    let create_user_id=SqlString.escape(obj.create_user_id)

    let sql_insert = "insert into " + db + ".scheme_info (scheme_code,scheme_name,"
    +"create_user_id,create_timestamp) values"
        + " (" + scheme_code + "," + scheme_name + ","+ create_user_id + "," + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->scheme-->createscheme-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("already exists")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                }
            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})

router.put('/updatescheme', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_property";

    let objectToSend = {}

    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let scheme_code = SqlString.escape(obj.scheme_code)
    let scheme_name = SqlString.escape(obj.scheme_name)
    let update_user_id = SqlString.escape(obj.update_user_id)
   

    let sql = "update " + db + ".scheme_info set scheme_name=" + scheme_name +",update_user_id="+update_user_id 
    + ",update_timestamp=" + update_timestamp + "  where scheme_code=" + scheme_code + ";"




    mysqlPool.query(sql, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->property-->scheme-->updateScheme", error)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Scheme Updated successfully"
            res.send(objectToSend)
        }
    })
})

















module.exports = router;
