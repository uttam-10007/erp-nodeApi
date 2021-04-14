var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.post('/changepin',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let new_pin=obj["new_pin"]
    let emp_id=obj["emp_id"]
    let old_pin=obj["old_pin"]
 
    


    let sql="update svayam_"+b_acct_id+"_hr.emp_personal_info set pin="+SqlString.escape(new_pin)
            +" where pin="+SqlString.escape(old_pin)+" and emp_id = "+SqlString.escape(emp_id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->changepin", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " Changed Successfully"
            res.send(objectToSend);
        }
    })
})


router.put('/updateEmployeePersonalInfo',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_name=SqlString.escape(obj["emp_name"])
    let emp_email=SqlString.escape(obj["emp_email"])
    let emp_phone_no=SqlString.escape(obj["emp_phone_no"])
    let emp_dob=SqlString.escape(obj["emp_dob"])
    let emp_father_name=SqlString.escape(obj["emp_father_name"])
    let emp_permanent_addr_line1=SqlString.escape(obj["emp_permanent_addr_line1"])
    let emp_permanent_addr_line2=SqlString.escape(obj["emp_permanent_addr_line2"])
    let emp_permanent_addr_city=SqlString.escape(obj["emp_permanent_addr_city"])
    let emp_permanent_addr_state=SqlString.escape(obj["emp_permanent_addr_state"])
    let emp_permanent_addr_dist=SqlString.escape(obj["emp_permanent_addr_dist"])
    let emp_permanent_addr_pin_code=SqlString.escape(obj["emp_permanent_addr_pin_code"])
    let emp_local_addr_line1=SqlString.escape(obj["emp_local_addr_line1"])
    let emp_local_addr_line2=SqlString.escape(obj["emp_local_addr_line2"])
    let emp_local_addr_city=SqlString.escape(obj["emp_local_addr_city"])
    let emp_local_addr_dist=SqlString.escape(obj["emp_local_addr_dist"])
    let emp_local_addr_state=SqlString.escape(obj["emp_local_addr_state"])
    let emp_local_addr_pin_code=SqlString.escape(obj["emp_local_addr_pin_code"])
    let emp_pan_no=SqlString.escape(obj["emp_pan_no"])
    let emp_adhar_no=SqlString.escape(obj["emp_adhar_no"])
    let emp_gst_no=SqlString.escape(obj["emp_gst_no"])
    let emp_sex=SqlString.escape(obj["emp_sex"])
    let bank_code=SqlString.escape(obj["bank_code"])
    let branch_code=SqlString.escape(obj["branch_code"])
    let ifsc_code=SqlString.escape(obj["ifsc_code"])
    let acct_no=SqlString.escape(obj["acct_no"])
    let pf_acct_no=SqlString.escape(obj["pf_acct_no"])
    let identification_mark=SqlString.escape(obj["identification_mark"])
    let gis_no=SqlString.escape(obj["gis_no"])
    let nps_no=SqlString.escape(obj["nps_no"])
    let reservation_category_code=SqlString.escape(obj["reservation_category_code"])
    let marital_status=SqlString.escape(obj["marital_status"])
    let emp_husband_name=SqlString.escape(obj["emp_husband_name"])
    let emp_religeon=SqlString.escape(obj["emp_religeon"])
    let emp_mother_name=SqlString.escape(obj["emp_mother_name"])
    let emp_nationality=SqlString.escape(obj["emp_nationality"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let emp_id=SqlString.escape(obj["emp_id"])
    let emp_cat_code=SqlString.escape(obj["emp_cat_code"])
 let pf_type=SqlString.escape(obj["pf_type"])
    let pf_ifsc_code=SqlString.escape(obj["pf_ifsc_code"])    

    let sql="update svayam_"+b_acct_id+"_hr.emp_personal_info set emp_name="+emp_name+",emp_email="+emp_email+",emp_phone_no="+emp_phone_no+","
            +"  emp_dob="+emp_dob+","+"  emp_father_name="+emp_father_name+","+"  emp_permanent_addr_line1="+emp_permanent_addr_line1+","
            +"  emp_permanent_addr_line2="+emp_permanent_addr_line2+","+"  emp_permanent_addr_city="+emp_permanent_addr_city+","
            +"  emp_permanent_addr_dist="+emp_permanent_addr_dist+","+"  emp_permanent_addr_state="+emp_permanent_addr_state+","
            +"  emp_permanent_addr_pin_code="+emp_permanent_addr_pin_code+","+"  emp_local_addr_line1="+emp_local_addr_line1+","
            +"  emp_local_addr_line2="+emp_local_addr_line2+","+"  emp_local_addr_city="+emp_local_addr_city+","+" emp_local_addr_dist="+emp_local_addr_dist+","
            +"  emp_local_addr_state="+emp_local_addr_state+","+"  emp_local_addr_pin_code="+emp_local_addr_pin_code+","
            +"  emp_pan_no="+emp_pan_no+","+"  emp_adhar_no="+emp_adhar_no+","+"  emp_gst_no="+emp_gst_no+","+"  update_user_id="+update_user_id+","
            +"  bank_code="+bank_code+","+"  branch_code="+branch_code+","+"  ifsc_code="+ifsc_code+","+"  acct_no="+acct_no+","
            +"  pf_acct_no="+pf_acct_no+","+"  identification_mark="+identification_mark+","+"  gis_no="+gis_no+","+"  nps_no="+nps_no+","
            +"  reservation_category_code="+reservation_category_code+","+"  marital_status="+marital_status+","+"  emp_husband_name="+emp_husband_name+","+"  emp_religeon="+emp_religeon+","
            +"  emp_nationality="+emp_nationality+","+"  emp_mother_name="+emp_mother_name+","
            +" update_timestamp="+update_timestamp+",emp_sex="+emp_sex+",pf_type="+pf_type+",pf_ifsc_code="+pf_ifsc_code+",emp_cat_code = "+emp_cat_code+"  where emp_id="+emp_id

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->updateEmployeePersonalInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Information updated successfully" 
            res.send(objectToSend);
        }
    })
})


