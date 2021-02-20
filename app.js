require('nocamel');

// global config
config = require('./config');

// global database object
db = require('./models/init');

// set up gateway
const gateway = require('./gateway/gateway');

// set up express
const express = require('express');
const redis = require('redis');
const session = require('express-session');
const store = require('connect-redis')(session);
const app = express();
const routes = require('./routes');

let redis_client = redis.createClient({ host: 'redis', port: 6379 });

app.set('view engine', 'twig');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(session({
    store: new store({ client: redis_client }),
    secret: '678s857d9f879a87shd9hf9a87sd6f98',
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    res.locals.epoch = +new Date();
    console.log('setting')
    next();
});
app.use('/', routes);

// start the app
app.listen(config.ports.app, () => {});
