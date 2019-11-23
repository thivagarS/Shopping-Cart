const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const { mongoConnect } = require('./util/database');
const User = require('./models/users');
const mongoose = require("mongoose");
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

// For Template engines
app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images/');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + '-' + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };


// To parse data on url
app.use(bodyParser.urlencoded({extended : false}));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
  );
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
    uri: 'mongodb+srv://username:pass@cluster0-akxsq.mongodb.net/shop',
    collection: 'sessions'
});


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: store
}));
app.use(csurf());
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if(!req.session.user)
        return next();
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next()
    })
    .catch(err => {
        console.log(err);
    })
})

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

// This will filter routes with starting /admin
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Now use will handle every method n default path is '/'
app.use((req, res, next) => {
    res.status(404).render('404.ejs', {
        pageTitle : 'Page not Found',
        path : '/404'
    })
})

mongoose.connect('mongodb+srv://username:password@cluster0-akxsq.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser : true})
.then(()=> {
    console.log("Connected to MongoDB ...")
    app.listen(8080, () => {
        console.log(`App started ... Running in port in 8080`) 
    })
})

