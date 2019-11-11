const User = require('../models/users');
const bycrpt = require('bcryptjs');
const { sendMail } = require('../util/mail');
const crypto = require('crypto');

const getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login Page',
        errorMessage : req.flash('errorMessage')
    })
}

const postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({email}).
    then(user => {
        if(!user){
            req.flash('errorMessage', 'Email ID or password is incorrect');
            res.redirect('/login');
        } else {
            bycrpt.compare(password, user.password, (err, isPresent) => {
                if(isPresent) {
                    req.session.isAuthenticated = true;
                    req.session.user = user;
                    res.redirect('/');
                } else {
                    req.flash('errorMessage', 'Email ID or password is incorrect');
                    res.redirect('/login');
                }
            })
        }
    })
    .catch(err => {
        console.log(err);
    })
};

const postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/');
    })
};

const getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signUp',
        errorMessage : req.flash('errorMessage')
    });  
};

const postSignUp = (req, res, next) => {
    const { userName, email, password, confirmPassword } = req.body;
    User.findOne({email})
    .then(user => {
        if(user) {
            req.flash('errorMessage', 'User already exists');
            res.redirect('/signup');
        } else {
            bycrpt.hash(password, 8)
            .then(hashedPassword => {
                crypto.randomBytes(32, (err, buffer) => {
                    if(err) {
                        return console.log(err);   
                    }
                    const token = buffer.toString('hex');
                    const newUser = new User({
                        userName,
                        email,
                        password : hashedPassword,
                        verificationToken: token,
                        isVerified: false,
                        cart: {
                            items: []
                        }
                    });
                    newUser.save()
                    .then(user => {
                        res.redirect('/login');
                    })
                    sendMail({
                        to: email,
                        from: 'shop@node-complete.com',
                        subject: 'Welcome !!!',
                        text: 'Welcome and verify to continue',
                        html: `<p><a href="http://localhost:8080/verification/${token}" target="_blank"> Click on the link to verify your account</p>`
                    })
                    .then(res => {
                        console.log('Mail sent');
                    })
                    .catch(err => {
                        console.log(err);
                    })
                })                
            })
            .catch(err => {
                console.log(err);
            })
        }
    })
    
    .catch(err => {
        console.log(err);
    })
};

const getVerificationToken = (req, res, next) => {
    const token = req.params.tokenId;
    User.findOne({verificationToken: token,isVerified : false})
    .then(user => {
        if(!user) {
            return res.redirect('/login');
        }
        user.isVerified = true;
        user.save()
        .then(user => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    })
};

const getResetPassword = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: req.flash('errorMessage')
    })
};

const postResetPassword = (req, res, next) => {
    const { email } = req.body;
    User.findOne({email})
    .then(user => {
        if(!user) {
            return res.redirect('/');
        }
        crypto.randomBytes(32, (err, buffer) => {
            const token = buffer.toString('hex');
            user.resetToken = token;
            user.resetExpirationDate = Date.now() + 3600000;
            user.save()
            .then(user => {
                res.redirect('/');
            })
            .catch(err => {
                console.log(err);
            })
            sendMail({
                to: email,
                from: 'shop@node-complete.com',
                subject: 'Reset Password',
                text: 'Reset your Password',
                html: `<p><a href="http://localhost:8080/reset/${token}" target="_blank"> Click on the link to reset your account password</p>`
            })
            .then(data => {
                console.log('mail sent');
            })
            .catch(err => {
                console.log(err);
            })
        })
    })
    .catch(err => {
        console.log(err);
    })
}

const getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetExpirationDate: { $gt: Date.now() }})
    .then(user => {
        if(!user) {
            return res.redirect('/');
        }
        res.render('auth/new-password', {
            pageTitle: 'New Password',
            path: '/reset',
            userId: user._id,
            passwordToken: token
        })
    })
};

const postNewPassword = (req, res, next) => {
    const { password, userId, passwordToken } = req.body;
    User.findOne({_id: userId, resetToken: passwordToken})
    .then(user => {
        if(!user) {
            return res.redirect('/');
        }
        bycrpt.hash(password, 8)
        .then(hashedPassword => {
            user.password = hashedPassword;
            user.resetExpirationDate = Date.now();
            user.resetToken = '';
            return user.save();
        })
        .then(user => {
            res.redirect('/login');
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
    getLogin,
    postLogin,
    postLogout,
    postSignUp,
    getSignUp,
    getVerificationToken,
    getResetPassword,
    postResetPassword,
    getNewPassword,
    postNewPassword
}