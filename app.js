// 导入模块------------------------------------------------
let express = require('express');
let path = require('path');
let svgCaptcha = require('svg-captcha');
let session = require('express-session');
let bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

// let myT=require(path.join(__dirname,'./tools/myT.js'));
let indexRoute = require(path.join(__dirname,'/route/indexRoute'));

// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'information';

// 开启服务--------------------------------------------------
let app = express();


// 设置静态资源托管
app.use(express.static('static'));

// session中间件
app.use(session({
    secret: 'keyboard cat'
    
  }))

// 使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }))

// 使用 index路由中间件 挂载到 /index这个路径下面
app.use('/index',indexRoute);

// 导入 art-template
app.engine('art', require('express-art-template'));
app.set('views', '/static/views');


// 路由1------------------------------------------------------
// 使用get方法,访问登录页面时,直接读取登录页面,并且返回
app.get('/login',(req,res)=>{
    // 直接读取文件并且返回]
    // console.log(req.session);
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})

// 路由2
// 使用post提交数据过来,验证用户登录
app.post('/login',(req,res)=>{
    // 获取form提交过来的数据
    // 接受数据
    // 比较数据
    let userName=req.body.userName;
    let userPass=req.body.userPass;
    // 验证码
    let code=req.body.code;
     if (code==req.session.captcha) {
         console.log('验证成功');
        //  保存session
        req.session.userInfo={
            // es6快速赋值
            userName,
            userPass
        }
        res.redirect('/index');
      } else {
        //   console.log("验证失败");
        // 打回首页
          res.setHeader('content-type', 'text/html');
          res.send('<script>alert("验证码失败");window.location.href="/login"</script>');
      }
    
})

// 路由3
// 生成验证码图片功能
app.get('/login/captcha',  (req, res)=> {
    var captcha = svgCaptcha.create();
    console.log(captcha.text);
    // 保存到session以便后面验证使用,转小写在输入验证码的时候可以忽略大小写
   
    req.session.captcha=captcha.text.toLocaleLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
});


// 路由4
// 访问首页
app.get('/index',(req,res)=>{
    // 如果有session,登录成功
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,'./static/views/index.art'));
    }else{
        res.setHeader('content-type', 'text/html');
        res.send('<script>alert("请先登录");window.location.href="/login"</script>');
    }
})

// 路由5
// 退出系统.登出
// 删除session的值
app.get('/logout',(req,res)=>{
    delete req.session.userInfo;
    // 返回登录页面
    res.redirect('/login');
})

// 路由6
// 展示注册页面
app.get('/regist',(req,res)=>{
    // 直接读取并返回注册页
    res.sendFile(path.join(__dirname,'static/views/regist.html'));
})

// 路由7
app.post('/regist',(req,res)=>{
    // 接受路由6注册的数据
    // 添加到数据库
    // 返回登录页面
    let userName=req.body.userName;
    let userPass=req.body.userPass;
    MongoClient.connect(url, (err, client)=> { 
        // 获取用户数据
        const db = client.db(dbName);
        // 使用的集合
        let collection=db.collection('usersList')
        // 查询数据
        collection.find({
            userName
        }).toArray((err,doc)=>{
            console.log(doc);
            if(doc.length==0){
                // 没有数据
                // 那就新增数据
                collection.insertOne({
                    userName,
                    userPass
                },(err,result)=>{
                    res.setHeader('content-type','text/html');
                    res.send("<script>alert('欢迎入坑');window.location='/login'</script>")
                    // 关闭数据库连接即可
                    client.close();
                })
            }
            else{
                res.setHeader('content-type','text/html');
                res.send("<script>alert('用户名已经存在,请重新输入');window.location='/login'</script>")
            }
        })
        // client.close();
      });
})



// 开启监听
app.listen(8848,'127.0.0.1',()=>{
    console.log('success');
})