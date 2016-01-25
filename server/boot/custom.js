module.exports = function(app) {
  console.log('kkkkk');
  app.get('/ping', function(req, res) {
    res.send('pong');
  });



};
