import {Router} from 'express'
import {z} from 'zod'
import Attendance from '../models/Attendance.js'
import User from '../models/User.js'
import {requireAuth,requireRole} from '../middleware/auth.js'
import {validate} from '../middleware/validate.js'
const router=Router()
router.use(requireAuth,requireRole('HR Manager','Admin'))
router.get('/',async(req,res)=>{
 const date=String(req.query.date||new Date().toISOString().slice(0,10))
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({message:'Invalid date'})
 const records=await Attendance.find({date}).lean()
 res.json({records:records.map(r=>({...r,employeeId:String(r.employeeId)}))})
})
const schema=z.object({employeeId:z.string().min(1),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),status:z.enum(['Present','Absent','Late'])})
router.post('/',validate(schema),async(req,res)=>{
 const employee=await User.findOne({_id:req.body.employeeId,role:'Employee'})
 if(!employee)return res.status(404).json({message:'Employee not found'})
 const record=await Attendance.findOneAndUpdate({employeeId:employee._id,date:req.body.date},{$set:{status:req.body.status,markedBy:req.user._id}},{new:true,upsert:true,runValidators:true})
 res.json({record})
})
export default router
