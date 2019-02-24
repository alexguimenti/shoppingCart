var express = require('express');
var router = express.Router();
var Cart = require("../models/cart");
var csrf = require("csurf");
var passport = require("passport");

var Product = require("../models/products");
var Order = require("../models/order");

/* GET home page. */
router.get('/', function (req, res, next) {
  var successMsg = req.flash("success")[0];
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
  });
});

router.get("/add-to-cart/:id", isLoggedIn, function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product){
    if (err){
      return res.redirect("/");
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect("/");
  });
});

router.get("/reduce/:id", function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart")
});

router.get("/remove/:id", function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart")
});

module.exports = router;

router.get("/shopping-cart", function (req, res, next) {
  if (!req.session.cart) {
    return res.render("shop/shopping-cart", { products: null });
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash("error")[0];
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
      return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

// router.post('/checkout', isLoggedIn, function(req, res, next) {
//   if (!req.session.cart) {
//       return res.redirect('/shopping-cart');
//   }
//   var cart = new Cart(req.session.cart);
  
//   var stripe = require("stripe")(
//       "sk_test_fwmVPdJfpkmwlQRedXec5IxR"
//   );

//   stripe.charges.create({
//       amount: 100,
//       currency: "usd",
//       source: 'tok_mastercard', // obtained with Stripe.js
//       description: "Test Charge"
//   }, function(err, charge) {
//       if (err) {
//           req.flash('error', err.message);
//           return res.redirect('/checkout');
//       }
//       var order = new Order({
//           user: req.user,
//           cart: cart,
//           address: req.body.address,
//           name: req.body.name,
//           paymentId: charge.id
//       });
//       order.save(function(err, result) {
//           req.flash('success', 'Successfully bought product!');
//           req.session.cart = null;
//           res.redirect('/');
//       });
//   }); 
// });

router.post('/checkout', isLoggedIn, function (req, res, next) {
  var cart = new Cart(req.session.cart);
  // Set your secret key: remember to change this to your live secret key in production
  // See your keys here: https://dashboard.stripe.com/account/apikeys
  var stripe = require("stripe")("sk_test_KwCXJpvIttEH3kJ1m9BchI31");

  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express

  const charge = stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: 'usd',
    description: 'Example charge',
    source: token,
  }, function (err, charge) {

    // generating order on DB
    var order = new Order({
      user: req.user,
      cart: cart,
      paymentId: charge.id,
      //address: req.body.address,
      //name: req.body.name,
    });
    order.save();
  });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}