
var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getcontra:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id =req.params.dtls;



    let sql_fetchCurr = "SELECT id,voucher_no,DATE_FORMAT( voucher_date,'%Y-%m-%d') as voucher_date,remark,data,status,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_"+b_acct_id+"_account.contra"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contra-->getcontra--", error)
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



router.post('/addcontra',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let getQuer = "select max(voucher_no) as voucher_no from svayam_"+b_acct_id+"_account.contra"

    mysqlPool.query(getQuer, function (error, results1) {
        if (error) {
            console.log("Error-->routes-->account-->contra-->addcontra", error)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            let voucher_no = 1
            if (results1[0]['voucher_no'] == null) {
                voucher_no = 1
            } else {
                voucher_no = results1[0]['voucher_no'] + 1

            }
    let sql="insert into svayam_"+b_acct_id+"_account.contra (voucher_no,voucher_date,remark,data,status,create_user_id,create_timestamp) values "


            + "("+SqlString.escape(voucher_no)+","+SqlString.escape(obj.voucher_date)+","+SqlString.escape(obj.remark)+","+ SqlString.escape(obj.data) +","+ SqlString.escape(obj.status) +","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"



    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->settings-->contra-->addcontra", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = voucher_no
            res.send(objectToSend);
        }
    })
}
    })
})

router.put('/updatecontra',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let voucher_no=obj["voucher_no"]
    let voucher_date=obj["voucher_date"]
    let id=obj["id"]
    let remark=SqlString.escape(obj["remark"])
     let data=SqlString.escape(obj["data"])
 let status=SqlString.escape(obj["status"])
 let update_user_id=SqlString.escape(obj["update_user_id"])
 let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_account.contra set voucher_no="+SqlString.escape(voucher_no)+","
            +"voucher_date="+SqlString.escape(voucher_date)+",remark="+remark
+",data="+data+",status="+status
+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp
            +" where id="+SqlString.escape(id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->contra-->updatecontra", error)
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


router.delete('/deletecontra:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_account.contra where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->contra-->deletecontra", error)
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




router.post('/insertProcessedVoucherData',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
     let id=obj["id"]
     let status=  SqlString.escape( obj["status"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let jrnl=obj['jrnl']
    let jrnl_keys=Object.keys(jrnl[0])
    let sql = "update svayam_" + b_acct_id + "_account.contra set status=" + status + ", update_user_id=" + update_user_id + ", "
        + " update_timestamp=" + update_timestamp + " where id in (" + id.join(",")+")"

            let sql1="insert into svayam_"+b_acct_id+"_account.jrnl ("+jrnl_keys.join(",")+") values "

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
                    console.log("Error-->routes-->account-->contra-->insertProcessedVoucherData", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                }else{mysqlCon.beginTransaction(function(error1){
                        if(error1){
                            console.log("Error-->routes-->account-->contra-->insertProcessedVoucherData", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        }else{
                            mysqlCon.query(sql+";"+sql1,function(error2,results2){
                                if(error2){
                                    console.log("Error-->routes-->account-->contra-->insertProcessedVoucherData", error2)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    mysqlCon.commit(function(error3){
                                        if(error3){
                                            console.log("Error-->routes-->account-->contra-->insertProcessedVoucherData", error3)
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
