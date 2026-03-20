import "./detenvconfig.js";
import express from "express";
import cors from "cors";
import config from './config/config.js'
import bodyParser from 'body-parser';
import router from "./routes/index.js";
import * as connection from './helper/db_connect.js';
import APP_CRONS from "./cron/CronInitialiseService.js";
import web_routes from "./webhook/index.js";
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import {createProxyMiddleware} from 'http-proxy-middleware'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(config.APP_WEBHOOK_PREFIX, express.raw({type: 'application/json'}), (req, res, next) => {
    const hmac = req.headers["x-shopify-hmac-sha256"];
    if (!hmac) {
        return res.status(401).send("No HMAC header found!");
    }
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
        console.log("123")
        return res.status(400).send("Invalid request body format");
    }
    const genHash = crypto
        .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
        .update(rawBody)
        .digest("base64");
    if (genHash !== hmac) {
        return res.status(401).send("HMAC verification failed!");
    }
    try {
        req.body = JSON.parse(rawBody.toString('utf8'));
    } catch (error) {
        return res.status(400).send("Invalid JSON body");
    }

    next();
});

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../../client/build')));
}


app.use(bodyParser.json({limit: '50mb'}));

app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));

app.use(express.json({limit: '50mb'}));


/*mongo db connection start*/
connection.mongodb();
/*mongo db connection end*/


app.use(config.APP_WEBHOOK_PREFIX, web_routes);

app.use(cors());

app.use((req, res, next) => {
    const origin = req.headers.origin ? req.headers.origin : '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Authentication, Content-Type, origin,action, accept, token,withCredentials',
    );
    res.setHeader('Access-Control-Expose-Headers', 'security_token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'no-store,max-age=0');
    next();
});

app.use(config.APP_PREFIX, router);

// Initialising CRONS
APP_CRONS.initialise();


if(process.env.NODE_ENV === 'production'){
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });
}else{
app.use('/', createProxyMiddleware({
    ws : true,
    changeOrigin : true,
    target : process.env.FRONTED_LOCAL_URL,
    filter : (path) => !path.startsWith(config.APP_PREFIX) && !path.startsWith(config.APP_WEBHOOK_PREFIX)
}))
}


/* Capture 404 errors and forward them to the error handler */
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    res.send({"status": err.status, "message": "Not found"});
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.log('Unhandled Rejection at: Reason', reason);
});

app.set('port', Number(process.env.PORT) || 5000);

export default app;
