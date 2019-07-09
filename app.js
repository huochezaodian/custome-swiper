const Koa = require("koa");
const views = require("koa-views");
const Router = require("koa-router");
const staticFile = require('koa-static');

const app = new Koa();
const router = new Router();
// 404 状态码
const NOTFOUND_CODE = 404;
// 成功状态码
const SUCCESS_CODE = 200;
// 端口号
const port = 3000;

app.use(staticFile('.'));

app.use(
    views(__dirname + "/", {
        extension: 'html'
    })
);

app.use(async (ctx, next) => {
    await next(); 
    if (ctx.status !== NOTFOUND_CODE) {
        return;
    }
    ctx.status = SUCCESS_CODE;
    ctx.body = ' <div><script src="http://www.qq.com/404/search_children.js" type="text/javascript" charset="utf-8"></script></div>';
});

router.get("/", async (ctx, next) => {
    await ctx.render('index');
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);
