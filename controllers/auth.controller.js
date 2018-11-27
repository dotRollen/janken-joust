var exports = (module.exports = {});

exports.signout = function(req, res) {
  req.session.destroy(function(err) {
    if (err) throw err;
    res.redirect('/');
  });
};

exports.profile = function(req, res) {
  var user = req.user;
  res.render('./user/profile', { user: user });
};

exports.settings = function(req, res) {
  var user = req.user;
  res.render('./user/settings', { user: user });
};