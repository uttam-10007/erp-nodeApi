var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js');
var moment = require('moment')






router.get('/getarr:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT arr_source_cd,party_leagal_name,arr_desc,id,arr_id,arr_lacal_no,party_id,DATE_FORMAT( arr_effective_dt,'%Y-%m-%d') as arr_effective_dt,party_id,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_" + b_acct_id + "_ebill.arr_info"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->arr-->getarr--", error)
            objectToSend["error"] = true
            objectToSend["arr_effective_dt"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});



router.post('/addarr', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))



    let sql = "insert into svayam_" + b_acct_id + "_ebill.arr_info (arr_id,arr_lacal_no,party_id,arr_desc,arr_effective_dt,party_leagal_name,arr_source_cd,create_user_id,create_timestamp) values "


        + "(" + SqlString.escape(obj.arr_id) + "," + SqlString.escape(obj.arr_lacal_no) + "," + SqlString.escape(obj.party_id) + "," + SqlString.escape(obj.arr_desc) + "," + SqlString.escape(obj.arr_effective_dt) + "," + SqlString.escape(obj.party_leagal_name) + ","+ SqlString.escape(obj.arr_source_cd) +"," + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ")"



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->arr-->addarr", error)
            objectToSend["error"] = true
            objectToSend["arr_effective_dt"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })

})

router.put('/updatearr', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let arr_id = obj["arr_id"]
    let arr_lacal_no = obj["arr_lacal_no"]
    let id = obj["id"]
    let party_id = SqlString.escape(obj["party_id"])
    let arr_effective_dt = SqlString.escape(obj["arr_effective_dt"])
    
    let party_leagal_name = SqlString.escape(obj["party_leagal_name"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let arr_desc = SqlString.escape(obj["arr_desc"])
    let arr_source_cd = SqlString.escape(obj["arr_source_cd"])

    let sql = "update svayam_" + b_acct_id + "_ebill.arr_info set arr_id=" + SqlString.escape(arr_id) + ","
        + "arr_lacal_no=" + SqlString.escape(arr_lacal_no) + ",party_id=" + party_id
        + ",arr_effective_dt=" + arr_effective_dt +  ",arr_desc =" + arr_desc
        + ",party_leagal_name=" + party_leagal_name+",arr_source_cd ="+arr_source_cd
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp
        + " where id=" + SqlString.escape(id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->arr-->updatearr", error)
            objectToSend["error"] = true
            objectToSend["arr_effective_dt"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully"
            res.send(objectToSend);
        }
    })
})


router.delete('/deletearr:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]

    let sql = "delete from svayam_" + b_acct_id + "_ebill.arr_info where id=" + SqlString.escape(id)

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->arr-->deletearr", error)
            objectToSend["error"] = true
            objectToSend["arr_effective_dt"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully"
            res.send(objectToSend);
        }
    })

})


module.exports = router