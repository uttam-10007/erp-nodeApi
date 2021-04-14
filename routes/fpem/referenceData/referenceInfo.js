var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var mysqlPool = require('../../../connections/mysqlConnection');

var SqlString = require('sqlstring');








function fetchDataFromHive(hql, callback) {
    hiveDbCon.reserve(function (err4, connObj) {
        if (err4) {
            hiveDbCon.release(connObj, function (err8) {
                if (err8) {
                    console.log("Error-->routes-->referenceData-->referenceInfo-->--Error while releasing con", err8)
                } else {
                    console.log("Hive conn released")
                }
            })
            return callback(err4, null)
        } else {
            var conn = connObj.conn;


            conn.createStatement(function (err1, statement) {
                if (err1) {
                    hiveDbCon.release(connObj, function (err8) {
                        if (err8) {
                            console.log("Error-->routes-->referenceData-->referenceInfo-->--Error while releasing con", err8)
                        } else {
                            console.log("Hive conn released")
                        }
                    })
                    return callback(err1, null)
                } else {
                    statement.executeQuery(hql, function (err2, rows) {
                        if (err2) {
                            hiveDbCon.release(connObj, function (err8) {
                                if (err8) {
                                    console.log("Error-->routes-->referenceData-->referenceInfo-->--Error while releasing con", err8)
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            return callback(err2, null)
                        } else {
                            rows.toObjArray(function (error, rs) {
                                if (error) {

                                    hiveDbCon.release(connObj, function (err8) {
                                        if (err8) {
                                            console.log("Error-->routes-->referenceData-->referenceInfo-->--Error while releasing con", err8)
                                        } else {
                                            console.log("Hive conn released")
                                        }
                                    })
                                    return callback(error, null)


                                } else {
                                    hiveDbCon.release(connObj, function (err8) {
                                        if (err8) {
                                            console.log("Error-->routes-->referenceData-->referenceInfo-->--Error while releasing con", err8)
                                        } else {
                                            console.log("Hive conn released")
                                        }
                                    })

                                    return callback(null, rs)


                                }

                            })
                        }
                    })
                }

            })


        }
    })
}

function executeQueryInHive(query, callback) {

    hiveDbCon.reserve(async function (err4, connObj) {
        if (err4) {

            return callback(err4)

        } else {

            var conn = connObj.conn;

            conn.createStatement(function (err, statement) {
                if (err) {
                    hiveDbCon.release(connObj, function (err) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("Hive conn released")
                        }
                    })
                    callback(err)

                } else {
                    statement.executeUpdate(query, function (err1, count) {
                        if (err1) {
                            hiveDbCon.release(connObj, function (err4) {
                                if (err4) {
                                    console.log(err.message);
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            callback(err)

                        } else {
                            hiveDbCon.release(connObj, function (err) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            callback(null)
                        }
                    })




                }
            })

        }
    })

}

//ref_ExchangeRate 
router.post('/insertExchangeRate', function (req, res) {

    
    var objectToSend = {};

    let db='svayam_'+req.body.b_acct_id+'_data';

   
    let sql1="insert into " + db+ ".ref_exchange_rate  (from_currency,to_currency,rate,eff_date) values("+SqlString.escape(req.body.from_currency)+","+SqlString.escape(req.body.to_currency)+","+SqlString.escape(req.body.rate)+","+SqlString.escape(req.body.eff_date)+")";
    mysqlPool.query(sql1,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->insertExchangeRate-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
   
});

router.post('/deleteExchangeRate', function (req, res) {

    
    var objectToSend = {};

    let db='svayam_'+req.body.b_acct_id+'_data';

   
    let sql1="delete from  " + db+ ".ref_exchange_rate where ref_id="+req.body.ref_id;
    mysqlPool.query(sql1,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->deleteExchangeRate-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Delete Successfully!"
            res.send(objectToSend);
        }
    })
   
});

router.get('/getExchangeRate:dtls', function (req, res) {

    
    var objectToSend = {};

    let db='svayam_'+req.params.dtls+'_data';

   
    let sql1="select ref_id, from_currency,to_currency,rate, DATE_FORMAT(eff_date,'%Y-%m-%d') as eff_date from " + db+ ".ref_exchange_rate";
    mysqlPool.query(sql1,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->getExchangeRate-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
   
});

router.put('/updateExchangeRate', function (req, res) {

    
    var objectToSend = {};

    let db='svayam_'+req.body.b_acct_id+'_data';
    let sql1="update   " + db+ ".ref_exchange_rate  set from_currency="+SqlString.escape(req.body.from_currency)
    +" ,to_currency="+SqlString.escape(req.body.to_currency)+",rate="+SqlString.escape(req.body.rate)+",eff_date="+SqlString.escape(req.body.eff_date)
    +"  where ref_id="+SqlString.escape(req.body.ref_id);

   
    mysqlPool.query(sql1,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->updateExchangeRate-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "update Successfully!"
            res.send(objectToSend);
        }
    })
   
});

//ref_orgnanistion 
router.post('/insertorganisation', function (req, res) {

    
    var objectToSend = {};

    let db='svayam_'+req.body.b_acct_id+'_data';

   
    let sql="insert into " + db+ ".ref_organisation  (org_unit_cd,organisation_name,base_currency,presentation_currency,eligible_gaap,iue_cost_center) values("
    +SqlString.escape(req.body.org_unit_cd)+","+SqlString.escape(req.body.organisation_name)+","+SqlString.escape(req.body.base_currency)
    +" ,"+SqlString.escape(req.body.presentation_currency)+","+SqlString.escape(req.body.eligible_gaap)+","+SqlString.escape(req.body.iue_cost_center)+")";



    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->insertorganisation-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
   
});

router.delete('/deleteorganisation:dtls', function (req, res) {

    var obj=JSON.parse(req.params.dtls);

    var objectToSend = {};

    var b_acct_id=obj.b_acct_id;
    var ref_id=obj.ref_id;

    let db='svayam_'+b_acct_id+'_data';

   
    let sql="delete from  " + db+ ".ref_organisation where ref_id="+ref_id;


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->deleteorganisation-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Delete Successfully!"
            res.send(objectToSend);
        }
    })
   
});

