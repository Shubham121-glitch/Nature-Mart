import { Router } from "express"
import { chat } from "../controllers/chat.controller.js"

const chatRouter = Router()

chatRouter.post("/", chat)

export default chatRouter
