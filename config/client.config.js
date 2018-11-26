exports.CLIENT_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'http://jankenjoust.io'
  : ['http://127.0.0.1:3000', 'http://localhost:3000'];