router.get('/getorganisation:dtls', function (req, res) {

    
    var objectToSend = {};

    let db='svayam_'+req.params.dtls+'_data';

    let sql="select  * from " + db+ ".ref_organisation ";

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->getorganisation-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })
   
});

router.get('/getPresentationCurrency:dtls', function (req, res) {

    
    var objectToSend = {};

   
    let db='svayam_'+req.params.dtls+'_data';

    let sql="select presentation_currency as presentation_currencies from  "+db+".ref_organisation ";

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->getPresentationCurrency-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })
   
});

router.put('/updateorganisation', function (req, res) {

    
    var objectToSend = {};

 

   

    let db='svayam_'+req.body.b_acct_id+'_data';

    let sql="update   " + db+ ".ref_organisation  set org_unit_cd="+SqlString.escape(req.body.org_unit_cd)+" ,organisation_name="+SqlString.escape(req.body.organisation_name)
             +" ,base_currency="+SqlString.escape(req.body.base_currency)+" ,presentation_currency="+SqlString.escape(req.body.presentation_currency)+" ,eligible_gaap="+SqlString.escape(req.body.eligible_gaap)
             +" ,iue_cost_center="+SqlString.escape(req.body.iue_cost_center)+"  where ref_id="+SqlString.escape(req.body.ref_id);

 
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->updateorganisation-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "update Successfully!"
            res.send(objectToSend);
        }
    })
   
});

