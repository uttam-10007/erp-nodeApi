var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')


router.post('/createtender', (req, res) => {
    let obj = req.body
    let objectToSend = {};

    let b_acct_id = obj["b_acct_id"]
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let db = "svayam_" + b_acct_id + "_eng"
    let org_chain= SqlString.escape(obj["org_chain"])
    let  est_id= SqlString.escape(obj["est_id"])
    let  num_of_cover= SqlString.escape(obj["num_of_cover"])
    let   form_of_contract= SqlString.escape(obj["form_of_contract"])
    let   tender_type= SqlString.escape(obj["tender_type"])
    let   evaluation_allowed= SqlString.escape(obj["evaluation_allowed"])
    let   evaluation_allowed_data= SqlString.escape(obj["evaluation_allowed_data"])
    let   tender_category= SqlString.escape(obj["tender_category"])
    let   payment_mode= SqlString.escape(obj["payment_mode"])
    let   gen_tech_evaluation_allowed= SqlString.escape(obj["gen_tech_evaluation_allowed"])
    let   emb= SqlString.escape(obj["emb"])
    let   tender_fee= SqlString.escape(obj["tender_fee"])
    let   allowed_two_stage_bidding= SqlString.escape(obj["allowed_two_stage_bidding"])
    let   cover_data= SqlString.escape(obj["cover_data"])
    let   payment_instrument_data= SqlString.escape(obj["payment_instrument_data"])
    let    tender_name= SqlString.escape(obj["tender_name"])
    let   tender_desc= SqlString.escape(obj["tender_desc"])
    let    est_bud= SqlString.escape(obj["est_bud"])
    let    work_period_type= SqlString.escape(obj["work_period_type"])
    let    work_period= SqlString.escape(obj["work_period"])
    let    location= SqlString.escape(obj["location"])
    let    bid_validity= SqlString.escape(obj["bid_validity"])
    let  pre_bid_meeting_date= SqlString.escape(obj["pre_bid_meeting_date"])
    let  pre_bid_meeting_add= SqlString.escape(obj["pre_bid_meeting_add"])
    let  method_of_selection= SqlString.escape(obj["method_of_selection"])
    let  opening_bid_place= SqlString.escape(obj["opening_bid_place"])
    let  sale_start_date= SqlString.escape(obj["sale_start_date"])
    let  publish_date= SqlString.escape(obj["publish_date"])
    let  clarificaion_start_date= SqlString.escape(obj["clarificaion_start_date"])
    let  bid_opening_date= SqlString.escape(obj["bid_opening_date"])
    let  sale_end_date= SqlString.escape(obj["sale_end_date"])
    let tender_doc_data= SqlString.escape(obj["tender_doc_data"])
    let tender_inviting_auth_name= SqlString.escape(obj["tender_inviting_auth_name"])
    let  tender_inviting_auth_designation= SqlString.escape(obj["tender_inviting_auth_designation"])
    let  tender_inviting_auth_contact_details= SqlString.escape(obj["tender_inviting_auth_contact_details"])
    let  tender_inviting_auth_department= SqlString.escape(obj["tender_inviting_auth_department"])
    let  corr_data= SqlString.escape(obj["corr_data"])
    let   tender_status= SqlString.escape(obj["tender_status"])
    let   status= SqlString.escape(obj["status"])

    let is_mul_curr_allowed_for_boq= SqlString.escape(obj["is_mul_curr_allowed_for_boq"])
    let is_mul_curr_allowed= SqlString.escape(obj["is_mul_curr_allowed"])

    let tender_sub_category= SqlString.escape(obj["tender_sub_category"])
    let loa_document_id= SqlString.escape(obj["loa_document_id"])
    let agreement_doc_id= SqlString.escape(obj["agreement_doc_id"])
    let blacklist_doc_id= SqlString.escape(obj["blacklist_doc_id"])
    let completion_cert_document_id= SqlString.escape(obj["completion_cert_document_id"])
    let extension= SqlString.escape(obj["extension"])
    let  escalation= SqlString.escape(obj["escalation"])
    let  deviation= SqlString.escape(obj["deviation"])



    let sql_insert = "INSERT INTO " + db + ".tender (status,org_chain,est_id,num_of_cover,form_of_contract,tender_type,evaluation_allowed,evaluation_allowed_data,"
          + " tender_category,payment_mode,gen_tech_evaluation_allowed,emb,tender_fee,allowed_two_stage_bidding,cover_data,"
          + " payment_instrument_data,tender_name,tender_desc,est_bud,work_period_type,work_period,location,bid_validity,"
          + " pre_bid_meeting_date,	pre_bid_meeting_add,method_of_selection,opening_bid_place,sale_start_date,publish_date,"
          + " clarificaion_start_date,bid_opening_date,sale_end_date,tender_doc_data,tender_inviting_auth_name,"
          + " tender_inviting_auth_designation,tender_inviting_auth_contact_details,tender_inviting_auth_department,corr_data,"
          + " create_user_id,create_timestamp,tender_status,is_mul_curr_allowed_for_boq,is_mul_curr_allowed,tender_sub_category,loa_document_id,agreement_doc_id,blacklist_doc_id,"
          +"completion_cert_document_id,extension,escalation,deviation) values "
        + " (" +status+","+ org_chain+","+est_id+","+num_of_cover+","+form_of_contract+","+tender_type+","+evaluation_allowed+","+evaluation_allowed_data+","
       + tender_category+","+payment_mode+","+gen_tech_evaluation_allowed+","+emb+","+tender_fee+","+allowed_two_stage_bidding+","+cover_data
       +","+payment_instrument_data+","+tender_name+","+tender_desc+","+est_bud+","+work_period_type+","+work_period+","+location+","+bid_validity
       +","+ pre_bid_meeting_date+","+	pre_bid_meeting_add+","+method_of_selection+","+opening_bid_place+","+sale_start_date+","+publish_date
       +","+clarificaion_start_date+","+bid_opening_date+","+sale_end_date+","+tender_doc_data+","+tender_inviting_auth_name
       +","+tender_inviting_auth_designation+","+tender_inviting_auth_contact_details+","+tender_inviting_auth_department+","+corr_data
       +","+create_user_id+","+create_timestamp+","+tender_status+","+is_mul_curr_allowed_for_boq+","+is_mul_curr_allowed+","+tender_sub_category+","
       +loa_document_id+","+agreement_doc_id+","+blacklist_doc_id+","
       +completion_cert_document_id+","+extension+","+escalation+","+deviation+")"

    mysqlPool.query(sql_insert, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tender-->createtender", error2)
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

router.get('/gettenders:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql_fetch = "select status,svayam_tender_id,org_chain,est_id,num_of_cover,form_of_contract,tender_type,evaluation_allowed,evaluation_allowed_data,"
        + "  tender_category,payment_mode,gen_tech_evaluation_allowed,emb,tender_fee,allowed_two_stage_bidding,cover_data,"
        + " payment_instrument_data,tender_name,tender_desc,est_bud,work_period_type,work_period,location,bid_validity,"
        + "DATE_FORMAT( pre_bid_meeting_date,'%Y-%m-%d') as pre_bid_meeting_date,pre_bid_meeting_add,method_of_selection,opening_bid_place,"
        + "DATE_FORMAT( sale_start_date,'%Y-%m-%d') as sale_start_date,DATE_FORMAT( publish_date,'%Y-%m-%d') as publish_date,"
        + " DATE_FORMAT( clarificaion_start_date,'%Y-%m-%d') as clarificaion_start_date,DATE_FORMAT( bid_opening_date,'%Y-%m-%d') as bid_opening_date,"
        + "DATE_FORMAT( sale_end_date,'%Y-%m-%d') as sale_end_date,tender_doc_data,tender_inviting_auth_name,"
        + " tender_inviting_auth_designation,tender_inviting_auth_contact_details,tender_inviting_auth_department,corr_data,"
        + " create_user_id,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,"
        + "update_user_id,tender_status,is_mul_curr_allowed_for_boq,is_mul_curr_allowed,tender_sub_category,loa_document_id,agreement_doc_id,blacklist_doc_id,"
        +"completion_cert_document_id,extension,escalation,deviation"
        + " FROM " + db + ".tender"
        let flag = false

    if (obj['tender_status'] != undefined) {
        sql_fetch += " where tender_status=" + SqlString.escape(obj['tender_status'])
        flag = true

    }

    if (obj["est_id"] != undefined) {
        if (flag == true) {
            sql_fetch += " and est_id=" + SqlString.escape(obj["est_id"])

        } else {
            sql_fetch += " where est_id=" + SqlString.escape(obj["est_id"])

        }

    }

    mysqlPool.query(sql_fetch, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tender-->gettenders", error2)
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


router.put('/updatetenderStatus', (req, res) => {
    let objectToSend = {}
    let obj = req.body


    let svayam_tender_id = SqlString.escape(obj["svayam_tender_id"])
    let b_acct_id = obj["b_acct_id"]
   
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
   let tender_status= SqlString.escape(obj["tender_status"])
   
    let db = "svayam_" + b_acct_id + "_eng"

    let sql_upd = "update " + db + ".tender set update_user_id="+update_user_id+",update_timestamp="+update_timestamp+",tender_status="+tender_status
      + " where svayam_tender_id=" + svayam_tender_id

    mysqlPool.query(sql_upd, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tender-->updatetenderStatus", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "tender status updated Successfully"
            res.send(objectToSend)
        }

    })

})




router.put('/updatetender', (req, res) => {
    let objectToSend = {}
    let obj = req.body


    let svayam_tender_id = SqlString.escape(obj["svayam_tender_id"])
    let b_acct_id = obj["b_acct_id"]
   
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let org_chain= SqlString.escape(obj["org_chain"])
    let  est_id= SqlString.escape(obj["est_id"])
    let  num_of_cover= SqlString.escape(obj["num_of_cover"])
    let   form_of_contract= SqlString.escape(obj["form_of_contract"])
    let   tender_type= SqlString.escape(obj["tender_type"])
    let   evaluation_allowed= SqlString.escape(obj["evaluation_allowed"])
    let   evaluation_allowed_data= SqlString.escape(obj["evaluation_allowed_data"])
    let   tender_category= SqlString.escape(obj["tender_category"])
    let   payment_mode= SqlString.escape(obj["payment_mode"])
    let   gen_tech_evaluation_allowed= SqlString.escape(obj["gen_tech_evaluation_allowed"])
    let   emb= SqlString.escape(obj["emb"])
    let   tender_fee= SqlString.escape(obj["tender_fee"])
    let   allowed_two_stage_bidding= SqlString.escape(obj["allowed_two_stage_bidding"])
    let   cover_data= SqlString.escape(obj["cover_data"])
    let   payment_instrument_data= SqlString.escape(obj["payment_instrument_data"])
    let    tender_name= SqlString.escape(obj["tender_name"])
    let   tender_desc= SqlString.escape(obj["tender_desc"])
    let    est_bud= SqlString.escape(obj["est_bud"])
    let    work_period_type= SqlString.escape(obj["work_period_type"])
    let    work_period= SqlString.escape(obj["work_period"])
    let    location= SqlString.escape(obj["location"])
    let    bid_validity= SqlString.escape(obj["bid_validity"])
    let  pre_bid_meeting_date= SqlString.escape(obj["pre_bid_meeting_date"])
    let  pre_bid_meeting_add= SqlString.escape(obj["pre_bid_meeting_add"])
    let  method_of_selection= SqlString.escape(obj["method_of_selection"])
    let  opening_bid_place= SqlString.escape(obj["opening_bid_place"])
    let  sale_start_date= SqlString.escape(obj["sale_start_date"])
    let  publish_date= SqlString.escape(obj["publish_date"])
    let  clarificaion_start_date= SqlString.escape(obj["clarificaion_start_date"])
    let  bid_opening_date= SqlString.escape(obj["bid_opening_date"])
    let  sale_end_date= SqlString.escape(obj["sale_end_date"])
    let tender_doc_data= SqlString.escape(obj["tender_doc_data"])
    let tender_inviting_auth_name= SqlString.escape(obj["tender_inviting_auth_name"])
    let  tender_inviting_auth_designation= SqlString.escape(obj["tender_inviting_auth_designation"])
    let  tender_inviting_auth_contact_details= SqlString.escape(obj["tender_inviting_auth_contact_details"])
    let  tender_inviting_auth_department= SqlString.escape(obj["tender_inviting_auth_department"])
    let  corr_data= SqlString.escape(obj["corr_data"])
    let   tender_status= SqlString.escape(obj["tender_status"])
    let is_mul_curr_allowed_for_boq= SqlString.escape(obj["is_mul_curr_allowed_for_boq"])
    let is_mul_curr_allowed= SqlString.escape(obj["is_mul_curr_allowed"])
    let   status= SqlString.escape(obj["status"])

   
    let tender_sub_category= SqlString.escape(obj["tender_sub_category"])
    let loa_document_id= SqlString.escape(obj["loa_document_id"])
    let agreement_doc_id= SqlString.escape(obj["agreement_doc_id"])
    let blacklist_doc_id= SqlString.escape(obj["blacklist_doc_id"])
    let completion_cert_document_id= SqlString.escape(obj["completion_cert_document_id"])
    let extension= SqlString.escape(obj["extension"])
    let  escalation= SqlString.escape(obj["escalation"])
    let  deviation= SqlString.escape(obj["deviation"])
    let db = "svayam_" + b_acct_id + "_eng"

    let sql_upd = "update " + db + ".tender set status="+status+",org_chain=" + org_chain+",est_id="+est_id+",num_of_cover="+num_of_cover
    +",form_of_contract="+form_of_contract+",tender_type="+tender_type+",evaluation_allowed="+evaluation_allowed+",evaluation_allowed_data="+evaluation_allowed_data+","
    + " tender_category="+ tender_category+",payment_mode="+payment_mode+",gen_tech_evaluation_allowed="+gen_tech_evaluation_allowed+",emb="+emb
    +",tender_fee="+tender_fee+",allowed_two_stage_bidding="+allowed_two_stage_bidding+",cover_data="+cover_data+","
    + " payment_instrument_data="+payment_instrument_data+",tender_name="+tender_name+",tender_desc="+tender_desc+",est_bud="+est_bud
    +",work_period_type="+work_period_type+",work_period="+work_period+",location="+location+",bid_validity="+bid_validity+","
    + " pre_bid_meeting_date="+ pre_bid_meeting_date+",	pre_bid_meeting_add="+	pre_bid_meeting_add+",method_of_selection="+method_of_selection
    +",opening_bid_place="+opening_bid_place+",sale_start_date="+sale_start_date+",publish_date="+publish_date+","
    + " clarificaion_start_date="+clarificaion_start_date+",bid_opening_date="+bid_opening_date+",sale_end_date="+sale_end_date
    +",tender_doc_data="+tender_doc_data+",tender_inviting_auth_name="+tender_inviting_auth_name+","
    + " tender_inviting_auth_designation="+tender_inviting_auth_designation+",tender_inviting_auth_contact_details="+tender_inviting_auth_contact_details
    +",tender_inviting_auth_department="+tender_inviting_auth_department+",corr_data="+corr_data+","
    + " update_user_id="+update_user_id+",update_timestamp="+update_timestamp+",tender_status="+tender_status
    +",is_mul_curr_allowed_for_boq="+is_mul_curr_allowed_for_boq+",is_mul_curr_allowed="+is_mul_curr_allowed
    +",tender_sub_category="+tender_sub_category+",loa_document_id="+loa_document_id+",agreement_doc_id="+agreement_doc_id+",blacklist_doc_id="+blacklist_doc_id+","
          +"completion_cert_document_id="+completion_cert_document_id+",extension="+extension+",escalation="+escalation+",deviation="+deviation
      + " where svayam_tender_id=" + svayam_tender_id

    mysqlPool.query(sql_upd, function (error2, results) {
        if (error2) {
            console.log("Error-->routes-->eng-->tender-->updatetender", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)

        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "tender updated Successfully"
            res.send(objectToSend)
        }

    })

})




router.delete('/deletetender:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)


    let svayam_tender_id = SqlString.escape(obj["svayam_tender_id"])
    let doc_id = obj["doc_id"]
    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_eng"

    let sql = "delete from " + db + ".tender  where svayam_tender_id=" + svayam_tender_id

    let sql_delete = "delete from " + db + ".upload_document where id in (" + doc_id.join(",") + ")"

    if(doc_id.length>0){
        sql=sql+";"+sql_delete
    }

    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->tender-->deletetender", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->tender-->deletetender", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql , function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->tender-->deletetender", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->eng-->tender-->deletetender", error3);
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


module.exports = router;
