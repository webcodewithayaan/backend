import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  companyName:{type:String,required:true,trim:true,maxlength:120},
  contactName:{type:String,required:true,trim:true,maxlength:80},
  email:{type:String,required:true,lowercase:true,trim:true},
  phone:{type:String,default:'',trim:true,maxlength:30},
  companyCode:{type:String,required:true,unique:true,uppercase:true,trim:true}
},{timestamps:true})
export default mongoose.models.Company || mongoose.model('Company',schema)
