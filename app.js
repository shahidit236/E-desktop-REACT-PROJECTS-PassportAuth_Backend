const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()
const sequelize = require('./src/db/db')
const { DataTypes } = require("sequelize")
const User = require('./src/models/user')(sequelize, DataTypes)
const passport = require('passport')
require('./config/passport')
const session = require('express-session')

//Initializing express
const app = express()

//Express Middleware
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(session({
    secret: 'something not secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000, // 3600000 1 hour in milliseconds. The expiration time of the cookie to set it as a persistent cookie.
        sameSite: true,
    }
}));
app.use(passport.initialize())
app.use(passport.session())

// //Register
// app.post('/add-users', (req, res) => {

//     const sentUserName = req.body.user
//     const sentPassword = req.body.password
//     //const hashedPassword = bcrypt.hashSync(sentPassword,  bcrypt.genSaltSync())
//     const SQL = 'INSERT INTO User (username, password) values ($1, $2,)'
//     const Values = [sentUserName, sentPassword]
//     sequelize.query(SQL, Values, (err, results) => {
//         if (err) {
//             return res.send(err)
//         }
//         else {
//             console.log("User Inserted Successfully!")
//             return res.json({ message: 'New User Added', results })
//         }
//     })
// })


//Login Route
app.get('/login', passport.authenticate('local'), (req, res) => {
    res.status(200).send({ message: 'Logged In Successfully' })
});

app.use((req, res, next) => {
    if (req.session && !req.session.expiryTime) {
        req.session.expiryTime = req.session.cookie.maxAge
        var expirytime = req.session.expiryTime
        //var now = new Date()
        //var ct = new Date((now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes())
        const currentDate = new Date();
        // const expirationDate = new Date(currentDate.getTime() + expirytime * 1000);
        const expirationDate = new Date(currentDate.getTime() + expirytime);


        console.log("Current Date:", currentDate);
        console.log("Expiration Date:", expirationDate);

    }
    next()
})

app.get('/getSessionExpiry', (req, res) => {
    const sessionExpiry = req.session.cookie.expires;
    //res.json({ sessionExpiry });
    res.status(200).send({ message: sessionExpiry })
    console.log("expiry time:" + sessionExpiry);
});


//Logout Route
app.get('/logout', (req, res) => {
    req.logout()
    res.send({ message: "Logged out" })
})

const isAuthenticated = (req, res, next) => {
    if (req.user)
        return next();
    else
        return res.status(401).json({
            error: 'User not authenticated'
        })
}

app.use(isAuthenticated)
//Route
app.get('/', (req, res) => {
    res.send({ message: 'Hello World' })
})

app.listen(process.env.PORT, async () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`)
    try {
        await sequelize.sync(
            //{force: true}
        )
        console.log('Connected to database')
    } catch (error) {
        console.error(`Error: Cannot connect to database ${error}`)
    }
})
