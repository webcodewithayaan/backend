import mongoose from 'mongoose'
const schema = new mongoose.Schema({
 employeeId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 month:{type:String,required:true},
 title:{type:String,default:'Salary payslip',maxlength:120},
 fileName:{type:String,required:true,maxlength:180},
 mimeType:{type:String,enum:['application/pdf','image/png','image/jpeg','image/webp'],required:true},
 data:{type:String,required:true},
 uploadedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true})
schema.index({employeeId:1,month:1})
export default mongoose.models.Payslip || mongoose.model('Payslip',schema)
