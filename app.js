var fs = require('fs');
var path = require('path');
var Koa = require('koa');
var Router = require('koa-router');

var app = new Koa();
var router = new Router();

//router post请求  https://github.com/koajs/bodyparser/tree/3.x
var bodyParser = require('koa-bodyparser');

var send = require('koa-send'); //处理静态文件

router
.get('/',function(ctx, next){
  //载入静态文件
  ctx.body = fs.createReadStream(path.join(__dirname, 'paiqi_node.html'));
  ctx.type = 'html';
})
.get('/:userId', async(ctx, next) => {
  //读取
  var p = path.join(__dirname,`/data/${ctx.params.userId}`);
  var datas = await new Promise((reslove)=>{
    mkdirs(p,()=>{
      var event = '[]';
      var resource = '[]';
      var backLog = '[]';
      if(fs.existsSync(p+'/event.json')){
        event = fs.readFileSync(p+'/event.json','utf-8');
        resource = fs.readFileSync(p+'/resource.json','utf-8');
        backLog = fs.readFileSync(p+'/backLog.json','utf-8');
      }
      reslove({
        event:JSON.parse(event),
        resource:JSON.parse(resource),
        backLog:JSON.parse(backLog)
      });
    });
  });
  ctx.body = datas;
})
.post('/post',async (ctx,next)=>{
  //保存
  var userId = ctx.request.body.userId;
  var event = ctx.request.body.events;
  var resource = ctx.request.body.resources;
  var backLog = ctx.request.body.backLogs;
  var p = path.join(__dirname,`/data/${userId}`);
  var success = await new Promise((reslove)=>{
    mkdirs(p,()=>{
      fs.writeFileSync(p+'/event.json',event)
      fs.writeFileSync(p+'/resource.json',resource)
      fs.writeFileSync(p+'/backLog.json',backLog)
      reslove('success');
    });
  });
  ctx.body= success;
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(async function (ctx, next){
    //处理资源静态文件
    await send(ctx, ctx.path);
  });

console.log('访问：http://localhost:3000');
app.listen(3000);

//递归创建目录
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}