var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')




router.get('/getAllbookletpurchase:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);
    let db = "svayam_" + obj.b_acct_id + "_property";
    let scheme_code=SqlString.escape(obj.scheme_code);
    let sub_scheme_code=SqlString.escape(obj.sub_scheme_code);


    let sql = "SELECT p.arr_type_code,p.id,p.party_id,q.party_name,p.booklet_amount,p.booklet_challan_no,p.arr_effective_date AS booklet_purchase_date ,p.arr_status_code FROM "+db+".arrangement_info AS p JOIN "+db+".party_info AS q ON p.party_id=q.party_id WHERE arr_type_code='BOOKLETPURCHASE' and"
    +" scheme_code="+scheme_code+" and sub_scheme_code="+sub_scheme_code;

    console.log(sql)
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->booklet_purchase-->getAllbookletpurchase--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});

router.put('/changeBookletPurchaseStatus', (req, res) => {

    let objectToSend = {}
    let obj =req.body;
    let db = "svayam_" + obj.b_acct_id + "_property";
    let arr_status_code=SqlString.escape(obj.arr_status_code);
    let update_user_id=SqlString.escape(obj.update_user_id);
    let id=SqlString.escape(obj.id);
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update  "+db+".arrangement_info set arr_status_code="+arr_status_code+",update_user_id="+
    update_user_id+",update_timestamp="+update_timestamp+" where id="+id;

    console.log(sql)

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->booklet_purchase-->changeBookletPurchaseStatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});





module.exports = router;