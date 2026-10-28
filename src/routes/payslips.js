import {Router} from 'express'
import {z} from 'zod'
import Payslip from '../models/Payslip.js'
import User from '../models/User.js'
import {requireAuth,requireRole} from '../middleware/auth.js'
import {validate} from '../middleware/validate.js'
const router=Router()
router.use(requireAuth)
router.get('/',async(req,res)=>{
 const admin=['Admin','HR Manager'].includes(req.user.role)
 const docs=await Payslip.find(admin?{}:{employeeId:req.user._id}).populate('employeeId','name email').sort({month:-1,createdAt:-1}).lean()
 res.json({payslips:docs.map(p=>({_id:p._id,month:p.month,title:p.title,fileName:p.fileName,mimeType:p.mimeType,data:p.data,employeeName:p.employeeId?.name}))})
})
const schema=z.object({
 employeeId:z.string().min(1),month:z.string().regex(/^\d{4}-\d{2}$/),title:z.string().trim().max(120).optional().default('Salary payslip'),
 fileName:z.string().trim().min(1).max(180),mimeType:z.enum(['application/pdf','image/png','image/jpeg','image/webp']),
 data:z.string().min(20).max(7_000_000)
})
router.post('/',requireRole('Admin','HR Manager'),validate(schema),async(req,res)=>{
 const employee=await User.findOne({_id:req.body.employeeId,role:'Employee'})
 if(!employee)return res.status(404).json({message:'Employee not found'})
 const expected=`data:${req.body.mimeType};base64,`
 if(!req.body.data.startsWith(expected))return res.status(400).json({message:'File data does not match its type'})
 const p=await Payslip.create({...req.body,employeeId:employee._id,uploadedBy:req.user._id})
 res.status(201).json({payslip:{_id:p._id,month:p.month,title:p.title,fileName:p.fileName}})
})
export default router
