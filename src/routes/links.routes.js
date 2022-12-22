import { Router } from "express";
import { shortUrl,getUrlById,getRanking,goToShortUrl,deleteUrl} from "../controllers/links.controller.js";
import { shortUrlValidation,urlByIdValidation,goToUrlValidation,deleteUrlValidation} from "../middlewares/linkValidationMiddleware.js";
const router = Router()

router.post('/urls/shorten',shortUrlValidation,shortUrl)
router.get('/urls/:id',urlByIdValidation,getUrlById)
router.get('/urls/open/:shortUrl',goToUrlValidation,goToShortUrl)
router.delete('/urls/:id',deleteUrlValidation,deleteUrl)
router.get('/ranking',getRanking)

export default router