router.get('/getPersonalInfo:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"];
    let emp_id=obj["emp_id"]

    let sql="Select pin,emp_cat_code,emp_id,emp_name,emp_email,DATE_FORMAT(emp_dob,'%Y-%m-%d') as emp_dob,emp_father_name,emp_phone_no,"
    +"emp_permanent_addr_line1,emp_permanent_addr_line2,emp_permanent_addr_city,emp_permanent_addr_dist,emp_permanent_addr_state,emp_permanent_addr_pin_code,emp_local_addr_line1"
    +",emp_local_addr_line2,emp_local_addr_city,emp_local_addr_dist,emp_local_addr_state,emp_local_addr_pin_code,emp_pan_no,emp_adhar_no,emp_gst_no,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp,pf_type,pf_ifsc_code"
    +",emp_sex,bank_code,branch_code,ifsc_code,acct_no,pf_acct_no,identification_mark,gis_no,nps_no,reservation_category_code,marital_status,emp_husband_name,emp_religeon,emp_nationality,emp_mother_name from svayam_"+b_acct_id+"_hr.emp_personal_info where emp_id="+SqlString.escape(emp_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->getPersonalInfo", error)
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
router.get('/getUserInfo:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"];
    let emp_id=obj["emp_id"]

    let sql="Select *  from svayam_"+b_acct_id+"_hr.emp_personal_info ep join svayam_"+b_acct_id+"_hr.establishment_info es on es.emp_id=ep.emp_id  where emp_phone_no="+SqlString.escape(obj.phone_no)+" or emp_email="+SqlString.escape(obj.email)
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->getPersonalInfo", error)
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

router.get('/getAllEmployee:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"];
    let emp_id=obj["emp_id"]

    let sql="Select emp_cat_code,emp_id,emp_name,emp_email,DATE_FORMAT(emp_dob,'%Y-%m-%d') as emp_dob,emp_father_name,emp_phone_no,"
    +"emp_permanent_addr_line1,emp_permanent_addr_line2,emp_permanent_addr_city,emp_permanent_addr_dist,emp_permanent_addr_state,emp_permanent_addr_pin_code,emp_local_addr_line1"
    +",emp_local_addr_line2,emp_local_addr_city,emp_local_addr_dist,emp_local_addr_state,emp_local_addr_pin_code,emp_pan_no,emp_adhar_no,emp_gst_no,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp,pf_type,pf_ifsc_code"
    +",emp_sex,bank_code,branch_code,ifsc_code,acct_no,pf_acct_no,identification_mark,gis_no,nps_no,reservation_category_code,marital_status,emp_husband_name,emp_religeon,emp_nationality,emp_mother_name from svayam_"+b_acct_id+"_hr.emp_personal_info"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->getPersonalInfo", error)
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


router.put('/updatedob', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_hr";
    let emp_dob=SqlString.escape(obj["emp_dob"])
    let emp_id=SqlString.escape(obj["emp_id"])
  
  
    let query = "update " + db + ".emp_personal_info set emp_dob=" + emp_dob + " where emp_id=" + emp_id
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->updatedob", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->updatedob", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(query, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->updatedob", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            let retirement_date = SqlString.escape(obj["retirement_date"])
                            let sql_insert3 = "update " + db + ".establishment_info set retirement_date=" + retirement_date + " where emp_id=" + emp_id


                            mysqlCon.query(sql_insert3, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->updatedob", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }
                                else {


                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->hr-->employee-->employeepersonalInfo-->updatedob", error2)
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
