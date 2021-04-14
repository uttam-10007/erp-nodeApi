var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')



router.put('/updateStatus', (req, res) => {
    let obj = req.body
    let objectToSend = {};

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]
    let status = SqlString.escape(obj["status"])
    let update_user_id = SqlString.escape(obj["update_user_id"])

    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + b_acct_id + "_account"

    let sql_upd = "update " + db + ".bp set status=" + status + ",update_user_id=" + update_user_id
        + ",update_timestamp=" + update_timestamp + " where id in ("+id+")";

console.log(sql_upd);
            mysqlPool.query(sql_upd, function (error2, results) {
                if (error2) {
                    console.log("Error-->routes-->account-->bp-->updateBp", error2)
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    res.send(objectToSend)

                } else {
                    objectToSend["error"] = false;
                    objectToSend["data"] = "Updated Successfully!"
                    res.send(objectToSend)


        }

    })




})






router.get('/getDataForBp:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_account"
    let date = SqlString.escape(obj['date'])

    let sql_fetch =  "SELECT  dt.jrnl_id,dt.jrnl_desc,DATE_FORMAT(dt.acct_dt,'%Y-%m-%d') as  acct_dt,sum(dt.txn_amt) AS txn_amt,dt.chart_of_account,"
    +"   dt.party_id,dt.party_name,dt.bank_acct_num,dt.bank_code,dt.branch_code,dt.ifsc_code,dt.arr_id from "

let sql1="SELECT jr.jrnl_id,jr.jrnl_desc,jr.acct_dt,jr.txn_amt,jr.db_cd_ind,jr.chart_of_account,jr.jrnl_ln_id,jr.jrnl_dtl_ln_id,"
+"   ar.party_id,i.party_name,i.bank_acct_num,i.bank_code,i.branch_code,i.ifsc_code,jr.arr_id"
+" FROM " + db + ".sal ar JOIN " + db + ".ip i ON ar.party_id=i.party_id"
+" JOIN " + db + ".jrnl jr ON ar.arr_id=jr.arr_id"
+" WHERE jr.db_cd_ind='CR' AND jr.acct_dt<="+date


  
let sql2="SELECT jr.jrnl_id,jr.jrnl_desc,jr.acct_dt,(-1)*jr.txn_amt AS txn_amt,jr.db_cd_ind,jr.chart_of_account,jr.jrnl_ln_id,jr.jrnl_dtl_ln_id,"
+"   ar.party_id,i.party_name,i.bank_acct_num,i.bank_code,i.branch_code,i.ifsc_code,jr.arr_id"
+" FROM " + db + ".sal ar JOIN " + db + ".ip i ON ar.party_id=i.party_id"
+" JOIN " + db + ".jrnl jr ON ar.arr_id=jr.arr_id"
+" WHERE jr.db_cd_ind='DB' AND jr.acct_dt<="+date


    if (obj["party_id"] != undefined) {
        if (obj["party_id"] != null) {
        sql1 += " and ar.party_id=" + SqlString.escape(obj["party_id"])
        sql2 += " and ar.party_id=" + SqlString.escape(obj["party_id"])
 
        }
    }
    if (obj["chart_of_account"] != undefined) {
        if (obj["chart_of_account"] != null) {
            sql1 += " and jr.chart_of_account=" + SqlString.escape(obj["chart_of_account"])
            sql2 += " and jr.chart_of_account=" + SqlString.escape(obj["chart_of_account"])

        }

    }
    sql_fetch += "("+sql1 +" union "+sql2 +")dt   GROUP BY  dt.jrnl_id,dt.jrnl_desc,dt.acct_dt,dt.chart_of_account,"
    +" dt.party_id,dt.party_name,dt.bank_acct_num,dt.bank_code,dt.branch_code,dt.ifsc_code,dt.arr_id"


       mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->account-->bp-->getDataForBp", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }

    })
})
router.post('/insertProcessedbp',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
     
    let jrnl=obj['jrnl']
    let jrnl_keys=Object.keys(jrnl[0])
   

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
                    console.log("Error-->routes-->account-->gen_cb-->insertProcessedbp", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);  
                }else{
                    mysqlCon.beginTransaction(function(error1){
                        if(error1){
                            console.log("Error-->routes-->account-->gen_cb-->insertProcessedbp", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        }else{
                            mysqlCon.query(sql1,function(error2,results2){
                                if(error2){
                                    console.log("Error-->routes-->account-->gen_cb-->insertProcessedbp", error2)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    mysqlCon.commit(function(error3){
                                        if(error3){
                                            console.log("Error-->routes-->account-->gen_cb-->insertProcessedbp", error3)
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


router.get('/getbpData:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_account"
    let date = SqlString.escape(obj['date'])


let sql1="SELECT jr.jrnl_id,jr.jrnl_desc,jr.acct_dt,sum(jr.txn_amt) AS txn_amt,jr.db_cd_ind,jr.chart_of_account,jr.jrnl_ln_id,jr.jrnl_dtl_ln_id,"
+"   i.party_id,i.party_name,i.bank_acct_num,i.bank_code,i.branch_code,i.ifsc_code,jr.arr_id"
+" FROM " + db + ".ip i "
+" JOIN " + db + ".jrnl jr ON  i.party_id=jr.arr_id"
+" WHERE  jr.acct_dt<="+date 


  



    if (obj["party_id"] != undefined) {
        if (obj["party_id"] != null) {
        sql1 += " and i.party_id=" + SqlString.escape(obj["party_id"])
        
 
        }
    }
    if (obj["chart_of_account"] != undefined) {
        if (obj["chart_of_account"] != null) {
            sql1 += " and jr.chart_of_account=" + SqlString.escape(obj["chart_of_account"])
            

        }

    }
sql1+=" GROUP BY  jr.arr_id"
console.log(sql1)

       mysqlPool.query(sql1, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->account-->bp-->getDataForBp", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }

    })
})


router.get('/getAllBp:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_account"

    let sql_fetch =  " select chart_of_account,id,remark,party_id,data,status,bp_amount,DATE_FORMAT(bp_date,'%Y-%m-%d') as bp_date,create_user_id, "
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,update_user_id"
                +" from " + db + ".bp"
  
       mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->account-->bp-->getDataForBp", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }

    })
})



router.post('/createBp', (req, res) => {
    let obj = req.body
    let objectToSend = {};

    let b_acct_id = obj["b_acct_id"]
   
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let status = SqlString.escape(obj["status"])
    let remark = SqlString.escape(obj["remark"])

    let dataArr=obj['data']
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let db = "svayam_" + b_acct_id + "_account"

          let sql_insert = "INSERT INTO " + db + ".bp (chart_of_account,remark,party_id,data, status, bp_amount, bp_date,  create_user_id,"
                + " create_timestamp) values "

            for(let i=0;i<dataArr.length;i++){

                let ob1=new Object
                ob1=Object.assign({},dataArr[i])

                let party_id = SqlString.escape(ob1["party_id"])
            
                let data = SqlString.escape(JSON.stringify(ob1))
               
            
                let bp_amount = SqlString.escape(ob1["txn_amt"])
                let bp_date = SqlString.escape(ob1["bp_date"])
                let chart_of_account = SqlString.escape(ob1["chart_of_account"])


                sql_insert+= "("+chart_of_account+","+remark+","+party_id+","+data+","+ status+","+ bp_amount+","+ bp_date+","+ create_user_id+","+create_timestamp+")"
                if(i!=dataArr.length-1){
                    sql_insert+= ","
                }
            }

            mysqlPool.query(sql_insert, function (error2, results) {
                if (error2) {
                    console.log("Error-->routes-->account-->bp-->createBp", error2)
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    res.send(objectToSend)

                } else {
                    objectToSend["error"] = false;
                    objectToSend["data"] = "Created Successfully!"
                    res.send(objectToSend)
              

        }

    })




})



router.put('/updateBp', (req, res) => {
    let obj = req.body
    let objectToSend = {};

    let b_acct_id = obj["b_acct_id"]
    let remark = SqlString.escape(obj["remark"])
    let party_id = SqlString.escape(obj["party_id"])
    let id = SqlString.escape(obj["id"])

    let data = SqlString.escape(obj["data"])
    let status = SqlString.escape(obj["status"])
    let chart_of_account = SqlString.escape(obj["chart_of_account"])

    let bp_amount = SqlString.escape(obj["bp_amount"])
    let bp_date = SqlString.escape(obj["bp_date"])
    let update_user_id = SqlString.escape(obj["update_user_id"])

    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + b_acct_id + "_account"

    let sql_upd = "update " + db + ".bp set chart_of_account="+chart_of_account+",remark=" + remark + ",party_id=" + party_id + ",data=" + data 
    + ",status=" + status + ",bp_amount=" + bp_amount + ",bp_date=" + bp_date + ",update_user_id=" + update_user_id
        + ",update_timestamp=" + update_timestamp + " where id=" + id

           
            mysqlPool.query(sql_upd, function (error2, results) {
                if (error2) {
                    console.log("Error-->routes-->account-->bp-->updateBp", error2)
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    res.send(objectToSend)

                } else {
                    objectToSend["error"] = false;
                    objectToSend["data"] = "Updated Successfully!"
                    res.send(objectToSend)
              

        }

    })




})

router.put('/updateStatus', (req, res) => {
    let obj = req.body
    let objectToSend = {};

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]
    let status = SqlString.escape(obj["status"])
    let update_user_id = SqlString.escape(obj["update_user_id"])

    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + b_acct_id + "_account"

    let sql_upd = "update " + db + ".bp set status=" + status + ",update_user_id=" + update_user_id
        + ",update_timestamp=" + update_timestamp + " where id in ("+id+")";

console.log(sql_upd);
            mysqlPool.query(sql_upd, function (error2, results) {
                if (error2) {
                    console.log("Error-->routes-->account-->bp-->updateBp", error2)
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    res.send(objectToSend)

                } else {
                    objectToSend["error"] = false;
                    objectToSend["data"] = "Updated Successfully!"
                    res.send(objectToSend)


        }

    })




})



router.delete('/deleteBp:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])

    let db = "svayam_" + b_acct_id + "_account"

    let sql_fetch =  "delete from " + db + ".bp where id = "+id
  
       mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->account-->bp-->deleteBp", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Deleted Successfully!"
            res.send(objectToSend)
        }

    })
})



router.get('/getAdvice:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let db = "svayam_" + obj.b_acct_id + "_account"
    let sql = "Select *  from  " + db + ".advice";
    mysqlPool.query(sql, function(error, results) {
        if (error) {
            console.log("Error-->routes-->account-->bp-->getAdvice", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});





router.post('/createAdvice', (req, res) => {
    let obj = req.body
    let objectToSend = {};
    let b_acct_id = obj["b_acct_id"]

    let remark = SqlString.escape(obj["remark"])
    let bpid = SqlString.escape(obj["bpid"])
    let status = SqlString.escape(obj["status"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let amount = SqlString.escape(obj["amount"])
    let db = "svayam_" + b_acct_id + "_account"

    let sql = "INSERT INTO " + db + ".advice (amount,bpid,status,remark,create_user_id," +
        "create_timestamp) values ("+amount+ ","+ bpid + "," + status + "," + remark + "," + create_user_id +
        "," + create_timestamp + ")";


    mysqlPool.query(sql, function(error2, results) {
        if (error2) {
            console.log("Error-->routes-->account-->bp-->createAdvice", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Created Successfully!"
            res.send(objectToSend)
        }
    })
})




router.delete('/deleteAdvice:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);
    let id=obj.id;
    let bpid=obj.bpid;
    let db = "svayam_" + obj.b_acct_id + "_account"
    let sql_delete = "delete  from  " + db + ".advice where id="+id;
    let sql_update="update " + db + ".bp set status='GENERATED' where id in ("+bpid+")";
    mysqlPool.query(sql_delete+";"+sql_update, function(error, results) {
        if (error) {
            console.log("Error-->routes-->account-->bp-->deleteAdvice", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});




module.exports = router;
