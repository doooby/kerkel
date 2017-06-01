const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/kerkel', function (req, res, next) {
    res.render('kerkel', {
        body_class: 'full-height'
    });
});

module.exports = router;
