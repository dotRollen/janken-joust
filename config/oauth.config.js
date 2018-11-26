const providers = ['github'],
      callbacks = function(providers) {
        for ( let i = 0; i < providers.length; i++) {
          return (
            process.env.NODE_ENV === 'production'
              ? `http://jankenjoust.io/api/v1/auth/${providers[i]}/callback`
              : `http://localhost:8080/api/v1/auth/${providers[i]}/callback`
          )
        };
      }(providers),
      [githubURL] = callbacks;

exports.GITHUB_CONFIG = {
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: githubURL,
};
