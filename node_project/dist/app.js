require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const us_crud = require('./db').User_crud;
const read = require('node-readability');
const { jsPDF } = require("jspdf");
const SQLGrid = require('@internalfx/sqlgrid');
const fs = require('fs');
const { Sequelize } = require('sequelize');
app.set('port', process.env.PORT || 3001);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css'));
app.set('view engine', 'ejs');
//@CREATE
app.get('/', function (req, res) {
    res.render('registration.ejs');
});
app.post('/', function (req, res, next) {
    if (!req.body)
        return res.sendStatus(400);
    us_crud.create({ email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, image: req.body.image }, (err) => {
        if (err && err.message.includes('SQLITE_CONSTRAINT'))
            return next('This email already exists');
        if (err)
            return next(err);
        res.redirect('/users');
    });
});
//@GENERATE PDF
app.get('/users/pdf', function (req, res) {
    res.render('genpdf.ejs');
});
app.post('/users/pdf', function (req, res, next) {
    if (!req.body)
        return res.sendStatus(400);
    const email = req.body.email;
    us_crud.get_by_email(email, (err, users) => {
        if (err)
            return next(err);
        const doc = new jsPDF();
        const data = JSON.stringify(users).split(',').join('\n');
        doc.text(data, 10, 10);
        doc.save('file.pdf');
        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: 'later.sqlite'
        });
        const bucket = SQLGrid(sequelize);
        bucket.initBucket().then(function () {
            try {
                const fileBuffer = fs.readFileSync('file.pdf');
                const newFile = bucket.writeFile({ filename: 'file.pdf', buffer: fileBuffer });
                fs.unlinkSync('file.pdf');
                res.format({
                    json: () => {
                        res.send(true);
                    }
                });
            }
            catch (error) {
                res.format({
                    json: () => {
                        res.send(false);
                    }
                });
            }
        });
    });
});
//@READ
app.get('/users', (req, res, next) => {
    us_crud.all((err, users) => {
        if (err)
            return next(err);
        res.render('users.ejs', { users: users });
    });
});
app.get('/users/:id', (req, res, next) => {
    const id = req.params.id;
    us_crud.find(id, (err, users) => {
        if (err)
            return next(err);
        res.render('udata.ejs', {
            email: users.email, firstName: users.firstName,
            lastName: users.lastName, image: users.image, id: users.id
        });
    });
});
//@UPDATE
app.get('/users/:id/edit', (req, res, next) => {
    const id = req.params.id;
    us_crud.find(id, (err, users) => {
        if (err)
            return next(err);
        res.render('edit.ejs', {
            email: users.email, firstName: users.firstName,
            lastName: users.lastName, image: users.image, id: users.id
        });
    });
});
app.post('/users/:id/edit', (req, res, next) => {
    const id = req.params.id;
    if (!req.body)
        return res.sendStatus(400);
    us_crud.update(id, {
        firstName: req.body.firstName, lastName: req.body.lastName,
        email: req.body.email, image: req.body.image
    }, (err) => {
        if (err)
            return next(err);
        return res.redirect('/users');
    });
});
//@DELETE
app.get('/users/:id/delete', (req, res, next) => {
    const id = req.params.id;
    us_crud.delete(id, (err) => {
        if (err)
            return next(err);
        return res.redirect('/users');
    });
});
app.listen(app.get('port'), () => {
    console.log(`Web app available at http://127.0.0.1:${app.get('port')}`);
});
module.exports = app;
//# sourceMappingURL=app.js.map