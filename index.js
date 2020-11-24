const express = require('express');
const express_hb = require('express-handlebars');
const lighthouseRoutes = require('./routes/lighthouse');
const path = require('path');

const app = express();
const hbs = express_hb.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'static')))
app.use(lighthouseRoutes);

app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});