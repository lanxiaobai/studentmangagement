// 导入express
var express=require('express');
// 导入路由
let indexRoute =express.Router();
// 导入path模块
let path=require('path');
// 导入自己封装好的工具
let myT=require(path.join(__dirname,'../tools/myT.js'));
// 使用mongoDB,包装ID
let objectID=require('mongodb').ObjectId;


// 注册路由,通过/可以访问得到的,这里可以访问得到根目录
indexRoute.get('/',(req,res)=>{
    // 思路
    // 如果有session,那就可以继续访问根目录
    if(req.session.userInfo){
        // 获取用户名字
        let userName = req.session.userInfo.userName;
        res.render(path.join(__dirname,'../static/views/index.art'),{
            userName
        })
    }else{
        // 如果没有session,那就打回登录页面
        res.setHeader('content-type','text/html');
        res.send('<script>alert("请先登录2");window.location.href="/login"</script>');
    }
})

// 接口------------------------------------------------

// 增
indexRoute.get('/insert',(req,res)=>{
    myT.insert('usersList',req.query,(err,result)=>{
        if(!err) res.json({
            mess:'新增成功',
            code:200
        })
    })
});

// 删
indexRoute.get('/delete',(req,res)=>{
    // 接收数据
    let delerteId = req.query.id;
    // 删除数据
    myT.delete('usersList',{_id:objectID(delerteId)},(err,result)=>{
        if(!err)res.json({
            mess:'删除成功',
            code:200
        })
    })
    // 提示用户
    // res.send('delete');
})

// 改
// id,name,age,friend
indexRoute.get('/update',(req,res)=>{
    // 接收数据
let address = req.query.address;
let age = req.query.age;
let introduction = req.query.introduction;
let name = req.query.name;
let phone = req.query.phone;
let sex = req.query.sex;


    // 修改数据
    myT.update('usersList',{_id:objectID(req.query.id)},{address,age,introduction,name,phone,sex},(err,result)=>{
        if(!err)res.json({
            mess:'修改成功',
            code:200
        })
    })
})

// 获取所有数据
indexRoute.get('/list',(req,res)=>{
    // 来就给你所有的东西
    myT.find('usersList',{},(err,docs)=>{
        if(!err) res.json({
            mess:"数据",
            code:200,
            list:docs
        });
    })
})

// 根据名字获取数据
// 需要传递参数 userName过来
// 目前只能根据用户名进行模糊查询
// 增加能够根据id精确查询的功能
indexRoute.get('/search',(req,res)=>{
    // 定义查询的对象
    let query  ={};

    // 用户名过来
    if(req.query.userName){
        query.name = new RegExp(req.query.userName);
    }
    // 有id过来
    if(req.query.id){
        query._id = objectID(req.query.id);
    }
    // console.log(name);
    // 来就给你所有的东西
    // mongoDB模糊查询 使用正则表达式
    myT.find('usersList',query,(err,docs)=>{
        if(!err)  res.json({
            mess:"数据",
            code:200,
            list:docs
        });
    })
})





// 暴露出去-------------------------------------------
module.exports = indexRoute;

