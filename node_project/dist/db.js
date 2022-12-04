const sqlite3 = require('sqlite3').verbose();
const dbName = 'later.sqlite';
const db = new sqlite3.Database(dbName);
db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS users
         (id INTEGER PRIMARY KEY, email VARCHAR(319), firstName VARCHAR(255),
          lastName VARCHAR(255), image TEXT, pdf BINARY, UNIQUE(email))
    `;
    db.run(sql);
});
class User_crud {
    static all(cb) {
        db.all(`SELECT * FROM users`, cb);
    }
    static find(id, cb) {
        if (!id)
            return cb(new Error('Please provide an id'));
        db.get(`SELECT * FROM users WHERE id = ?`, id, cb);
    }
    static create(data, cb) {
        const sql_cr = `INSERT INTO users(email, firstName, lastName, image)
                     VALUES (?, ?, ?, ?)`;
        db.run(sql_cr, data.email, data.firstName, data.lastName, data.image, cb);
    }
    static delete(id, cb) {
        if (!id)
            return cb(new Error('Please provide an id'));
        db.run(`DELETE FROM users WHERE id = ?`, id, cb);
    }
    static update(id, data, cb) {
        if (!id)
            return cb(new Error('Please provide an id'));
        const sql_upd = `UPDATE users SET firstName = ?, lastName = ?, email = ?, image = ? WHERE id = ?`;
        db.run(sql_upd, data.firstName, data.lastName, data.email, data.image, id, cb);
    }
}
class For_pdf {
    static get_by_email(email, cb) {
        // if(!email) return cb(new Error('Please provide an email'))
        db.get(`SELECT email, firstName, lastName, image FROM users WHERE email = ?`, email, cb);
    }
    static add_pdf(data, email, cb) {
        if (!email)
            return cb(new Error('Please provide an email'));
        const sql_pdf = `UPDATE users SET pdf = ? WHERE email = ?`;
        db.run(sql_pdf, data.pdf, email, cb);
    }
}
module.exports = db;
module.exports.User_crud = User_crud;
module.exports.For_pdf = For_pdf;
//# sourceMappingURL=db.js.map