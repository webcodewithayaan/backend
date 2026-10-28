import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  employeeId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  date:{type:String,required:true},
  status:{type:String,enum:['Present','Absent','Late'],required:true},
  markedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true})
schema.index({employeeId:1,date:1},{unique:true})
export default mongoose.models.Attendance || mongoose.model('Attendance',schema)
