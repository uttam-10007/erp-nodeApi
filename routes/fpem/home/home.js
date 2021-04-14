var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con.js')
var mysqlPool = require('../../../connections/mysqlConnection.js');


var SqlString = require('sqlstring');

router.get('/systemCountInfo:dtls',(req,res)=>{

    let objectToSend={}
    let b_acct_id=req.params.dtls
    let db="svayam_"+b_acct_id+"_data";
    let dbs="svayam_"+b_acct_id+"_md";
    let eventCount="select count(*) as count from " + dbs + ".record_info where record_type ='source_event_layouts'"
    let sourceCount="select  count(*) as count from " + db + ".source_info "
    let layoutCount="select count(*)  as count  from "  + dbs + ".record_info where record_type='fpem_event_layout'"

    let total_count=eventCount+";"+sourceCount+";"+layoutCount;

    mysqlPool.query(total_count,function(error,results){
        if(error){
            console.log("Error-->routes-->home-->home-->systemCountInfo--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            var obj={};
            obj['event']=results[0];
            obj['source']=results[1];
            obj['layout']=results[2];
            objectToSend["data"] = obj;
            res.send(objectToSend);
        }
    })
});

router.get('/systemProcessRuleCountInfo:dtls',(req,res)=>{

    let objectToSend={}
    let b_acct_id=req.params.dtls
    let db="svayam_"+b_acct_id+"_data";
    let dbs="svayam_"+b_acct_id+"_md";
    let ruleCount="select count(*) as count from " + db + ".rule "
    let processCount="select  count(*) as count from " + dbs + ".process_info" 
   
    let total_count=ruleCount+";"+processCount;

    mysqlPool.query(total_count,function(error,results){
        if(error){
            console.log("Error-->routes-->home-->home-->systemProcessRuleCountInfo--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            var obj={};
            obj['process']=results[1];
            obj['rule']=results[0];
          
            objectToSend["data"] = obj;
            res.send(objectToSend);
        }
    })
});

router.get('/systemPpdRecordCount:dtls',(req,res)=>{


    let objectToSend={}
    let b_acct_id=req.params.dtls;
    let db="svayam_"+b_acct_id+"_data";
    let PpdRecordCount="select DATE_FORMAT(b.ppd,'%Y-%m-%d') as ppd,sum(b.num_of_records) as total_record from  " + db + ".batch_status b  group by b.ppd ";
    
    mysqlPool.query(PpdRecordCount,function(error,results){
        if(error){
            console.log("Error-->routes-->home-->home-->systemPpdRecordCount--", error)
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

router.get("/getAccountInfo:dtls", (req, res) => {
    let objectToSend = {}

    let b_acct_id = req.params.dtls
    let db="svayam_"+b_acct_id+"_data";
    let sql_getUploadedInfo = "Select * from " + propObj.svayamSystemDbName + ".user_info where b_acct_id=" + SqlString.escape(b_acct_id)
    sql_getUploadedInfo1 = " Select GROUP_CONCAT( DISTINCT presentation_currency) as presentation_currency from " + db + ".ref_organisation" 

    mysqlPool.query(sql_getUploadedInfo+";"+sql_getUploadedInfo1, function (error, results) {
        if (error) {
            console.log("Error-->routes-->profile-->getAccountInfo--", error)
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

router.get('/getOrganisationBookCodes:dtls', function (req, res) {
    var objectToSend = {};
    var db = 'svayam_' + req.params.dtls + '_data'
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->financials--trailBalance--->getOrganisationBookCodes", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                var acc_id = req.params.dtls;


                var query0 = "select org_unit_cd,eligible_gaap,organisation_name from " + db + ".ref_organisation";
                var query = "select acct_num,acct_num_desc,acct_type_cd from " + db + ".ref_account";


                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->financials-->trailBalance--->getOrganisationBookCodes", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query0 + ";" + query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->financials-->trailBalance--->getOrganisationBookCodes", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            
                                    else {
                                        mysqlCon.commit(function (err8) {
                                            if (err8) {
                                                console.log("Error-->routes-->financials-->orgBookCodeDtls--->getOrganisationBookCodes", err8);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                res.end(JSON.stringify(objectToSend))
                                                mysqlCon.rollback();
                                                mysqlCon.release();
                                            } else {

                                                var data = {};
                                                data['org_data'] = results[0];
                                                data['chart_of_account_data'] = results[1];

                                                objectToSend["error"] = false;
                                                objectToSend["data"] = data;
                                                


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
        console.log("Error-->routes-->financials-->trailBalance--->getOrganisationBookCodes", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});


module.exports = router;