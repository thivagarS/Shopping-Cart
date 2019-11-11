const Product = require('../models/product');
const Order = require('../models/order');

const getIndex = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/product-list.ejs', {
            pageTitle : 'Shop',
            path : '/',
            prods : products,
            isAuthenticated: req.session.isAuthenticated
        })
    })
    .catch(err => {
        console.log(err)
    }) 
};

const getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/product-list.ejs', {
            pageTitle : 'Shop',
            path : '/products',
            prods : products,
            isAuthenticated: req.session.isAuthenticated
        })
    })
    .catch(err => {
        console.log(err)
    }) 
};

const getCart = (req, res, next) => {
    if(req.user.cart.items.length > 0){ 
        req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(products => {
            res.render('shop/cart.ejs', {
                pageTitle : 'Cart',
                path : '/cart',
                products: products.cart.items,
                isAuthenticated: req.session.isAuthenticated
            })
        })
        .catch(err => {
            console.log(err);
        })
    } else {
        res.render('shop/cart.ejs', {
            pageTitle : 'Cart',
            path : '/cart',
            products: [],
            isAuthenticated: req.session.isAuthenticated
        })
    }
}

const getProductDetails = async (req, res, next) => {
    const productID = req.params.productID;
    Product.findById(productID)
    .then(product => {
        res.render('shop/product-detail.ejs', {
            pageTitle : product.title,
            path : "/",
            product,
            isAuthenticated: req.session.isAuthenticated
        })
    })
    .catch(err => {
        console.log(err);
    })
}

const getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
    .then(orders => {
        res.render('shop/orders.ejs', {
            pageTitle : 'Your Orders', 
            path : '/orders',
            orders: orders,
            isAuthenticated: req.session.isAuthenticated
        })
    })
    .catch(err => {
        console.log(err)
    })
    
}

const postCartItem = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        if(product) {
            req.user.addToCart(product)
            .then(() => {
                res.redirect('/cart');
            })
        }
    })

}

const postDeleteCartItem = async (req, res, next) => {
    req.user.removeFromCart(req.body.productId)
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(err);
    })
}

const postCreateOrder = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(product => {
            return { quantity: product.quantity, product: { ...product.productId._doc }}
        })

        const newOrder = new Order({
            products: products,
            user: {
                userId: req.user,
                userName: req.user.userName
            }
        })
        return newOrder.save()
    })
    .then(() => {
        return req.user.clearCart();
    })
    .then(() => {
        res.redirect('/orders')
    })
    .catch(err => {
        console.log(err);
    })
}


module.exports = {
    getIndex,
    getProducts,
    getCart,
    getOrders,
    getProductDetails,
    postCartItem,
    postDeleteCartItem,
    postCreateOrder
}