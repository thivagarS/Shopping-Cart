const Product = require('../models/product');

const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product.ejs', {
        pageTitle : 'Add Product',
        path : '/admin/add-product',
        editable : false,
        isAuthenticated: req.session.isAuthenticated
    }) 
};

const postAddProduct = (req, res, next) => {
    const { title, file, price, description } = req.body;
    console.log(file);
    const newProduct = new Product({
        title,
        price,
        description,
        imageUrl : file.path,
        userId : req.user._id
    })
    newProduct.save()
    .then((result) => {
        console.log(`Product Added \n ${result}`);
        res.redirect('/admin/products');
    })  
    .catch(err => {
        console.log(err);
    })
};

const adminProducts = async (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(products => {
        res.render('admin/products.ejs', {
            pageTitle : 'Admin Products',
            path : '/admin/products',
            prods : products,
            isAuthenticated: req.session.isAuthenticated
        })
    })
    .catch(err => {
        console.log(err);
    });
}

const postDeleteProduct = (req, res, next) => {
    Product.deleteOne({_id: req.body.productId, userId: req.user._id})
    .then(() => {
            console.log(`Product Deleted \n ${product}`);
            res.redirect('/admin/products'); 
    })  
    .catch(err => {
        console.log(err);
    }) 
}

const getEditProduct = (req, res, next) => {
    const editable = req.query.edit;
    if(editable) {
        Product.findOne({_id: req.params.productID, userId: req.user._id})
        .then(product => {
            if(!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                editable : true,
                product,
                pageTitle : product.title,
                path : '//',
                isAuthenticated: req.session.isAuthenticated
            })
        })
        .catch(err => {
            console.log(err);
        })
    } else {
        res.redirect('/admin/products');
    }
}

const postEditProduct = async (req, res, next) => {
    const { productId, title, imageUrl, price, description} = req.body;
    Product.findOne({_id: productId, userId: req.user._id})
    .then(product => {
        if(!product) {
            return res.redirect('/');
        }
        product.title = title;
        product.imageUrl = imageUrl;
        product.price = price;
        product.description = description;
        product.save()
        .then((product) => {
            console.log(`Product Editted \n ${product}`);
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    })
};

module.exports = {
    getAddProduct,
    postAddProduct,
    adminProducts,
    postDeleteProduct,
    getEditProduct,
    postEditProduct
}