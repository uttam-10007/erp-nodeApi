var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')


router.get('/getChallanInfo:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]
    let status=obj["status"]
    let challan_source=obj["challan_source"]
    let demand_id=obj["demand_id"]
    let party_id=obj["party_id"]

    let sql="Select id,party_id,party_name,party_phone_no,party_email,amount,DATE_FORMAT(challan_generate_date,'%Y-%m-%d') as challan_generate_date,"
            +"DATE_FORMAT(challan_payment_date,'%Y-%m-%d') as challan_payment_date,status,challan_source,purpose,demand_id,data "
            +"from svayam_"+b_acct_id+"_account.challan_info"

    let flag=true;
    if(id!=undefined){
        if(flag){
            sql+=" where id="+SqlString.escape(id)
            flag=false;
        }else{
            sql+=" and id="+SqlString.escape(id)
        }
    }
    
    if(status!=undefined){
        if(flag){
            sql+=" where status="+SqlString.escape(status)
            flag=false;
        }else{
            sql+=" and status="+SqlString.escape(status)
        }
    }
    
    if(party_id!=undefined){
        if(flag){
            sql+=" where party_id="+SqlString.escape(party_id)
            flag=false;
        }else{
            sql+=" and party_id="+SqlString.escape(party_id)
        }
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->challan-->getChallanInfo--", error)
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

router.post('/createChallan',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]

    let party_id=SqlString.escape(obj["party_id"])
    let party_name=SqlString.escape(obj["party_name"])
    let party_phone_no=SqlString.escape(obj["party_phone_no"])
    let party_email=SqlString.escape(obj["party_email"])
    let amount=SqlString.escape(obj["amount"])
    let challan_generate_date=SqlString.escape(moment().format('YYYY-MM-DD'))
    let status=SqlString.escape(obj["status"])
    let purpose=SqlString.escape(obj["purpose"])
    let challan_source=SqlString.escape(obj["challan_source"])
    let demand_id=SqlString.escape(obj["demand_id"]);
    let data=SqlString.escape(obj['data']);
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_account.challan_info (party_id,party_name,party_phone_no,party_email,amount,challan_generate_date,"
            +"status,purpose,challan_source,demand_id,data,create_user_id,create_timestamp) values"
            +"("+party_id+","+party_name+","+party_phone_no+","+party_email+","+amount+","+challan_generate_date+","+status+","+purpose
            +","+challan_source+","+demand_id+","+data+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->challan-->createChallan--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })


})

router.put('/updateChallan',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])
    let party_id=SqlString.escape(obj["party_id"])
    let party_name=SqlString.escape(obj["party_name"])
    let party_phone_no=SqlString.escape(obj["party_phone_no"])
    let party_email=SqlString.escape(obj["party_email"])
    let amount=SqlString.escape(obj["amount"])
    let challan_generate_date=SqlString.escape(obj["challan_generate_date"])
    let status=SqlString.escape(obj["status"])
    let purpose=SqlString.escape(obj["purpose"])
    let challan_source=SqlString.escape(obj["challan_source"])
    let demand_id=SqlString.escape(obj["demand_id"]);
    let data=SqlString.escape(obj['data']);
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let sql="update svayam_"+b_acct_id+"_account.challan_info set party_id="+party_id+",party_name="+party_name+",party_phone_no="+party_phone_no+","
        +"party_email="+party_email+",amount="+amount+",challan_generate_date="+challan_generate_date+",status="+status+",purpose="+purpose+","
        +"challan_source="+challan_source+",demand_id="+demand_id+",data="+data+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->challan-->updateChallan--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Challan Updated Successfully"
            res.send(objectToSend);
        }
    })

})

router.delete('/deleteChallan:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])

    let sql="delete from svayam_"+b_acct_id+"_account.challan_info where id="+id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->challan-->deleteChallan--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Challan Deleted Successfully"
            res.send(objectToSend);
        }
    })
    
})






router.put('/updateChallanStatus',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
     let id=obj["id"]
     let status=  SqlString.escape( obj["status"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_user_id=SqlString.escape(obj["update_user_id"])


    let sql="update svayam_"+b_acct_id+"_account.challan_info set status="+status+",update_user_id="+update_user_id
    +",update_timestamp="+update_timestamp
            +" where id in ("+id.join(",")+")"


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->challan-->updateChallanStatus", error)
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


router.post('/insertProcessedChallanData',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
     let id=obj["id"]
     let status=  SqlString.escape( obj["status"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let jrnl=obj['jrnl']
    let jrnl_keys=Object.keys(jrnl[0])
    let sql="update svayam_"+b_acct_id+"_account.challan_info set status="+status+",update_user_id="+update_user_id
    +",update_timestamp="+update_timestamp
            +" where id in ("+id.join(",")+")"

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
                    console.log("Error-->routes-->account-->challan-->insertProcessedChallanData", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);  
                }else{
                    mysqlCon.beginTransaction(function(error1){
                        if(error1){
                            console.log("Error-->routes-->account-->challan-->insertProcessedChallanData", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        }else{
                            mysqlCon.query(sql+";"+sql1,function(error2,results2){
                                if(error2){
                                    console.log("Error-->routes-->account-->challan-->insertProcessedChallanData", error2)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    mysqlCon.commit(function(error3){
                                        if(error3){
                                            console.log("Error-->routes-->account-->challan-->insertProcessedChallanData", error3)
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
module.exports=router;
