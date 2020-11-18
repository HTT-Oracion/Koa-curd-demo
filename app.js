const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session');
// const MongoClient = require('mongodb').MongoClient
// const url = 'mongodb://localhost:27017'
// const dbName = 'koa'
const DB = require('./module/mongodb.js')
const path = require('path')
// const views = require('koa-views')
const render = require('koa-art-template')
const static = require('koa-static')
const app = new Koa()
// MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
//   const db = client.db(dbName)
//   //添加数据
//   // db.collection('test').insertOne({
//   //   name: 'test1',
//   //   age: 18
//   // })
// })
const router = new Router()
// const common = require('./common')
const port = 3000
// app.use(async (ctx, next) => {
//   console.log(new Date());
//   await next()
// })
//配置 session 
app.keys = ['some secret hurr'];
const CONFIG = {
  key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 5000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: false, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  secure: false, /** (boolean) secure cookie*/
  sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
};

app.use(session(CONFIG, app));
render(app, {
  root: path.join(__dirname, 'views'),
  extname: '.html',
  debug: process.env.NODE_ENV !== 'production'
});
app.use(static('./static'))
app.use(bodyParser());
// app.use(views('views', { map: { html: 'ejs' } }))
// app.use(views('views', {extension:'ejs'}))
app.use(async (ctx, next) => {
  // console.log('start');
  ctx.state = {
    username: 'jack',
    msg: 'Hello koa!',
    date: '2020/11/17',
    addr: 'shenzhen'
  }
  await next()
  if (ctx.status == 404) {
    ctx.status = 404
    ctx.body = '404 NOT FOUND'
  } else {
    console.log(ctx.url);
  }
})
// router.get('/', async ctx => {
//   // let username = Buffer.from('小明').toString('base64')
//   // ctx.cookies.set('userinfo', username, {
//   //   maxAge: 60 * 1000 * 60,//存在时间，毫秒数
//   //   // expires:'2020-11-18', //过期时间
//   //   // path: '/news',  //设置能访问cookie的页面
//   //   domain: '', //域名，默认不配置，为当前域
//   //   httpOnly: false,//设置是否只能在服务器端访问，如果给false，在客户端(js)也能访问
//   //   overwrite: false //是否可以重写cookie  
//   // })
//   //获取 session
//   console.log(ctx.session.username);
//   await ctx.render('./index')
// })
// router.get('/login', async ctx => {
//   ctx.session.username = '小红'
//   ctx.body = '登录成功!'
// })
// router.get('/news', async ctx => {
//   let data = ctx.cookies.get('userinfo')
//   let userInfo = Buffer.from(data, 'base64').toString()
//   console.log(userInfo);
//   await ctx.render('./news', {
//     userInfo
//   })
// })

// router.get('/', async ctx => {
//   let title = 'TITLE FROM RESPONCE'
//   await ctx.render('index', {
//     title
//   })
// })
// router.post('/addPage', async ctx => {
//   ctx.body = ctx.request.body
// })
// // router.get('/test', async ctx => {
// //   ctx.body = 'test page'
// //   // console.log(ctx.query);
// //   // console.log(ctx.querystring);
// //   console.log(ctx.request);
// //   console.log(ctx.request.url);
// //   console.log(ctx.request.query);
// //   console.log(ctx.request.querystring);
// // })
// router.get('/news/:id', async ctx => {
//   ctx.body = `news page ${ctx.params.id}`
// })
// router.get('/add', async (ctx, next) => {
//   console.log('add1');
//   await next()
// })
// router.get('/add', async ctx => {
//   ctx.body = 'add Page'
//   console.log('add2');
// })

router.get('/', async ctx => {
  let data = await DB.find('test', {})
  await ctx.render('./index', {
    userList: data
  })
})
router.get('/add', async ctx => {
  await ctx.render('./add')
})
router.get('/edit', async ctx => {
  let id = ctx.query.id
  console.log(id);
  let data = await DB.find('test', { "_id": DB.getObjectId(id) })
  await ctx.render('./edit', {
    user: data[0]
  })
})
router.get('/delete', async ctx => {
  let id = ctx.query.id
  let data = await DB.remove('test', { "_id": DB.getObjectId(id) })
  if (data) {
    ctx.redirect('/')
  }
})
router.post('/add', async ctx => {
  let data = await DB.insert('test', ctx.request.body)
  try {
    if (data.result.ok) {
      ctx.redirect('/')
    }
  } catch (err) {
    console.log(err);
  }
})
router.post('/edit', async ctx => {
  let id = ctx.header.referer.split('=')[1]
  let username = ctx.request.body.username
  let age = ctx.request.body.age
  let sex = ctx.request.body.sex
  console.log(ctx.request.body);
  let data = await DB.update('test', { "_id": DB.getObjectId(id) }, {
    username, age, sex
  })
  try {
    if (data.result.ok) {
      ctx.redirect('/')
    }
  } catch (err) {
    console.log(err);
  }
})
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(port, () => {
  console.log(`running in port ${port}`);
})