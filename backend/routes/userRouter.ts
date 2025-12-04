// backend/routes/userRouter.js
import express from 'express';
import {
  loginUser, registerUser, adminLogin,
  getUserProfile, updateUserProfile,
  forgotPassword, resetPassword,
  getAllUsers,
  getFavorites, toggleFavorite, getAddress, upsertAddress
} from '../controllers/userController.js';
import { userAuth } from '../middlewares/userAuth.js';

const userRouter = express.Router();

// Auth / Conta
userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);
userRouter.post('/admin', adminLogin);

// Usuários
userRouter.get('/users', getAllUsers);
userRouter.get('/profile', userAuth, getUserProfile);
userRouter.put('/update-profile', userAuth, updateUserProfile);

// Password
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);

// Favoritos
userRouter.get('/favorites', userAuth, getFavorites);
userRouter.post('/favorites/toggle', userAuth, toggleFavorite);

// Endereço
userRouter.get('/address', userAuth, getAddress);
userRouter.put('/address', userAuth, upsertAddress);

export default userRouter;
