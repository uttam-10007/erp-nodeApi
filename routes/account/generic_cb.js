var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')

router.post('/addgenericcb',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_account.gen_cb (party_id,work_order_no,work_or_service_name,cb_date,bill_no,bill_date,status,net_amt,data,create_user_id,create_timestamp) values "

 
        + "("+SqlString.escape(obj.party_id)+","+SqlString.escape(obj.work_order_no)+","+SqlString.escape(obj.work_or_service_name)+","+SqlString.escape(obj.cb_date)+","+SqlString.escape(obj.bill_no)+","+SqlString.escape(obj.bill_date)+","+SqlString.escape(obj.status)+","+SqlString.escape(obj.net_amt)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->generic_cb-->addgenericcb", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
})

router.put('/updategenericcb',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let party_id=obj["party_id"]
    let work_order_no=obj["work_order_no"]
    let cb_id=obj["cb_id"]
    let work_or_service_name=SqlString.escape(obj["work_or_service_name"])
    let cb_date=SqlString.escape(obj["cb_date"])
    let bill_no=SqlString.escape(obj["bill_no"])
    let status=SqlString.escape(obj["status"])
    let net_amt=SqlString.escape(obj["net_amt"])
    let data=SqlString.escape(obj["data"])
    let bill_date=SqlString.escape(obj["bill_date"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))



    let sql="update svayam_"+b_acct_id+"_account.gen_cb set party_id="+SqlString.escape(party_id)+","
            +"work_order_no="+SqlString.escape(work_order_no)+",work_or_service_name="+work_or_service_name+",bill_no="+bill_no+",cb_date="+cb_date+","
            +"status="+status+",net_amt="+net_amt+",data="+data+",bill_date="+bill_date+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+" "
            +" where cb_id="+SqlString.escape(cb_id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->generic_cb-->updategenericcb", error)
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

router.delete('/deletegenericcb:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let cb_id=obj["cb_id"]

    let sql="delete from svayam_"+b_acct_id+"_account.gen_cb where cb_id="+SqlString.escape(cb_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->generic_cb-->deletegenericcb", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully" 
            res.send(objectToSend);
        }
    })

})
router.get('/getgenericcb:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT cb_id,party_id,work_order_no,work_or_service_name,DATE_FORMAT(cb_date,'%Y-%m-%d') as cb_date,bill_no,DATE_FORMAT(bill_date,'%Y-%m-%d') as bill_date,status,net_amt,data,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+b_acct_id+"_account.gen_cb";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->generic_cb-->getgenericcbt--", error)
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



router.put('/changeCbStatus', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let status = SqlString.escape(obj["status"])
    let cb_id = obj["cb_id"]
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account.gen_cb set status=" + status + ", update_user_id=" + update_user_id + ", "
        + " update_timestamp=" + update_timestamp + " where cb_id in (" + cb_id.join(",")+")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->gen_cb-->changeCbStatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully"
            res.send(objectToSend);
        }
    })
})








router.post('/insertProcessedCBData',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
     let cb_id=obj["cb_id"]
     let status=  SqlString.escape( obj["status"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let jrnl=obj['jrnl']
    let jrnl_keys=Object.keys(jrnl[0])
    let sql = "update svayam_" + b_acct_id + "_account.gen_cb set status=" + status + ", update_user_id=" + update_user_id + ", "
        + " update_timestamp=" + update_timestamp + " where cb_id in (" + cb_id.join(",")+")"

            let sql1="insert into svayam_"+b_acct_id+"_account.jv ("+jrnl_keys.join(",")+") values "
  
        for(let i=0;i<jrnl.length;i++){
            let jrnlObj=Object.assign({},jrnl[i])
            let str="("

            for(let j=0;j<jrnl_keys.length;j++){
                str +=SqlString.escape(jrnlObj[jrnl_keys[j]])+","
            }
            str =str.substring(0,str.length - 1) +"),"
            sql1= sql1 + str
        }

        sql1 =sql1.substring(0,sql1.length - 1)
            mysqlPool.getConnection(function(error,mysqlCon){
                if(error){
                    console.log("Error-->routes-->account-->gen_cb-->insertProcessedCBData", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);  
                }else{
                    mysqlCon.beginTransaction(function(error1){
                        if(error1){
                            console.log("Error-->routes-->account-->gen_cb-->insertProcessedCBData", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        }else{
                            mysqlCon.query(sql+";"+sql1,function(error2,results2){
                                if(error2){
                                    console.log("Error-->routes-->account-->gen_cb-->insertProcessedCBData", error2)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    mysqlCon.commit(function(error3){
                                        if(error3){
                                            console.log("Error-->routes-->account-->gen_cb-->insertProcessedCBData", error3)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release()
                                        }else{
                                            objectToSend["error"] = false
                                            objectToSend["data"] = "Processed Successfully." 
                                            res.send(objectToSend);
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

router.put('/acceptcb', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
   

    let b_acct_id = obj["b_acct_id"]
    let status = SqlString.escape(obj["status"])
    let cb_id = obj["cb_id"]
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let allocation_obj = obj["allocation_obj"]
    let accrued_amount = obj["accrued_amount"]
    let arr = Object.keys(allocation_obj);
    let query ="update svayam_" + b_acct_id + "_account.gen_cb set status=" + status + ", update_user_id=" + update_user_id + ", "
    + " update_timestamp=" + update_timestamp + " where cb_id in (" + cb_id.join(",")+")"
    
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->gen_cb-->acceptcb--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->account-->gen_cb-->acceptcb--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(query, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->account-->gen_cb-->acceptcb--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                           

                            let sql_insert3 =  "UPDATE svayam_" + b_acct_id + "_account.allocation set amount = case "
                            
                            for (let i = 0; i < arr.length; i++) {
                                sql_insert3 +=" when allocation_id =" +SqlString.escape(arr[i])+" then "+SqlString.escape(allocation_obj[arr[i]])
                              
                            }
                            sql_insert3 += " ELSE amount  END WHERE allocation_id in (" + arr.join(",") + ")"
                         
                            let sql_insert4 =  "UPDATE svayam_" + b_acct_id + "_account.allocation set accrued_amount = case "
                            
                            for (let i = 0; i < arr.length; i++) {
                                sql_insert4 +=" when allocation_id =" +SqlString.escape(arr[i])+" then "+SqlString.escape(accrued_amount[arr[i]])
                              
                            }
                            sql_insert4 += " ELSE accrued_amount  END WHERE allocation_id in (" + arr.join(",") + ")"
                           
                            mysqlCon.query(sql_insert3 +";"+sql_insert4, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->account-->gen_cb-->acceptcb--", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }
                                else {


                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->account-->gen_cb-->acceptcb--", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Updated Successfully"
                                            res.send(objectToSend)
                                        }

                                    })

                                }
                            })

                        }
                    })
                }
            })
        }


    })
})

module.exports=router;
