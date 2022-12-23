import { Router } from "express";
import { signIn,signUp,usersMe,logoutUser } from "../controllers/users.controller.js";
import { signInValidation,signUpValidation,usersMeValidation } from "../middlewares/usersValidationMiddleware.js";
const router = Router()

router.post('/signup',signUpValidation,signUp)
router.post('/signin',signInValidation,signIn)
router.get('/users/me',usersMeValidation,usersMe)
router.delete('/logout',logoutUser )

export default router
