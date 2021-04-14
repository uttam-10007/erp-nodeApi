var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/createtendermechanism', (req, res) => {
    let obj = req.body
    let objectToSend = {};

    let b_acct_id = obj["b_acct_id"]
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let db = "svayam_" + b_acct_id + "_eng"
    let svayam_tender_id= SqlString.escape(obj["svayam_tender_id"])
    let  nic_tender_id= SqlString.escape(obj["nic_tender_id"])
    let  type_of_firm= SqlString.escape(obj["type_of_firm"])
    let   l1_firm_name= SqlString.escape(obj["l1_firm_name"])
    let   l1_application_id= SqlString.escape(obj["l1_application_id"])
    let   l1_email= SqlString.escape(obj["l1_email"])
    let   l1_mob_no= SqlString.escape(obj["l1_mob_no"])
    let   l1_address= SqlString.escape(obj["l1_address"])
    let   l2_firm_name= SqlString.escape(obj["l2_firm_name"])
    let   l2_application_id= SqlString.escape(obj["l2_application_id"])
    let   l2_email= SqlString.escape(obj["l2_email"])
    let   l2_mob_no= SqlString.escape(obj["l2_mob_no"])
    let   l2_address= SqlString.escape(obj["l2_address"])
    let   verification_status= SqlString.escape(obj["verification_status"])
    let   no_of_firms= SqlString.escape(obj["no_of_firms"])
    let    firm_data= SqlString.escape(JSON.stringify(obj["firm_data"]))
    let   ratio_of_distribution= SqlString.escape(obj["ratio_of_distribution"])
    let    loa_document_id= SqlString.escape(obj["loa_document_id"])
    let    loa_generate_doc_id= SqlString.escape(obj["loa_generate_doc_id"])
    let    loa_generate_date= SqlString.escape(obj["loa_generate_date"])
    let    loa_award_obj= SqlString.escape(JSON.stringify(obj["loa_award_obj"]))
    let    agreement_doc_id= SqlString.escape(obj["agreement_doc_id"])
    let  agreement_generate_doc_id= SqlString.escape(obj["agreement_generate_doc_id"])
    let  agreement_generate_date= SqlString.escape(obj["agreement_generate_date"])
    let  tender_award_firm= SqlString.escape(obj["tender_award_firm"])
    let  offer_value= SqlString.escape(obj["offer_value"])
    let  payment_data= SqlString.escape(JSON.stringify(obj["payment_data"]))
    let  work_period_obj= SqlString.escape(JSON.stringify(obj["work_period_obj"]))
    let  blacklist_firm= SqlString.escape(obj["blacklist_firm"])
    let  blacklist_doc_id= SqlString.escape(obj["blacklist_doc_id"])
    let  blacklist_time_period= SqlString.escape(obj["blacklist_time_period"])
    let blanklist_remark= SqlString.escape(obj["blanklist_remark"])
    let extension_data= SqlString.escape(JSON.stringify(obj["extension_data"]))
    let  escalation_data= SqlString.escape(JSON.stringify(obj["escalation_data"]))
    let  deviation_data= SqlString.escape(JSON.stringify(obj["deviation_data"]))
    let  completion_cert_document_id= SqlString.escape(obj["completion_cert_document_id"])
    let  completion_cert_generate_document_id= SqlString.escape(obj["completion_cert_generate_document_id"])
    let   completion_cert_generate_date= SqlString.escape(obj["completion_cert_generate_date"])
    let completion_remark= SqlString.escape(obj["completion_remark"])
    let status= SqlString.escape(obj["status"])
    let tech_opening_date= SqlString.escape(obj["tech_opening_date"])
    let est_id= SqlString.escape(obj["est_id"])

    let sql_insert = "INSERT INTO " + db + ".tender_mechanism (svayam_tender_id,nic_tender_id,type_of_firm,l1_firm_name,l1_application_id,l1_email,l1_mob_no,"
          + " l1_address,l2_firm_name,l2_application_id,l2_email,l2_mob_no,l2_address,verification_status,"
          + " no_of_firms,firm_data,ratio_of_distribution,loa_document_id,loa_generate_doc_id,loa_generate_date,loa_award_obj,agreement_doc_id,"
          + " agreement_generate_doc_id, agreement_generate_date,tender_award_firm,offer_value,payment_data,work_period_obj,"
          + " blacklist_firm,blacklist_doc_id,blacklist_time_period,blanklist_remark,extension_data,"
          + " escalation_data,deviation_data,completion_cert_document_id,completion_cert_generate_document_id,"
          + " create_user_id,create_timestamp,completion_cert_generate_date,completion_remark,status,tech_opening_date,est_id) values "
        + " (" + svayam_tender_id+","+nic_tender_id+","+type_of_firm+","+l1_firm_name+","+l1_application_id+","+l1_email+","+l1_mob_no+","
       + l1_address+","+l2_firm_name+","+l2_application_id+","+l2_email+","+l2_mob_no+","+l2_address+","+verification_status
       +","+no_of_firms+","+firm_data+","+ratio_of_distribution+","+loa_document_id+","+loa_generate_doc_id+","+loa_generate_date+","+loa_award_obj+","+agreement_doc_id
       +","+ agreement_generate_doc_id+","+  agreement_generate_date+","+tender_award_firm+","+offer_value+","+payment_data+","+work_period_obj
       +","+blacklist_firm+","+blacklist_doc_id+","+blacklist_time_period+","+blanklist_remark+","+extension_data
       +","+escalation_data+","+deviation_data+","+completion_cert_document_id+","+completion_cert_generate_document_id
       +","+create_user_id+","+create_timestamp+","+completion_cert_generate_date+","+completion_remark+","+status+","+tech_opening_date+","+est_id+")"

    mysqlPool.query(sql_insert, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tendermechanism-->createtendermechanism", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }

    })



})