//ref Account Info
router.get("/accountDetails:dtls",(req,res)=>{
    let objectToSend={}



    let b_acct_id=req.params.dtls;
    let db='svayam_'+b_acct_id+'_data';

    let sql_acctdtl="select p.ref_id,p.acct_num,p.acct_num_desc,p.acct_type_cd,p.on_off_indicator,r.on_balancesheet_account,r.off_balancesheet_account,"
                       +" group_concat(c.book_cd) as book_cd,group_concat(c.reclass_account) as reclass_account"
                       +" from  "+db+".ref_account p left join "+db+".ref_iue_account r on p.acct_num=r.acct_num left join "+db+".ref_reclass_account c on r.acct_num=c.acct_num"
                       +" group by p.ref_id,p.acct_num,p.acct_num_desc,p.acct_type_cd,p.on_off_indicator,r.on_balancesheet_account,r.off_balancesheet_account";


                  
    mysqlPool.query(sql_acctdtl,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->accountDetails-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
}) 

router.post('/insertAccountDetails', function (req, res) {

    let obj=req.body;

    var b_acct_id=obj.b_acct_id;
    var acct_num=obj.acct_num;

    var acct_num_desc=obj.acct_num_desc;
    var acct_type_cd=obj.acct_type_cd;
    var on_off_indicator=obj.on_off_indicator;
    
    var on_balancesheet_account=obj.on_balancesheet_account;
    var off_balancesheet_account=obj.off_balancesheet_account;

    var book_cd=[];
    if(obj.book_cd!=null){
        book_cd=obj.book_cd.split(',');
    }
 
  
    var reclass_account=[];
    if(obj.reclass_account!=null){
        reclass_account=obj.reclass_account.split(',');
    }
   
   

    var objectToSend = {};

    let db='svayam_'+b_acct_id+'_data';

    let sql1="insert into " + db+ ".ref_account (acct_num,acct_num_desc,acct_type_cd,on_off_indicator) values("+SqlString.escape(acct_num)+","+SqlString.escape(acct_num_desc)+","+SqlString.escape(acct_type_cd)+","+SqlString.escape(on_off_indicator)+")";
   
    let sql2="select  * from " + db+ ".ref_iue_account limit 1 ";

    if(obj.on_balancesheet_account!=null && obj.off_balancesheet_account!=null){

        sql2="insert into " + db+ ".ref_iue_account (acct_num,on_balancesheet_account,off_balancesheet_account) values("+SqlString.escape(acct_num)+","+SqlString.escape(on_balancesheet_account)+","+SqlString.escape(off_balancesheet_account)+")";

    }

    let sql3="select  * from " + db+ ".ref_reclass_account limit 1 ";

    if(obj.book_cd!=null &&  obj.reclass_account!=null){

        sql3="insert into " + db+ ".ref_reclass_account (acct_num,book_cd,reclass_account) values"

        for(let i=0;i<book_cd.length;i++){
                 sql3=sql3+"("+SqlString.escape(acct_num)+","+SqlString.escape(book_cd[i])+","+SqlString.escape(reclass_account[i])+"),"
         }

         sql3=sql3.substring(0,sql3.length-1);

    }
 

    mysqlPool.query(sql1+";"+sql2+";"+sql3,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->insertAccountDetails-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
   
});

router.put("/updateAccountInfo",(req,res)=>{

    let objectToSend={}

    let obj=req.body;

    let b_acct_id=obj.b_acct_id;
    let acct_num=obj.acct_num;

    let db='svayam_'+b_acct_id+'_data';

    var acct_num_desc=obj.acct_num_desc;
    var acct_type_cd=obj.acct_type_cd;
    var on_off_indicator=obj.on_off_indicator;

    var on_balancesheet_account=obj.on_balancesheet_account;
    var off_balancesheet_account=obj.off_balancesheet_account;

    
var book_cd=[];
    if(obj.book_cd!=null){
	            book_cd=obj.book_cd.split(',');
	        }
	 
	  
	    var reclass_account=[];
	    if(obj.reclass_account!=null){
		            reclass_account=obj.reclass_account.split(',');
		        }
    
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->referenceData-->referenceInfo-->updateAccountInfo--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {

                var query = "update  " + db + ".ref_account set acct_num_desc="+SqlString.escape(acct_num_desc )+", acct_type_cd="+SqlString.escape(acct_type_cd)+", on_off_indicator="+SqlString.escape(on_off_indicator)+" where acct_num=" + SqlString.escape(acct_num) ;
               var query1="select  * from " + db+ ".ref_iue_account limit 1 ";
		                    if(obj.on_balancesheet_account!=null && obj.off_balancesheet_account!=null){
		     query1 = "update  " + db + ".ref_iue_account set on_balancesheet_account="+SqlString.escape(on_balancesheet_account) +", off_balancesheet_account="+SqlString.escape(off_balancesheet_account)+" where acct_num=" + SqlString.escape(acct_num) ;
               
				    }
		let sql_insert="select  * from " + db+ ".ref_reclass_account limit 1 ";
		  
		let query2="delete from " +db+ ".ref_reclass_account where acct_num='" + acct_num + "'";
		 if(obj.book_cd!=null &&  obj.reclass_account!=null){
                 query2= "delete from " +db+ ".ref_reclass_account where acct_num='" + acct_num + "'";

                 sql_insert="insert into " + db+ ".ref_reclass_account (acct_num,book_cd,reclass_account) values"

                for(let i=0;i<book_cd.length;i++){
                    sql_insert=sql_insert+"("+SqlString.escape(acct_num)+","+SqlString.escape(book_cd[i])+","+SqlString.escape(reclass_account[i])+"),"
                }
            
                sql_insert=sql_insert.substring(0,sql_insert.length-1);
		 }
               
                 
                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->referenceData-->referenceInfo-->updateAccountInfo--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query + ";" + query1+ ";"+ query2, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->referenceData-->referenceInfo-->updateAccountInfo---", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                mysqlCon.query(sql_insert,function(err,results,fields){
                                    if(err){
                                        console.log("Error-->routes-->referenceData-->referenceInfo-->updateAccountInfo---", error);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.rollback();
                                        mysqlCon.release();

                                    }else{
 
                                       mysqlCon.commit(function (err8) {
                                       if (err8) {
                                        console.log("Error-->routes-->referenceData-->referenceInfo-->updateAccountInfo----", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Account Info Update Successfully";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.release();

                                    }
                                });
                            }
                            
                        });
                       }
                     });
                    }
                });
            }
        });
    }

    catch (ex) {
        console.log("Error-->routes-->referenceData-->referenceInfo-->updateAccountInfo", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }
})

