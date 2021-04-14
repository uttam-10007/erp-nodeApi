var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')




router.get('/getapplication:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT *,ar.id AS arr_id FROM "+ db +".arrangement_info ar JOIN "+ db +".auction_party_info au ON ar.party_id = au.id JOIN "+ db +".auction_property ap ON  ar.property_type_id = ap.property_type_id AND ar.property_id = ap.property_id WHERE ar.arr_type_code = 'AUCTION_REGISTRATION' and ar.scheme_code ="+SqlString.escape(obj.scheme_code)+" and  ar.sub_scheme_code ="+SqlString.escape(obj.sub_scheme_code)
        
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->auction-->getapplication", error)
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




router.get('/getAuctiondata:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT id,scheme_code,sub_scheme_code,property_type_id,property_id,status,reserve_price,DATE_FORMAT(reg_start_date,'%Y-%m-%d') AS reg_start_date,create_user_id,create_timestamp,DATE_FORMAT(reg_end_date,'%Y-%m-%d') AS reg_end_date,DATE_FORMAT(auction_date,'%Y-%m-%d') AS auction_date,auction_time From "+db+".auction_property where scheme_code ="+SqlString.escape(obj.scheme_code)+" and  sub_scheme_code ="+SqlString.escape(obj.sub_scheme_code)
        
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->Interface-->property-->auction-->getAuctiondata", error)
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

router.post('/addauction', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

      let sql_insert = "insert into " + db + ".auction_property(scheme_code,sub_scheme_code,property_type_id,property_id,status,reserve_price,reg_start_date,"
                    +"create_user_id,create_timestamp,reg_end_date,auction_date,auction_time) values "

     + " ( "+SqlString.escape(obj.scheme_code)+" ," + SqlString.escape(obj.sub_scheme_code) + "," + SqlString.escape(obj.property_type_id) + ","
    + SqlString.escape(obj.property_id) + "," + SqlString.escape(obj.status) + ","
    + SqlString.escape(obj.reserve_price) + ","+SqlString.escape(obj.reg_start_date)+"," + SqlString.escape(obj.create_user_id) + ","
    + create_timestamp + ", "+ SqlString.escape(obj.reg_end_date) + "," + SqlString.escape(obj.auction_date) +","+ SqlString.escape(obj.auction_time) + ")"
 
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->auction-->addauction--", error)
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



router.put('/updateauction', (req, res) => {

    let objectToSend = {}

    let obj = req.body;
    
    
    
    
    

    let query = "update svayam_"+obj.b_acct_id+"_property.auction_property set scheme_code = "+SqlString.escape(obj.scheme_code)+",sub_scheme_code = "+SqlString.escape(obj.sub_scheme_code)+",property_type_id = "+SqlString.escape(obj.property_type_id)+",property_id = "+SqlString.escape(obj.property_id)+",status = "+SqlString.escape(obj.status)+",reserve_price = "+SqlString.escape(obj.reserve_price)+","
    +"reg_start_date = "+SqlString.escape(obj.reg_start_date)+",reg_end_date = "+SqlString.escape(obj.reg_end_date)+",auction_date = "+SqlString.escape(obj.auction_date)+",auction_time = "+SqlString.escape(obj.auction_time)+",update_user_id = "+SqlString.escape(obj.update_user_id)+","
    +"update_timestamp = "+SqlString.escape(obj.update_timestamp)
     +" where id= "+obj.id

    
        
    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->auction-->updateauction--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "update successfully"

            res.send(objectToSend);
        }
    })
})


router.delete('/deleteauction:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]

    let sql = "delete from svayam_" + b_acct_id + "_property.auction_property where id =" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->auction-->deleteauction", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " Deleted Successfully"
            res.send(objectToSend);
        }
    })

})


module.exports=router;
