const express = require('express');

const adminController = require('../controllers/admin');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// /admin/add-product --> THis will internally converted like this .

router.get('/add-product', isAuthenticated, adminController.getAddProduct);

// /admin/product
router.post('/add-product', isAuthenticated, adminController.postAddProduct);

router.get('/products', isAuthenticated, adminController.adminProducts)

router.post('/delete-product', isAuthenticated, adminController.postDeleteProduct);

router.get('/edit-product/:productID', isAuthenticated, adminController.getEditProduct);

router.post('/edit-product', isAuthenticated, adminController.postEditProduct);

module.exports = router;