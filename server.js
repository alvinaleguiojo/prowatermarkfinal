const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.SECRET_KEY); // Add your Secret Key Here
const app = express();
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
var multer = require('multer');

// This will make our form data much more useful
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('views'))
app.use(express.static('uploads'));
// This will set express to render our views folder, then to render the files as normal html
app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);
//app.use(express.static(path.join(__dirname, './views')));
app.use(fileUpload());

 
var storage = multer.diskStorage({
  destination: (req, file, cb)=> {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const fileFilter = (req, res, cb) =>{
  if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
    cb(null, true);
  }else {
    cb(null, false);
  }
}

var upload = multer({
  storage: storage,
  fileFilter : fileFilter
});

// USER DB
var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login_sys'
})

// ADMIN DB
var mysqlConnectionND = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'admin_sys'
})

mysqlConnectionND.connect((err) => {
 if(!err){
   console.log("DB connection succeeded");
 }else {
   console.log("DB connection failed" + JSON.stringify(err, undefined, 2));
 }
})
  
app.use(session({
  secret: 'ABCDefg',
  resave: false,
  saveUninitialized : true 
}))

// SIGN UP PART
app.post('/charge', function(req, res){
  const fullname = req.body.fullname;
  const email = req.body.email;
  const password = req.body.password;
  const cpassword = req.body.cpassword;

  
  if(cpassword === password) {
   const sql = 'select * from user where email = ?;';
    
   mysqlConnectionND.query(sql, [email], function(err, result, fields) {
     if(err) throw err;

     if(result.length > 0) {
       res.redirect('/');
     } else {
        var hashpassword = bcrypt.hashSync(password, 10);
        var sql = 'insert into user (fullname, email, password) values(?, ?, ?);';

        mysqlConnectionND.query(sql, [fullname, email, hashpassword], function(err, result, fields) {
          if(err) throw err;
          res.redirect('login');
        })
     }
   })
}
else {   
        res.redirect('/');
} 

})
// ADMIN signup
app.post('/admin_signup', function(req, res){
  const fullname = req.body.fullname;
  const email = req.body.email;
  const password = req.body.password;
  const cpassword = req.body.cpassword;

  
  if(cpassword === password) {
   const sql = 'select * from user where email = ?;';
    
   mysqlConnectionND.query(sql, [email], function(err, result, fields) {
     if(err) throw err;

     if(result.length > 0) {
       res.redirect('/');
     } else {
        var hashpassword = bcrypt.hashSync(password, 10);
        var sql = 'insert into user (fullname, email, password) values(?, ?, ?);';

        mysqlConnectionND.query(sql, [fullname, email, hashpassword], function(err, result, fields) {
          if(err) throw err;
          res.redirect('login');
        })
     }
   })
}
else {   
        res.redirect('/');
} 
})

// request stripe payment from users credit card  
app.post("/charge", (req, res) => {
 const price = 9;
   try {
     stripe.customers
       .create({
         // fullname: req.body.name,
         // email: req.body.email,
         // password: req.body.password,
         // cpassword: req.body.cpassword,
         source: req.body.stripeToken   
       })
       .then(customer =>
         stripe.charges.create({
          amount: price,
           currency: "usd",
           customer: customer.id 
         })
       )
       .then(() => res.render("completed"))
       .catch(err => console.log(err));
   } catch (err) {
     res.send(err);
   }
 }); 

// handle post request for user login 
app.post('/auth_login', function(req, res, next) {
 const email = req.body.email;
 const password = req.body.password;

 const sql = 'select * from user where email = ?;';

 mysqlConnectionND.query(sql, [email], function(err, result, fields ){
     if(err) throw err;
    if(result.length &&  bcrypt.compareSync(password, result[0].password)) {
       req.session.loggedin = true;
       req.session.email = email;  
       res.redirect('/profile');
    }
    else {
      res.render('login')
    }
 });

});

// ADMIN LOGIN
app.post('/auth_admin', function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
 
  const sql = 'select * from user where email = ?;';
 
  mysqlConnectionND.query(sql, [email], function(err, result, fields ){
      if(err) throw err;
     if(result.length &&  bcrypt.compareSync(password, result[0].password)) {
        req.session.loggedin = true;
        req.session.email = email;  
        res.redirect('/dashboard');
     }
     else {
       res.render('admin')
     }
  });
 
 });

 //forgot password
let user = {
  id: "hahaha",
  email: "alvs@gmail.com",
  password: "asdsadsadsadsadasd"
}

