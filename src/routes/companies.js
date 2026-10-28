import {Router} from 'express'
import {z} from 'zod'
import Company from '../models/Company.js'
import {validate} from '../middleware/validate.js'
const router=Router()
const schema=z.object({
 companyName:z.string().trim().min(2).max(120),
 contactName:z.string().trim().min(2).max(80),
 email:z.string().email().max(160),
 phone:z.string().trim().max(30).optional().default(''),
 companyCode:z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9-]+$/).optional().or(z.literal(''))
})
router.post('/register',validate(schema),async(req,res)=>{
 const code=(req.body.companyCode||`${req.body.companyName.replace(/[^a-z0-9]/gi,'').slice(0,8)}-${Math.random().toString(36).slice(2,7)}`).toUpperCase()
 const company=await Company.create({...req.body,companyCode:code})
 res.status(201).json({company:{id:company._id,companyName:company.companyName,companyCode:company.companyCode}})
})
export default router
