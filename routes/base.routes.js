const express = require('express')
const router = express.Router()

const User = require('./../models/user.model')

const bcrypt = require("bcrypt")
const bcryptSalt = 10


// Endpoints
router.get('/', (req, res) => res.render('pages/index'))

router.get('/sign-up', (req, res) => res.render('pages/signup-form'))

router.post('/sign-up', (req, res)=>{
//req.body={
  //  usernmae: franco,
    //pwd: 6969
//}
    const { username, pwd } = req.body

    if(username.length === 0 || pwd.length === 0){
        res.render('pages/signup-form', { errorMessage: 'Rellena los campos' })
    return
    }
    if(pwd.length < 6){
        res.render('pages/signup-form', {errorMessage: 'por favor pon mas seguridad en tu contraseña'})
        return
    }
    User
        .findOne({ username })
        .then(user => {
            if (user) {
                res.render('pages/signup-form', { errorMessage: 'Nombre de usuario ya registrado' })
                return
            }
            
            const salt = bcrypt.genSaltSync(bcryptSalt)
            const hashPass = bcrypt.hashSync(pwd, salt)

            User
                .create({ username, password: hashPass })
                .then(() => res.redirect('/'))
                .catch(err => console.log('error', err))
        })
        .catch(err => console.log('error', err))

})

router.get('/login', (req, res) => res.render('pages/login-form'))

router.post('/login', (req, res) => {

    const { username, pwd } = req.body

    User
        .findOne({ username })
        .then(user => {

            if (!user) {
                res.render('pages/login-form', { errorMessage: 'Usuario no reconocido' })
                return
            }
            if (bcrypt.compareSync(pwd, user.password) === false) {
                res.render('pages/login-form', { errorMessage: 'Contraseña incorrecta' })
                return
            }
            console.log('tengo aqui el usuario', user)
            req.session.currentUser = user
            console.log(req.session)
            res.redirect('/')
        })
    })
    


router.use((req, res, next) => {
    console.log(req.session)    
    return req.session.currentUser ? next() : res.redirect('/login')
})

router.get('/private', (req, res) => {
    res.render('pages/private-section', req.session.currentUser)
})

router.get('/main', (req, res) => {
    res.render('pages/main-section', req.session.currentUser)
})




module.exports = router
