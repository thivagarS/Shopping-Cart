const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { isAuthenticated,isLoggedIn } = require('../middleware/auth');

router.get('/login', isLoggedIn, authController.getLogin);

router.post('/login', isLoggedIn, authController.postLogin);

router.post('/logout', isAuthenticated, authController.postLogout);

router.post('/signup', isLoggedIn, authController.postSignUp);

router.get('/signup', isLoggedIn, authController.getSignUp);

router.get('/verification/:tokenId', authController.getVerificationToken);

router.get('/reset', authController.getResetPassword);

router.post('/reset', authController.postResetPassword);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;