exports.isAuthenticated = (req, res, next) => {
    if(req.session.isAuthenticated) {
        return next()
    }
    res.redirect('/login');
}

exports.isLoggedIn = (req, res, next) => {
    if(req.session.isAuthenticated) {
        return res.redirect('/');
    }
    next();
}