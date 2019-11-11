const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const Product = require('./productFileSystem');

const getPath = () => {
    return path.join(path.dirname(process.mainModule.filename),
        'data',
        'cart.json'
    )   
}

const asyncReadProducts = promisify(fs.readFile);
const asyncWriteProducts = promisify(fs.writeFile);

const readProducts = async () => {
    try {
        const data = await asyncReadProducts(getPath());
        return JSON.parse(data);
    } catch (err){
        return undefined;
    }
};

const  writeProducts = async (productsObj) => {
    try {
        await asyncWriteProducts(getPath(), JSON.stringify(productsObj));
    } catch(err) {
        throw err;
    }
}

module.exports = class Cart {
    static async addProduct(id, productPrice) {
        // {"products":[{id : '2', qty : 1}, {id : '3', qty : 2}],"totalPrice":10}
        let cartData = await readProducts();
        if(cartData) {
            const index = cartData.products.findIndex(product => product.id === id);
            // if product already existing
            if(index >= 0) {
                const quanity = cartData.products[index].qty;
                cartData.products[index].qty = quanity + 1;
                cartData.totalPrice = cartData.totalPrice + productPrice;
            } else {
                // if product is not available
                const cartItem = {id, qty : 1};
                cartData.products.push(cartItem);
                cartData.totalPrice = cartData.totalPrice + productPrice;
            }
        } else {
            // if there is no data file
            cartData = {products:[{id, qty : 1}], totalPrice: productPrice}
        }
        await writeProducts(cartData);
    }

    static async getCartItem() {
        const cartItem =  await readProducts();
        if(cartItem) {
            const productList = await Product.fetchAll();
            let products = [];
            products = cartItem.products.map(cart => {
                const product = productList.find(product => product.id === cart.id);
                return {
                    title : product.title,
                    qty : cart.qty,
                    id : cart.id
                }
            })
            console.log(products)
            return products;
        } else {
            return []
        }
    }

    static async findCartItemById (id, cartProducts = false) {
        if(!cartProducts) {
            const cartData = await readProducts();
            if (cartData)
                cartProducts = cartData.products;
        }
        return cartProducts.findIndex(item => item.id === id);
    }
    static async deleteCartItem(id, productPrice) {
        // {"products":[{id : '2', qty : 1}, {id : '3', qty : 2}],"totalPrice":10}
        let cartData = await readProducts();
        if(cartData) {
            //const cartItemIndex = cartData.products.findIndex(item => item.id === id);
            const cartItemIndex = await Cart.findCartItemById(id, cartData.products);
            console.log(cartItemIndex)
            cartData.totalPrice = cartData.totalPrice - (cartData.products[cartItemIndex].qty * productPrice);
            const updatedProducts = cartData.products.filter(product => product.id != id );
            cartData.products = updatedProducts;
            await writeProducts(cartData);
        }
    }
}
