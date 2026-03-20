import app from './src/app.js';

app.listen(app.get('port'), function () {
    console.log("Live Cart " + process.env.NODE_ENV + " started on Port No. ", app.get('port'));
});
