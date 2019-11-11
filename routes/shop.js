const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const shopController = require('../controllers/shop');

const router = express.Router();


// use will filter based on the start For eg : This will tigger for both '/' n '/add' so put /add in above. where as get , post use extact match it search for whole path
// so app.use('/') will work for both '/' n '/hi' but app.get('/') will work for only '/' n not '/hi'

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productID', shopController.getProductDetails);

router.get('/cart', isAuthenticated, shopController.getCart);

router.get('/orders', isAuthenticated, shopController.getOrders);

router.post('/create-order', isAuthenticated, shopController.postCreateOrder);

router.post('/add-to-cart', isAuthenticated, shopController.postCartItem);

router.post('/cart-delete-item', isAuthenticated, shopController.postDeleteCartItem)
module.exports = router;