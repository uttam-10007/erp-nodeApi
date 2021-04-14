var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js');
var moment=require('moment')






router.get('/getparty:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id =req.params.dtls;



    let sql_fetchCurr = "SELECT bank_name,party_acct_no,bank_branch_name,ifsc_code,party_pan_no,party_adhar,party_email,party_phone_no,party_local_no,id,party_id,party_leagal_name,party_gstin_no,party_type_cd,party_source_cd,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_" + b_acct_id + "_ebill.party_info"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->party-->getparty--", error)
            objectToSend["error"] = true
            objectToSend["party_type_cd"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});



router.get('/partywithphone:dtls', (req, res) => {

    let objectToSend = {}

    let obj =JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"]

    let sql_fetchCurr = "SELECT bank_name,party_acct_no,bank_branch_name,ifsc_code,party_pan_no,party_adhar,party_email,party_phone_no,party_local_no,id,party_id,party_leagal_name,party_gstin_no,party_type_cd,party_source_cd,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_" 
                    + b_acct_id + "_ebill.party_info where party_phone_no="+SqlString.escape(obj['party_phone_no'])

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->party-->partywithphone--", error)
            objectToSend["error"] = true
            objectToSend["party_type_cd"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});
router.get('/getvendor:dtls', (req, res) => {

    let objectToSend = {}

    let obj =JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"]

    let sql_fetchCurr = "SELECT vi.*,ba.account_name,ba.account_short_name FROM (SELECT * FROM " + propObj.svayamSystemDbName 
    + ".vendor_info WHERE vendor_phone_no="+SqlString.escape(obj['vendor_phone_no'])+") vi JOIN " + propObj.svayamSystemDbName + ".billing_account ba ON ba.b_acct_id=vi.b_acct_id"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->party-->getvendor--", error)
            objectToSend["error"] = true
            objectToSend["party_type_cd"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});


router.post('/addparty',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

   
     
    let sql="insert into svayam_" + b_acct_id + "_ebill.party_info (bank_name,party_acct_no,bank_branch_name,ifsc_code,party_pan_no,party_adhar,party_id,party_leagal_name,party_gstin_no,party_local_no,party_type_cd,party_source_cd,party_phone_no,party_email,create_user_id,create_timestamp) values "


            + "("+SqlString.escape(obj.bank_name)+","+SqlString.escape(obj.party_acct_no)+","+SqlString.escape(obj.bank_branch_name)+","+SqlString.escape(obj.ifsc_code)+","
            +SqlString.escape(obj.party_pan_no)+","+SqlString.escape(obj.party_adhar)+","+SqlString.escape(obj.party_id)+","
            +SqlString.escape(obj.party_leagal_name)+","+SqlString.escape(obj.party_gstin_no)+","+ SqlString.escape(obj.party_local_no) 
            +","+ SqlString.escape(obj.party_type_cd) +","+ SqlString.escape(obj.party_source_cd) +","+ SqlString.escape(obj.party_phone_no)
             +","+ SqlString.escape(obj.party_email) +","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

let sql1="insert into "+propObj.svayamSystemDbName+".vendor_info (vendor_name,vendor_email,vendor_phone_no,password,b_acct_id) values "
+ "("+SqlString.escape(obj.party_leagal_name)+","+SqlString.escape(obj.party_email)+","+SqlString.escape(obj.party_phone_no)+",'User@1',"+b_acct_id+")"



    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->party-->addparty-", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->account-->settings-->party-->addparty-", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql+";"+sql1, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->account-->settings-->party-->addparty", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->account-->settings-->party-->addparty", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Added Successfully"
                                    res.send(objectToSend)
                                    mysqlCon.release()

                                }

                            })

                        }
                    })
                }
            })
        }


    })


})

router.put('/updateparty',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let party_id=obj["party_id"]
    let party_leagal_name=obj["party_leagal_name"]
    let id=obj["id"]
    let party_gstin_no=SqlString.escape(obj["party_gstin_no"])
     let party_type_cd=SqlString.escape(obj["party_type_cd"])
 let party_source_cd=SqlString.escape(obj["party_source_cd"])
 let party_email=SqlString.escape(obj["party_email"])
 let party_phone_no=SqlString.escape(obj["party_phone_no"])
 let update_user_id=SqlString.escape(obj["update_user_id"])
 let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
let party_local_no = SqlString.escape(obj["party_local_no"])
let party_pan_no = SqlString.escape(obj.party_pan_no)
let party_adhar = SqlString.escape(obj.party_adhar)

let bank_name=SqlString.escape(obj["bank_name"])
let party_acct_no=SqlString.escape(obj["party_acct_no"])
let bank_branch_name=SqlString.escape(obj["bank_branch_name"])
let ifsc_code=SqlString.escape(obj["ifsc_code"])

    let sql="update svayam_" + b_acct_id + "_ebill.party_info set party_id="+SqlString.escape(party_id)+","
            +"party_leagal_name="+SqlString.escape(party_leagal_name)+",party_gstin_no="+party_gstin_no
+",bank_name="+bank_name+",party_acct_no="+party_acct_no+",bank_branch_name ="+bank_branch_name+",ifsc_code ="+ifsc_code

+",party_type_cd="+party_type_cd+",party_source_cd="+party_source_cd+",party_local_no ="+party_local_no
+",party_phone_no="+party_phone_no+",party_email="+party_email+",party_adhar ="+party_adhar+",party_pan_no ="+party_pan_no
+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp
            +" where id="+SqlString.escape(id)

            let sql1="update  "+propObj.svayamSystemDbName+".vendor_info set vendor_name="+SqlString.escape(obj.party_leagal_name)
                        +",vendor_email="+SqlString.escape(obj.party_email)+",vendor_phone_no="+SqlString.escape(obj.party_phone_no)
                        +" where vendor_phone_no="+SqlString.escape(obj.old_party_phone_no)
            

            mysqlPool.getConnection(function (error, mysqlCon) {
                if (error) {
                    console.log("Error-->routes-->account-->party-->updateparty", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else {
                    mysqlCon.beginTransaction(function (error1) {
                        if (error1) {
                            console.log("Error-->routes-->account-->party-->updateparty", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        } else {
                            mysqlCon.query(sql+";"+sql1, function (error, results) {
                                if (error) {
                                    console.log("Error-->routes-->account-->party-->updateparty", error)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
        
                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->account-->party-->updateparty", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Updated Successfully"
                                            res.send(objectToSend)
                                            mysqlCon.release()
        
                                        }
        
                                    })
        
                                }
                            })
                        }
                    })
                }
        
        
            })

   
})


router.delete('/deleteparty:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_" + b_acct_id + "_ebill.party_info where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->party-->deleteparty", error)
            objectToSend["error"] = true
            objectToSend["party_type_cd"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully" 
            res.send(objectToSend);
        }
    })

})


module.exports = router
