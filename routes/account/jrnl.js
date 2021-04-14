var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')

router.post('/postUnpostedJournal',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]

    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_account.unposted_jrnl (org_unit_cd,tgt_curr_cd,acct_dt,prep_id,appr_id,jrnl_id,preparer_comment,ledger_type,status,data_lines) values "

 
        + "("+SqlString.escape(obj.org_unit_cd)+","+SqlString.escape(obj.tgt_curr_cd)+","+SqlString.escape(obj.acct_dt)+","+SqlString.escape(obj.prep_id)+","
        +SqlString.escape(obj.appr_id)+","+SqlString.escape(obj.jrnl_id)+","+SqlString.escape(obj.preparer_comment)+","+SqlString.escape(obj.ledger_type)+","+SqlString.escape(obj.status)+","+SqlString.escape(obj.data_lines)+")"
console.log(sql)
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->jrnl-->postUnpostedJournal", error)
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


router.put('/updateUnpostedJournalstatus',(req,res)=>{
    let objectToSend={}
    let obj=req.body
    let b_acct_id=obj["b_acct_id"]

    let id=obj["id"]

    let status=SqlString.escape(obj["status"])




    let sql="update svayam_"+b_acct_id+"_account.unposted_jrnl set status="+status
            +" where id="+SqlString.escape(id)
   mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->jrnl-->updateUnpostedJournalstatus", error)
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





router.put('/updateUnpostedJournal',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let org_unit_cd=obj["org_unit_cd"]
    let tgt_curr_cd=obj["tgt_curr_cd"]
    let id=obj["id"]
    let acct_dt=SqlString.escape(obj["acct_dt"])
    let prep_id=SqlString.escape(obj["prep_id"])
    let appr_id=SqlString.escape(obj["appr_id"])
    let jrnl_id=SqlString.escape(obj["jrnl_id"])
    let preparer_comment=SqlString.escape(obj["preparer_comment"])
    let ledger_type=SqlString.escape(obj["ledger_type"]) 
    let status=SqlString.escape(obj["status"])
    let data_lines=SqlString.escape(obj["data_lines"])
   


    let sql="update svayam_"+b_acct_id+"_account.unposted_jrnl set org_unit_cd="+SqlString.escape(org_unit_cd)+","
            +"tgt_curr_cd="+SqlString.escape(tgt_curr_cd)+",acct_dt="+acct_dt+",prep_id="+prep_id+",appr_id="+appr_id+" "
            +",jrnl_id="+jrnl_id+",preparer_comment="+preparer_comment+",ledger_type="+ledger_type+" "
            +",status="+status+",data_lines="+data_lines+" "
          
            +" where id="+SqlString.escape(id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->jrnl-->updateUnpostedJournal", error)
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

router.delete('/deleteUnpostedJournal:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_account.unposted_jrnl where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->jrnl-->deleteUnpostedJournal", error)
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
router.get('/getAllUnpostedJournal:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT id,org_unit_cd,tgt_curr_cd,DATE_FORMAT(acct_dt,'%Y-%m-%d') as acct_dt,prep_id,appr_id,jrnl_id,preparer_comment,ledger_type,status,data_lines from svayam_"+b_acct_id+"_account.unposted_jrnl";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->jrnl-->getAllUnpostedJournal--", error)
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


router.post('/postjournal', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let b_acct_id=obj["b_acct_id"]
    let data = obj.data;
	console.log(data)
    let arr = Object.keys(data[0]);
    let query = "INSERT INTO svayam_" + b_acct_id + "_account.jrnl(" + arr.join(",") + ",create_timestamp) VALUES "
    for (let j = 0; j < data.length; j++) {
	query += "("
    for (let i = 0; i < arr.length; i++) {
        query += SqlString.escape(data[j][arr[i]])
        if (i < arr.length - 1) {
            query += ","
        }
    }
    query += ","+create_timestamp
    if(data.length-2 >= j){
    query += "),"
}
else{
    query += ")" 
}
}
console.log(query)    

mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->jrnl-->postjournal", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->interface-->property-->booklet-->bookletpurchase", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(query, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->account-->jrnl-->postjournal", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                           

                            let sql_insert3 = "update svayam_"+b_acct_id+"_account.unposted_jrnl set status="+SqlString.escape(obj.status)
                            +" where id="+SqlString.escape(obj.id)

                           
                            mysqlCon.query(sql_insert3, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->account-->jrnl-->postjournal", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }
                                else {


                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->account-->jrnl-->postjournal", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = results.insertId
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