const JWT_SECRET = 'SECRET LANG'

 app.get('/forgot-password', (req, res) =>{
   const email = req.body.email;
    console.log(email);

    //make sure user exist in database
    if(email !== user.email){
      console.log("user not registered.");
    }

   // user exit then create one time link 
    const secret = JWT_SECRET + user.password;
    const payload = {
      email: user.email,
      id: user.id
    }
     
    const token = jwt.sign(payload, secret, {expiresIn: '10m'})
    const link = `http://localhost:3001/reset-password/${user.id}/${token}`
    console.log(link);
    console.log("password has been sent to your email");
    res.redirect('/login');
 })
 
 app.get('/reset-password/:id/:token', (req, res) => {
   const { id, token } = req.params
    
   //check if this id exist in database
   if(id !== user.id){
     console.log('invalid id')
   }

   // Then if we valid user id 
   const secret = JWT_SECRET + user.password;
   try{
    const payload = jwt.verify(token, secret);
    res.render('reset-password', {email: user.email})

   }catch(error){
     console.log(error.message);
   }

 })

 app.post('/reset-password/:id/:token', (req, res, next) => {
  const { id, token } = req.params;
  const { password, cpassword } = req.body;
 
  if(id !== user.id){
    console.log("user not registered.");
  }

  const secret = JWT_SECRET + user.password;
  try{
    const payload = jwt.verify(token, secret);
     
    //valid password should match
    // simply find the user with payload  email and id
    // always hash the password 
    user.password = password;
    res.send(user);
    
  }catch(error){
    console.log(error.message);
    res.send(error.message);
  }

 })


// ADMIN BLOG POST
app.post('/blog_post', (req, res ) =>{
  const title = req.body.title;
  const description = req.body.description;
  let sampleFile;
  let uploadPath;

  if(!req.files || Object.keys(req.files).length === 0){
    return res.status(404).send('No files were uploaded.');
  }
  
  sampleFile = req.files.upload_image;
  uploadPath = __dirname + '/uploads/' + sampleFile.name;

sampleFile.mv(uploadPath, (err)=>{
  if(err) return res.status(500).send(err);
})
        
  const sql = 'insert into blog_post (title,  description, image) values(?, ?, ?);';
   mysqlConnectionND.query(sql, [title,description, sampleFile.name ],(err, result, fields) =>{
     if(err) throw err;
      console.log("Post has been submitted")
      res.redirect('/blog');
    })
})

// delete blog post
app.post('/delete/:id', function(req, res, next) {
  var id= req.params.id;
    var sql = 'DELETE FROM blog_post WHERE id = ?';
    mysqlConnectionND.query(sql, [id], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) updated");
  });
  res.redirect('/dashboard'); 
});

app.get('/profile', function(req, res, next){    
 if(req.session.loggedin){
   res.render('profile');  
 } else {
    res.redirect('/');
 }
  res.end();      
})

app.get('/logout', function(req, res, next) {
 if(req.session.email) {
   req.session.destroy(); 
 }
    res.redirect('login');
})


//Routes
app.get('/home', (req, res) => {
 res.render('index');
});

app.get('', (req, res) => {
    if(req.session.email) {
        res.render('profile');
    } else {
        res.render('index');
    }
   });

   app.get('/profile', (req, res) => {
    if(req.session.cookie) {
        res.render('profile');
    } else {
        res.render('login');
    }
   });

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/watermarkfreeversion', (req, res) => {
    res.render('watermarkfreeversion')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/watermarkpro', (req, res) => {
  if(req.session.email && req.session.cookie) {
    res.render('watermarkpro')
  }
   else{
     res.render("login")
   }
})

app.get('/rich_text_editor', (req, res) => {
  if(req.session.email && req.session.cookie){
    res.render('rich_text_editor')
  }else{
    res.render('admin')
  }
})
app.get('/completed', (req, res) => {
  res.render('completed')
})

app.get('/admin_login',  (req, res) => {
  
    var sql='SELECT * FROM blog_post';
    
    mysqlConnectionND.query(sql,(err, data, fields) =>{
      if (err) throw err;  
     if(req.session.email && req.session.cookie){
      res.render('dashboard', { title: 'dashboard', userData: data});
     }  else {
      res.render('admin');
    }
    });
})

//when the user logout
app.get('/blog_user',  (req, res) => {
  var sql='SELECT * FROM blog_post';

  mysqlConnectionND.query(sql, function (err, data, fields) {
    if (err) throw err;
      res.render('blog_user', { title: 'blog', userData: data});
  });
})

app.get('/blog_prousers',  (req, res) => {
  var sql='SELECT * FROM blog_post';

  mysqlConnectionND.query(sql, function (err, data, fields) {
    if (err) throw err;
      res.render('blog_prousers', { title: 'blog', userData: data});
  });
})

app.get('/dashboard',  (req, res) => {
  var sql='SELECT * FROM blog_post';
  
  mysqlConnectionND.query(sql, function (err, data, fields) {
    if (err) throw err;
      res.render('dashboard', { title: 'blog', userData: data });
  });  
})

app.get('/admin_login', (req, res) => {
  res.render('admin')
})
app.get('/admin', (req, res) => {
  res.render('admin')
})
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'dashboard', userData: data})
})
app.get('/adsignup', (req, res) => {
  res.render('adsignup')
})

app.get('*', (req, res) => {
  if(req.session.email && req.session.cookie){
    res.render('profile')
  }
    res.render('index')
})



const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Server is running...'));