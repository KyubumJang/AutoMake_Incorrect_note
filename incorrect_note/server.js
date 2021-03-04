const express = require('express');
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const app = express();
const domain = "www.incorrect-note.tk"
const sslport = 23023;
// const router = require('./router/main')(app,fs);
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const util = require('./util');
const passport = require('passport');

// CONNECT TO MONGODB SERVER
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
//mongoose.connect(process.env.MONGO_DB);
//mongoose.connect('mongodb://jkb2221:5890@cluster0-dqp0k.mongodb.net/<dbname>?retryWrites=true&w=majority');
var db = mongoose.connection;
console.log(db);
db.once('open', function(){
  // CONNECTED TO MONGODB SERVER
  console.log("Connected to mongod server");
});
db.on('error', console.error);
mongoose.connect('mongodb://localhost/mongodb_tutorial');

//mongodb+srv://<username>:<password>@cluster0-dqp0k.mongodb.net/<dbname>?retryWrites=true&w=majority
//Other Settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.util = util;
  next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));
app.use('/files', require('./routes/files'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// DEFINE MODEL
var Book = require('./models/book');
var router2 = require('./routes')(app,Book)


//app.engine('html', require('ejs').renderFile);
//app.use(express.static('public'));



//RUN SERVER
try {
  const option = {
    ca: fs.readFileSync('/etc/letsencrypt/live/' + domain +'/fullchain.pem'),
    key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/privkey.pem'), 'utf8').toString(),
    cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/cert.pem'), 'utf8').toString(),
  };
 
  HTTPS.createServer(option, app).listen(sslport, () => {
    console.log(`[HTTPS] Server is started on port ${sslport}`);
  });
} catch (error) {
  console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
  console.log(error);
}