router.get('/gettendermechanism:dtls', (req, res) => {
    let objectToSend = {}

    let obj =JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql_fetch = "select id,svayam_tender_id,nic_tender_id,type_of_firm,l1_firm_name,l1_application_id,l1_email,l1_mob_no,"
        + "  l1_address,l2_firm_name,l2_application_id,l2_email,l2_mob_no,l2_address,verification_status,"
        + " no_of_firms,firm_data,ratio_of_distribution,loa_document_id,loa_generate_doc_id,DATE_FORMAT( loa_generate_date,'%Y-%m-%d') as loa_generate_date,loa_award_obj,agreement_doc_id,"
        + "agreement_generate_doc_id,DATE_FORMAT( agreement_generate_date,'%Y-%m-%d') as agreement_generate_date,tender_award_firm,offer_value,"
        + "payment_data,work_period_obj,"
        + " blacklist_firm,blacklist_doc_id,"
        + " blacklist_time_period,blanklist_remark,extension_data,"
        + " escalation_data,deviation_data,completion_cert_document_id,completion_cert_generate_document_id,"
        + " create_user_id,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,"
        + "update_user_id,DATE_FORMAT( completion_cert_generate_date,'%Y-%m-%d') as completion_cert_generate_date,completion_remark,status,DATE_FORMAT( tech_opening_date,'%Y-%m-%d') as tech_opening_date,est_id"
        + " FROM " + db + ".tender_mechanism"

    




    mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tendermechanism-->gettendermechanism", error2)
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

router.put('/updatetendermechanism', (req, res) => {
    let objectToSend = {}
    let obj = req.body


    let id = SqlString.escape(obj["id"])
    let b_acct_id = obj["b_acct_id"]
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let db = "svayam_" + b_acct_id + "_eng"
    let svayam_tender_id= SqlString.escape(obj["svayam_tender_id"])
    let  nic_tender_id= SqlString.escape(obj["nic_tender_id"])
    let  type_of_firm= SqlString.escape(obj["type_of_firm"])
    let   l1_firm_name= SqlString.escape(obj["l1_firm_name"])
    let   l1_application_id= SqlString.escape(obj["l1_application_id"])
    let   l1_email= SqlString.escape(obj["l1_email"])
    let   l1_mob_no= SqlString.escape(obj["l1_mob_no"])
    let   l1_address= SqlString.escape(obj["l1_address"])
    let   l2_firm_name= SqlString.escape(obj["l2_firm_name"])
    let   l2_application_id= SqlString.escape(obj["l2_application_id"])
    let   l2_email= SqlString.escape(obj["l2_email"])
    let   l2_mob_no= SqlString.escape(obj["l2_mob_no"])
    let   l2_address= SqlString.escape(obj["l2_address"])
    let   verification_status= SqlString.escape(obj["verification_status"])
    let   no_of_firms= SqlString.escape(obj["no_of_firms"])
    let    firm_data= SqlString.escape(JSON.stringify(obj["firm_data"]))
    let   ratio_of_distribution= SqlString.escape(obj["ratio_of_distribution"])
    let    loa_document_id= SqlString.escape(obj["loa_document_id"])
    let    loa_generate_doc_id= SqlString.escape(obj["loa_generate_doc_id"])
    let    loa_generate_date= SqlString.escape(obj["loa_generate_date"])
    let    loa_award_obj= SqlString.escape(JSON.stringify(obj["loa_award_obj"]))
    let    agreement_doc_id= SqlString.escape(obj["agreement_doc_id"])
    let  agreement_generate_doc_id= SqlString.escape(obj["agreement_generate_doc_id"])
    let  agreement_generate_date= SqlString.escape(obj["agreement_generate_date"])
    let  tender_award_firm= SqlString.escape(obj["tender_award_firm"])
    let  offer_value= SqlString.escape(obj["offer_value"])
    let  payment_data= SqlString.escape(JSON.stringify(obj["payment_data"]))
    let  work_period_obj= SqlString.escape(JSON.stringify(obj["work_period_obj"]))
    let  blacklist_firm= SqlString.escape(obj["blacklist_firm"])
    let  blacklist_doc_id= SqlString.escape(obj["blacklist_doc_id"])
    let  blacklist_time_period= SqlString.escape(obj["blacklist_time_period"])
    let blanklist_remark= SqlString.escape(obj["blanklist_remark"])
    let extension_data= SqlString.escape(JSON.stringify(obj["extension_data"]))
    let  escalation_data= SqlString.escape(JSON.stringify(obj["escalation_data"]))
    let  deviation_data= SqlString.escape(JSON.stringify(obj["deviation_data"]))
    let  completion_cert_document_id= SqlString.escape(obj["completion_cert_document_id"])
    let  completion_cert_generate_document_id= SqlString.escape(obj["completion_cert_generate_document_id"])
    let   completion_cert_generate_date= SqlString.escape(obj["completion_cert_generate_date"])
    let completion_remark= SqlString.escape(obj["completion_remark"])
    let status= SqlString.escape(obj["status"])
    let tech_opening_date= SqlString.escape(obj["tech_opening_date"])
   
    
    let sql_upd = "update " + db + ".tender_mechanism set l1_application_id=" + l1_application_id+",l1_email="+l1_email+",l1_mob_no="+l1_mob_no+",l1_firm_name ="+l1_firm_name+",type_of_firm ="+type_of_firm+",nic_tender_id ="+nic_tender_id+",svayam_tender_id ="+svayam_tender_id
    +",l1_address="+l1_address+",l2_firm_name="+l2_firm_name+",l2_application_id="+l2_application_id+",l2_email="+l2_email+","
    + " l2_mob_no="+ l2_mob_no+",l2_address="+l2_address+",verification_status="+verification_status+",no_of_firms="+no_of_firms
    +",firm_data="+firm_data+",ratio_of_distribution="+ratio_of_distribution+",loa_document_id="+loa_document_id+","
    + " loa_generate_doc_id="+loa_generate_doc_id+",loa_generate_date="+loa_generate_date+",loa_award_obj="+loa_award_obj+",agreement_doc_id="+agreement_doc_id
    +",agreement_generate_doc_id="+agreement_generate_doc_id+",agreement_generate_date="+agreement_generate_date+",tender_award_firm="+tender_award_firm+","
    + " tender_award_firm="+  tender_award_firm+",offer_value="+offer_value
    +",payment_data="+payment_data+",work_period_obj="+work_period_obj+",blacklist_firm="+blacklist_firm+","
    + " blacklist_doc_id="+blacklist_doc_id+",blacklist_time_period="+blacklist_time_period+",blanklist_remark="+blanklist_remark
    +",extension_data="+extension_data+",escalation_data="+escalation_data+","
    + " deviation_data="+deviation_data+",deviation_data="+deviation_data
    +",completion_cert_document_id="+completion_cert_document_id+",completion_cert_generate_document_id="+completion_cert_generate_document_id+","
    + " update_user_id="+update_user_id+",update_timestamp="+update_timestamp+",completion_cert_generate_date="+completion_cert_generate_date
    +",completion_remark="+completion_remark+",status="+status+",tech_opening_date ="+tech_opening_date
      + " where id=" + id

    mysqlPool.query(sql_upd, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tendermechanism-->updatetendermechanism", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "mechanism tender updated Successfully"
            res.send(objectToSend)
        }

    })

})




router.delete('/deletetendermechanism:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)


    let id = SqlString.escape(obj["id"])
    //let doc_id = obj["doc_id"]
    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql = "delete from " + db + ".tender_mechanism  where id=" + id

    


    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->tendermechanism-->deletetendermechanism", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->tendermechanism-->deletetendermechanism", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->tendermechanism-->deletetendermechanism", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->eng-->tendermechanism-->deletetendermechanism", error3);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Deleted successfully! "
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

router.put('/updatetendermechanismstatus', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.tender_mechanism set "
    +"status="+SqlString.escape(obj.status)+",update_user_id="+SqlString.escape(obj.update_user_id)+","   
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->tendermechanism-->updatetendermechanismstatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Status update successfully"
            res.send(objectToSend);
        }
    })
})

module.exports = router;