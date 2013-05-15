var express = require('express')
  , app = express();

//configuration for default env, could be changed for diff deployments
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret: '42',
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + "/public"));
  app.use(express.static(__dirname));
});

//ROUTES
app.get('/', function(req, res) {
  res.sendfile(__dirname + "/index.html");
});

//set server to listen on port
app.listen(1234);
