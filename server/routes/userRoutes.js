import express from "express";
import { auth } from "../middlewares/auth.js";
import { deleteCreation, deleteMultipleCreations, getPublishedCreations, getUserCreations, toggleLikeCreation } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPublishedCreations)
userRouter.post('/toggle-like-creations', auth, toggleLikeCreation)
userRouter.post('/delete-creation', auth, deleteCreation)
userRouter.post('/delete-multiple-creations', auth, deleteMultipleCreations)

export default userRouter;