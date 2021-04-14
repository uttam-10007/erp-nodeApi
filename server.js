var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

const https = require('https');
const fs = require('fs');

const options = {
 key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem')
};

// var pkey = fs.readFileSync('/etc/letsencrypt/live/ldaemb.svayamtech.com/privkey.pem'),
//     pcert = fs.readFileSync('/etc/letsencrypt/live/ldaemb.svayamtech.com/cert.pem'),
//     ca = fs.readFileSync('/etc/letsencrypt/live/ldaemb.svayamtech.com/chain.pem'),
//     options = {ca : ca, key: pkey, cert: pcert};




//start body-parser configuration
app.use(bodyParser.json({ limit: '50mb' }));
// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


app.use(cors());
app.options('*', cors());
app.use(function (req, res, next) {
    //set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}) ; 


/////////////////
//Portal Requests
var signup = require('./routes/portal/signup.js');
app.use('/portal',signup);

var login = require('./routes/portal/login.js');
app.use('/portal',login);

var profile = require('./routes/portal/profile.js');
app.use('/portal',profile);

var products = require('./routes/portal/products.js')
app.use('/portal',products)

var accountInfo = require('./routes/portal/accountInfo.js')
app.use('/portal',accountInfo)
 


////////////////
//Metadata Requests
var upload = require('./routes/metadata/upload.js');
app.use('/upload',upload);


var metadata = require('./routes/metadata/fpem/balanceFiles.js');
app.use('/metadata/fpem/balanceFiles',metadata);

var extension = require('./routes/metadata/fpem/extensions.js');
app.use('/metadata/fpem/extensions',extension);

var ledgerFile = require('./routes/metadata/fpem/ledgerFiles.js');
app.use('/metadata/fpem/ledgerFiles',ledgerFile);

var fpemEventLayouts = require('./routes/metadata/fpem/fpemEventLayouts.js');
app.use('/metadata/fpem/eventLayouts',fpemEventLayouts);

var dtype = require('./routes/metadata/datatypes.js');
app.use('/metadata/datatypes',dtype);

var fields = require('./routes/metadata/fields.js');
app.use('/metadata/fields',fields);

var process = require('./routes/metadata/process.js');
app.use('/metadata/process',process);

var domain = require('./routes/metadata/domain.js');
app.use('/metadata/domain',domain);

var fpem_ref_data = require('./routes/metadata/fpem/referenceData/referenceRecords.js');
app.use('/metadata/fpem/referenceData',fpem_ref_data);

var source_ref_data = require('./routes/metadata/sourceRecords/sourceReferenceRecords.js');
app.use('/metadata/source/referenceData',source_ref_data);

var codeValue = require('./routes/metadata/codevalue.js');
app.use('/metadata/codeValue',codeValue);

var calc=require('./routes/metadata/calculation/calculation.js')
app.use('/metadata/calculation',calc)


var approval = require('./routes/metadata/approval.js');
app.use('/approval',approval);

var sysRecords = require('./routes/metadata/records.js');
app.use('/metadata/records',sysRecords);

var eventlayout = require('./routes/metadata/eventlayout.js');
app.use('/metadata/eventlayout',eventlayout);

var sysAtt = require('./routes/metadata/systemAttributes.js');
app.use('/metadata/sysAttribute',sysAtt);

var bussTerms = require('./routes/metadata/buss_terms.js');
app.use('/metadata/bussTerms',bussTerms);



////////////////
//FPEM Requests
// var lookup = require('./routes/fpem/RulesEngine/lookup.js')
// app.use('/lookup',lookup)
// var rules = require('./routes/fpem/RulesEngine/rules.js')
// app.use('/rules',rules)
// var processing = require('./routes/fpem/processing/processing.js')
// app.use('/processing',processing)
// var Dataingestion = require('./routes/fpem/Dataingestion.js')
// app.use('/Dataingestion',Dataingestion)
// var home = require('./routes/fpem/home/home.js')
// app.use('/home',home)
// var accountingPeriod = require('./routes/fpem/controls/accountingPeriod.js')
// app.use('/accountingPeriod',accountingPeriod)
// var activityDashboard = require('./routes/fpem/controls/activityDashboard.js')
// app.use('/activityDashboard',activityDashboard)
// var manualAdjustments = require('./routes/fpem/manualAdjustments/manualAdjustments.js')
// app.use('/manualAdjustments',manualAdjustments)
// var financial = require('./routes/fpem/financial/common_report.js')
// app.use('/financial',financial) 
// var reference = require('./routes/fpem/referenceData/referenceInfo.js')
// app.use('/reference',reference) 
// var settings = require('./routes/fpem/settings.js')
// app.use('/fpem',settings)
// var evInfo = require('./routes/fpem/events/eventsInfo.js')
// app.use('/fpem/events/',evInfo)
// var evRecords = require('./routes/fpem/events/eventsRecords.js')
// app.use('/fpem/events/eventRecords',evRecords)


///////////////
//ACCOUNT Requests
var cb = require('./routes/account/contingentBill.js')
app.use('/accounts/contingentBill',cb)
var invoice = require('./routes/account/invoice.js')
app.use('/accounts/invoice',invoice)
var ac_flds = require('./routes/account/settings/fields.js')
app.use('/accounts/settings/fields',ac_flds)
var ac_code_value = require('./routes/account/settings/codeValue.js')
app.use('/accounts/settings/codeValue',ac_code_value)
var ac_info = require('./routes/account/settings/accounts-info.js')
app.use('/accounts/settings/accountInfo',ac_info)
var event = require('./routes/account/event.js')
app.use('/account/event',event)
var contra = require('./routes/account/contra.js')
app.use('/account/contra',contra)
var demand = require('./routes/account/demand.js')
app.use('/account/demand',demand)
var ac_party = require('./routes/account/party.js')
app.use('/accounts/party',ac_party)
var ac_bank = require('./routes/account/bankAccount.js')
app.use('/accounts/bankAccount',ac_bank)
var ac_budget = require('./routes/account/budget.js')
app.use('/accounts/budget',ac_budget)
var challan = require('./routes/account/challan.js')
app.use('/accounts/challan',challan)
var hierarchy = require('./routes/account/hierarchy.js')
app.use('/accounts/hierarchy',hierarchy);
var gst = require('./routes/account/settings/gst.js')
app.use('/account/setting/gst',gst)
var generic_cb = require('./routes/account/generic_cb.js')
app.use('/account/genericcb',generic_cb)
var ip = require('./routes/account/ip.js')
app.use('/account/ip',ip)
var jrnl = require('./routes/account/jrnl.js')
app.use('/account/journal',jrnl)
var tdsmapping = require('./routes/account/tds_mapping.js')
app.use('/account/tdsmapping',tdsmapping)


var coaRelation = require('./routes/account/chart_of_account_relation.js')
app.use('/accounts/relation',coaRelation);



var work = require('./routes/account/work.js')
app.use('/accounts/work',work);
//ledger
var ac_report= require('./routes/account/report.js')
app.use('/accounts/report',ac_report)
var ac_journal = require('./routes/account/journal.js')
app.use('/accounts/journal',ac_journal)
var ac_rule = require('./routes/account/rule.js')
app.use('/accounts/rule',ac_rule)
var acc_chart_of_account = require('./routes/account/chart_of_account.js')
app.use('/accounts/chartofaccount',acc_chart_of_account)
var dash = require('./routes/account/dashboard.js')
app.use('/accounts/dashboard',dash);

var projectXrefBank = require('./routes/account/projectXrefBank.js')
app.use('/accounts/projectBank',projectXrefBank);

var bp = require('./routes/account/bp.js')

app.use('/accounts/bp',bp);

var jv = require('./routes/account/jv.js')
app.use('/accounts/jv',jv);


///////////////
//HR Requests
var pensioncontribution = require('./routes/hr/setting/pension_contribution.js')
app.use('/hr/setting/pensioncontribution',pensioncontribution)
var arrear=require('./routes/hr/payroll_info/arrear.js')
app.use('/hr/payroll_info/arrear',arrear)
var uploadfile = require('./routes/hr/establishment_info/uploadfile.js')
app.use('/hr/establishment_info/uploadfile',uploadfile)
var notice = require('./routes/hr/setting/notice.js')
app.use('/hr/setting/notice',notice)
var joining = require('./routes/hr/establishment_info/joining.js')
app.use('/hr/establishment_info/joining',joining)
app.use('/api', require('./routes/hr/imageRoute'));
var notice_period = require('./routes/hr/establishment_info/noticePeriod.js')
app.use('/hr/establishment_info/noticePeriod',notice_period)

var attendance = require('./routes/hr/establishment_info/attendance.js')
app.use('/hr/establishment_info/attendance',attendance)

var bankAcct = require('./routes/hr/emp_info/bankAccountInfo.js')
app.use('/hr/emp_info/bankAccount',bankAcct)

var complaint = require('./routes/hr/establishment_info/complaint.js')
app.use('/hr/establishment_info/complaint',complaint) 

var depInfo = require('./routes/hr/emp_info/dependentInfo.js')
app.use('/hr/emp_info/dependent',depInfo)

var edu = require('./routes/hr/emp_info/education.js')
app.use('/hr/emp_info/education',edu)

var enq = require('./routes/hr/establishment_info/enquiry.js')
app.use('/hr/establishment_info/enquiry',enq)

var nom = require('./routes/hr/emp_info/nominee.js')
app.use('/hr/emp_info/nominee',nom)


var personal = require('./routes/hr/emp_info/employeePersonalInfo.js')
app.use('/hr/emp_info/empInfo',personal)

var licInfo = require('./routes/hr/emp_info/lic.js')
app.use('/hr/emp_info/lic',licInfo)

var promotion = require('./routes/hr/establishment_info/promotion.js')
app.use('/hr/establishment_info/promotion',promotion)

var probation = require('./routes/hr/establishment_info/probation.js')
app.use('/hr/establishment_info/probation',probation)

var suspension = require('./routes/hr/establishment_info/suspension.js')
app.use('/hr/establishment_info/suspension',suspension)

var establishment=require('./routes/hr/establishment_info/establishment.js')
app.use('/hr/establishment',establishment)

var post=require('./routes/hr/establishment_info/post.js')
app.use('/hr/establishment_info/post',post)

var leave=require('./routes/hr/establishment_info/leave.js')
app.use('/hr/establishment_info/leave',leave)

var leave_rec=require('./routes/hr/establishment_info/leaveRecord.js')
app.use('/hr/establishment_info/leaveRecord',leave_rec)

var loan=require('./routes/hr/payroll_info/loan.js')
app.use('/hr/payroll_info/loan',loan)

var terminate=require('./routes/hr/establishment_info/termination.js')
app.use('/hr/establishment_info/termination',terminate)

var transfer=require('./routes/hr/establishment_info/transfer.js')
app.use('/hr/establishment_info/transfer',transfer)

var retiremnet=require('./routes/hr/establishment_info/retirement.js')
app.use('/hr/establishment_info/retirement',retiremnet)

var section=require('./routes/hr/establishment_info/section.js')
app.use('/hr/establishment_info/section',section)

var resignation=require('./routes/hr/establishment_info/resignation.js')
app.use('/hr/establishment_info/resignation',resignation)

var death=require('./routes/hr/establishment_info/death.js')
app.use('/hr/establishment_info/death',death)

var otherPayment=require('./routes/hr/payroll_info/otherPayments.js')
app.use('/hr/payroll_info/otherPayments',otherPayment)
var otherPayment=require('./routes/hr/payroll_info/bill.js')
app.use('/hr/payroll_info/bill',otherPayment)
var salaryCompDef=require('./routes/hr/payroll_info/salaryComponentDefinition.js')
app.use('/hr/payroll_info/salaryComponents',salaryCompDef)
var payMatrix=require('./routes/hr/payroll_info/payMatrix.js')
app.use('/hr/payroll_info/payMatrix',payMatrix)
var var_pay=require('./routes/hr/payroll_info/variablePay.js')
app.use('/hr/payroll_info/variablePay',var_pay)
var fix_pay=require('./routes/hr/payroll_info/fixedPay.js')
app.use('/hr/payroll_info/fixedPay',fix_pay)
var fix_pay_amount=require('./routes/hr/payroll_info/fixedPayAmount.js')
app.use('/hr/payroll_info/fixedPayAmount',fix_pay_amount)
var leave_encash=require('./routes/hr/payroll_info/leave_encash.js')
app.use('/hr/payroll_info/leaveencash',leave_encash)

var hrReports= require('./routes/hr/establishment_info/reports.js')
app.use('/hr/reports',hrReports)
var hrsetting = require('./routes/hr/setting/setting.js')
app.use('/hr/setting',hrsetting)
var hrleaveInfo = require('./routes/hr/setting/leave_info.js')
app.use('/hr/setting/leaveInfo',hrleaveInfo)

var leaveRule= require('./routes/hr/leave/leaveRule.js')
app.use('/hr/leaveRule',leaveRule)
var leaveInfo= require('./routes/hr/leave/leaveInfo.js')
app.use('/hr/leaveInfo',leaveInfo)
var leaveLedger= require('./routes/hr/leave/leaveLedger.js')
app.use('/hr/leaveLedger',leaveLedger)
var approval = require('./routes/hr/setting/approval.js')
app.use('/hr/setting/approval',approval)

var otherSalary = require('./routes/hr/setting/otherSalary.js')
app.use('/hr/setting/otherSalary',otherSalary)
var salaryhold=require('./routes/hr/payroll_info/salaryhold.js')
app.use('/hr/payroll_info/salaryhold',salaryhold)

////////////////
//Property requests
var scheme = require('./routes/property/scheme.js')
app.use('/property/scheme',scheme)
var subscheme = require('./routes/property/sub_scheme.js')
app.use('/property/subscheme',subscheme)
var dashboard = require('./routes/property/dashboard.js')
app.use('/property/dashboard',dashboard);
var propertyinfo = require('./routes/property/property_info.js')
app.use('/property/propertyinfo',propertyinfo)
var propertyTypeInfo = require('./routes/property/property_type_info.js')
app.use('/property/propertyTypeInfo',propertyTypeInfo)
var application = require('./routes/property/application.js')
app.use('/property/application',application)
var bookletpurchase = require('./routes/property/booklet_purchase.js')
app.use('/property/bookletpurchase',bookletpurchase)
var allotment = require('./routes/property/allotment.js')
app.use('/property/allotment',allotment)
var refund = require('./routes/property/refund.js')
app.use('/property/refund',refund)
var registry = require('./routes/property/registry.js')
app.use('/property/registry',registry)
var paryEmi=require('./routes/property/party_emi.js')
app.use('/property/partyemi',paryEmi);
var restore = require('./routes/property/restore.js')
app.use('/property/restore',restore)
var auction=require('./routes/property/auction.js')
app.use('/property/auction',auction)
/////////////
//User management requests

var user=require('./routes/userManagement/user.js')
app.use('/userManagement',user);
//////////////
////Engineering
var baseitem=require('./routes/eng/base_item.js')
app.use('/eng/baseitem',baseitem);
var batchitem=require('./routes/eng/batch_item.js')
app.use('/eng/batchitem',batchitem);
var estimate=require('./routes/eng/estimate.js')
app.use('/eng/estimate',estimate);
var unit_conversion=require('./routes/eng/unit_conversion.js')
app.use('/eng/unitconversion',unit_conversion);
var engApplication=require('./routes/eng/application.js')
app.use('/eng/application',engApplication);
var application_ref=require('./routes/eng/application_ref.js')
app.use('/eng/applicationRef',application_ref);
var engUpload=require('./routes/eng/documentUpload.js')
app.use('/eng/upload',engUpload);
var fieldmeasurement=require('./routes/eng/field_measurement.js')
app.use('/eng/fieldmeasurement',fieldmeasurement);
var tender=require('./routes/eng/tender.js')
app.use('/eng/tender',tender);
var consumption_analysis=require('./routes/eng/consumption_analysis.js')
app.use('/eng/consumptionAnalysis',consumption_analysis);
 var tenderApplication=require('./routes/eng/tendorApplication.js')
app.use('/eng/tenderApplication',tenderApplication);
var tendermechanism=require('./routes/eng/tender_mechanism.js')
app.use('/eng/tendermechanism',tendermechanism);
var importedTenders=require('./routes/eng/importedTenders.js')
app.use('/eng/importedTenders',importedTenders);
var soritem=require('./routes/eng/soritem.js')
app.use('/eng/soritem',soritem);
var selectionitem=require('./routes/eng/selection_item.js')
app.use('/eng/selectionitem',selectionitem);
var sorestimate=require('./routes/eng/sor_estimate.js')
app.use('/eng/sorestimate',sorestimate);

///////////
//Interface Requests
var fullschemes=require('./routes/Interface/property/schemes.js')
app.use('/interface/property/scheme',fullschemes);
var Interfacebooklet=require('./routes/Interface/property/booklet.js')
app.use('/interface/property/booklet',Interfacebooklet);

var apply=require('./routes/Interface/property/apply.js')
app.use('/interface/property/apply',apply);
var interfaceallotment=require('./routes/Interface/property/allotment.js')
app.use('/interface/property/allotment',interfaceallotment);
var interfaceApplication=require('./routes/Interface/property/application.js')
app.use('/interface/property/application',interfaceApplication);
var emi=require('./routes/Interface/property/emi.js')
app.use('/interface/property/emi',emi)
var auction=require('./routes/Interface/property/auction.js')
app.use('/interface/property/auction',auction)






//***************************************************************EMB************************************************************** */
var account_role_resource=require('./routes/emb/administration/account_role_resource.js')
app.use('/emb/administration/AccountRoles',account_role_resource)

var level_of_appr=require('./routes/emb/administration/level_of_appr.js')
app.use('/emb/administration/LevelOfAppr',level_of_appr)

var upload_doc=require('./routes/emb/info/upload_doc.js')
app.use('/emb/info/upload',upload_doc)

var heads=require('./routes/emb/info/heads.js')
app.use('/emb/info/head',heads)

var appr=require('./routes/emb/appr.js')
app.use('/emb/appr',appr);

var bud=require('./routes/emb/info/bud.js')
app.use('/emb/info/bud',bud)

var help_and_support=require('./routes/emb/help_and_support.js')
app.use('/emb/help',help_and_support)

var codeValue = require('./routes/emb/md/codeValue.js');
app.use('/emb/md/codeValue',codeValue);

var fields=require('./routes/emb/md/fields.js')
app.use('/emb/md/fields',fields)

var authentication=require('./routes/emb/authentication.js')
app.use('/emb/authentication',authentication)

var dashboard=require('./routes/emb/dashboard.js')
app.use('/emb/dashboard',dashboard);

var approve=require('./routes/emb/approve.js')
app.use('/emb/approve',approve);

var acct_info=require('./routes/emb/account_info.js')
app.use('/emb/accountInfo',acct_info)

var sys_data=require('./routes/system_data.js')
app.use('/emb/systemData',sys_data)

var user_profile=require('./routes/user_profile.js')
app.use('/emb/userProfile',user_profile)

var system_data=require('./routes/system_acc_data.js')
app.use('/admin/systemData',system_data)

var user=require('./routes/emb/administration/user.js')
app.use('/emb/administration/user',user)

var role=require('./routes/emb/administration/roles.js')
app.use('/emb/administration/roles',role)

var res=require('./routes/emb/administration/resource.js')
app.use('/emb/administration/resource',res)

var boq=require('./routes/emb/info/boq.js')
app.use('/emb/info/boq',boq)

var work=require('./routes/emb/info/workInfo.js')
app.use('/emb/info/work',work);

var cb=require('./routes/emb/info/cb.js')
app.use('/emb/info/cb',cb)

var ebill=require('./routes/emb/info/ebill.js')
app.use('/emb/info/ebill',ebill)

var deduction=require('./routes/info/deduction.js')
app.use('/emb/info/deduction',deduction)

var geometry=require('./routes/emb/info/geometry.js')
app.use('/emb/info/geometry',geometry)

var emb=require('./routes/emb/info/emb.js')
app.use('/emb/info/emb',emb)

var deviation=require('./routes/emb/info/deviation.js')
app.use('/emb/info/deviation',deviation)

var project=require('./routes/emb/info/projectInfo.js')
app.use('/emb/info/project',project)

var party=require('./routes/emb/info/party_info.js')
app.use('/emb/info/party',party)

var arr=require('./routes/emb/info/arr_info.js')
app.use('/emb/info/arr',arr);

var dev=require('./routes/emb/info/dev.js')
app.use('/emb/info/dev',dev);


//newsystemdata
var legalentity=require('./routes/systemdata/legalentity.js')
app.use('/systemdata/legalentity',legalentity);


// setInterval(() =>{script1.scriptfun()
//   }, 120000);

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port
  console.log("Svayam E-Bill Api listening at http://%s:%s", host, port)
});

/* var server=https.createServer(options,app).listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Svayam E-Bill Api listening at https//%s:%s", host, port)
}); */