router.delete('/deleteAccountInfo:obj', function (req, res) {

    var obj = JSON.parse(req.params.obj);
    
    var b_acct_id=obj.b_acct_id;
    var acct_num=obj.acct_num

    let db='svayam_'+b_acct_id+'_data';
    var objectToSend = {};


    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->referenceData-->referenceInfo-->deleteaccontinfo--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {

                var query = "delete from " + db + ".ref_account where acct_num='" + acct_num + "'";
                var query1 = "delete from " + db + ".ref_iue_account where acct_num='" + acct_num + "'";
                var query2= "delete from " +db+ ".ref_reclass_account where acct_num='" + acct_num + "'";


                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->referenceData-->referenceInfo-->deleteaccontinfo--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query + ";" + query1+ ";"+ query2, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->referenceData-->referenceInfo-->deleteaccontinfo---", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {


                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->referenceData-->referenceInfo-->deleteaccontinfo----", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Account Info Delete Successfully";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.release();

                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    catch (ex) {
        console.log("Error-->routes-->referenceData-->referenceInfo-->deleteaccontinfo", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});

//chart of account
router.get('/getaccount:dtls', function (req, res) {

    
    var objectToSend = {};

    var  b_acct_id=req.params.dtls;

    let db='svayam_'+b_acct_id+'_data';

   
    let sql1="select  * from " + db+ ".ref_account ";
    mysqlPool.query(sql1,function(error,results){
        if(error){
            console.log("Error-->routes-->referenceData-->referenceInfo-->getaccount-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })
   
});

module.exports=router;
