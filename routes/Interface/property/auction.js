var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.put('/partypayment',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]

    let id=obj["id"]
    


    let sql="update svayam_"+b_acct_id+"_property.auction_party_info set payment_status= "+SqlString.escape(obj.payment_status)+",payment_amt ="+SqlString.escape(obj.payment_amt)
            +" where id="+SqlString.escape(id) 

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->interface-->property-->auction-->partypayment", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " Updated successfully" 
            res.send(objectToSend);
        }
    })
})



router.post('/addAuction', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

      let sql_insert = "insert into " + db + ".arrangement_info(property_id,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,property_type_id,arr_status_code,"
                    +"create_user_id,create_timestamp,application_amount,application_challan_no) values "

     + " ( "+SqlString.escape(obj.property_id)+ ",'AUCTION_REGISTRATION' ," + SqlString.escape(obj.arr_effective_date) + "," + SqlString.escape(obj.party_id) + ","
    + SqlString.escape(obj.scheme_code) + "," + SqlString.escape(obj.sub_scheme_code) + ","
    + SqlString.escape(obj.property_type_id) + ", 'APPROVAL_PENDING'," + SqlString.escape(obj.create_user_id) + ","
    + create_timestamp + ", "+ SqlString.escape(obj.application_amount) + "," + SqlString.escape(obj.application_challan_no) + ")"
 
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->Auction-->addApplication--", error)
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




router.get('/getAuctiondata:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT sub.*,sc.*,pr.*,ar.id,ar.scheme_code,ar.sub_scheme_code,ar.property_type_id,ar.property_id,ar.status,ar.reserve_price,DATE_FORMAT(ar.reg_start_date,'%Y-%m-%d') AS reg_start_date,ar.create_user_id,ar.create_timestamp,DATE_FORMAT(ar.reg_end_date,'%Y-%m-%d') AS reg_end_date,DATE_FORMAT(ar.auction_date,'%Y-%m-%d') AS auction_date,ar.auction_time From "+db+".auction_property ar JOIN "+db+".scheme_info sc ON sc.scheme_code = ar.scheme_code JOIN "+db+".sub_scheme_info sub ON sub.sub_scheme_code = ar.sub_scheme_code JOIN "+db+".property_type_info pr ON pr.property_type_id = ar.property_type_id GROUP BY ar.property_type_id,ar.property_id"//where scheme_code ="+SqlString.escape(obj.scheme_code)+" and  sub_scheme_code ="+SqlString.escape(obj.sub_scheme_code)
        
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


router.get('/getAuctionlogin:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT * From "+db+".auction_party_info where user_id ="+SqlString.escape(obj.user_id)+" and  password ="+SqlString.escape(obj.password)
        
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->Interface-->property-->auction-->getAuctionlogin", error)
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

router.post('/addparty', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

      let sql_insert = "insert into " + db + ".auction_party_info(user_id,password,email,phone_no,party_name,purpose,nationality,"
                    +"create_user_id,create_timestamp,quota,sub_quota) values "

     + " ( "+SqlString.escape(obj.user_id)+" ," + SqlString.escape(obj.password) + "," + SqlString.escape(obj.email) + ","
    + SqlString.escape(obj.phone_no) + "," + SqlString.escape(obj.party_name) + ","
    + SqlString.escape(obj.purpose) + ","+SqlString.escape(obj.nationality)+"," + SqlString.escape(obj.create_user_id) + ","
    + create_timestamp + ", "+ SqlString.escape(obj.quota) + "," + SqlString.escape(obj.sub_quota) + ")"
 
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
              if(error['code'] == 'ER_DUP_ENTRY'){
               // console.log("Error-->routes-->interface-->property-->auction-->addparty--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Please Enter Another Username"
                res.send(objectToSend);
            }
            else{
            console.log("Error-->routes-->interface-->property-->auction-->addparty--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});


router.put('/updateparty',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]

    let id=obj["id"]
    


    let sql="update svayam_"+b_acct_id+"_property.auction_party_info set password= "+SqlString.escape(obj.password)
            +" where id="+SqlString.escape(id) +" and password ="+SqlString.escape(obj.old_password)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->interface-->property-->auction-->updateparty", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully" 
            res.send(objectToSend);
        }
    })
})


module.exports=router;
