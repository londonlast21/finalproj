const router = require('express').Router();
const { User, Post, Comment } = require('../../models');

// get api/users
router.get('/', (req, res) => {

    User.findAll({
       attributes: { exclude: ['password'] }
    })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })

});

// get api/users/id
router.get('/:id', (req, res) => {
    User.findOne({
        attributes: { exclude: ['password'] },
        where: {
            id: req.params.id
        },
        //models go here
        // include: [
        //     {
        //         model: Comment,
        //         attributes: ['id', 'comment_text', 'post_id', 'user_id'],
        //         include: {
        //             model: User,
        //             attributes: ['username']
        //         }
        //     }
        // ]
    })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found matching this id' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
});

// post /api/users
router.post('/', (req, res) => {
   
    User.create({
      username: req.body.username,
      password: req.body.password
    })
    .then(dbUserData => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
    
        res.json(dbUserData);
      });
    })
});

// log in route
router.post('/login', (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(dbUserData => {
        if (!dbUserData) {
            res.status(400).json({ message: 'No user with that username in system' });
            return;
        }

        const validPassword = dbUserData.checkPassword(req.body.password);
       
        if (!validPassword) {
          res.status(400).json({ message: 'Incorrect password' });
          return;
        }
        req.session.save(() => {
            // declare session variables
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
      
            console.log(req.session);
      
            res.json({ user: dbUserData, message: 'You are now logged in!' });
        });
    });
});



// log out and destroy session
router.post('/logout', (req, res) => {
    console.log("hit ok in back end");
    console.log(req.session);
    if (req.session.loggedIn) {
        req.session.destroy(() => {
          res.status(204).end();
        });
      }
      else {
          console.log("hit exit in back end");
        res.status(404).end();
      }

});

module.exports = router;