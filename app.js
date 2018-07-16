// 导入模块
let express = require('express');
let path = require('path');
let svgCaptcha = require('svg-captcha');

// 开启服务
let app = express();

// 设置静态资源托管
app.use(express.static('static'));

// 路由1
// 使用get方法,访问登录页面时,直接读取登录页面,并且返回
app.get('/login',(req,res)=>{
    // 直接读取文件并且返回]
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})


// 路由2
// 生成验证码图片功能
app.get('/login/captcha',  (req, res)=> {
    var captcha = svgCaptcha.create();
   console.log(captcha.text);
    res.type('svg');
    res.status(200).send(captcha.data);
});

// 开启监听
app.listen(8848,'127.0.0.1',()=>{
    console.log('success');
})