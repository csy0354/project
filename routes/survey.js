var express = require('express'),
    Survey = require('../models/Survey'),
    User = require('../models/User');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

router.get('/', function(req, res, next) {
  Survey.find({}, function(err, docs) {
    if (err) {
      return next(err);
    }
    res.render('surveys/index', {surveys: docs});
  });
});

router.get('/new', function(req, res, next){
  res.render('surveys/new');
});

router.post('/', function(req, res, next) {
  var survey = new Survey({
    Id: req.body.Id,
    password: req.body.password,
    title: req.body.title,
    content: req.body.content
  });

  router.get('/', needAuth, function(req, res, next){
    res.render('/surveys');
  });

  module.exports = router;

  survey.save(function(err, doc) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys/');
  });
});

router.get('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    if (survey) {
      survey.read = survey.read + 1;
      survey.save(function(err) { });
      res.render('surveys/show', {survey: survey});
    }
    return next(new Error('not found'));
  });
});


router.put('/:id', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    if (req.body.password === survey.password) {
      survey.email = req.body.email;
      survey.title = req.body.title;
      survey.content = req.body.content;
      survey.save(function(err) {
        res.redirect('/surveys/' + req.params.id);
      });
    }
    res.redirect('back');
  });
});

router.delete('/:id', function(req, res, next) {
  Survey.findOneAndRemove(req.params.id, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys/');
  });
});

router.get('/:id/edit', function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/edit', {survey: survey});
  });
});

function pagination(count, page, perPage, funcUrl) {
  var pageMargin = 3;
  var firstPage = 1;
  var lastPage = Math.ceil(count / perPage);
  var prevPage = Math.max(page - 1, 1);
  var nextPage = Math.min(page + 1, lastPage);
  var pages = [];
  var startPage = Math.max(page - pageMargin, 1);
  var endPage = Math.min(startPage + (pageMargin * 2), lastPage);
  for(var i = startPage; i <= endPage; i++) {
    pages.push({
      text: i,
      cls: (page === i) ? 'active': '',
      url: funcUrl(i)
    });
  }
  return {
    numPosts: count,
    firstPage: {cls: (page === 1) ? 'disabled' : '', url: funcUrl(1)},
    prevPage: {cls: (page === 1) ? 'disabled' : '', url: funcUrl(prevPage)},
    nextPage: {cls: (page === lastPage) ? 'disabled' : '', url: funcUrl(nextPage)},
    lastPage: {cls: (page === lastPage) ? 'disabled' : '', url: funcUrl(lastPage)},
    pages: pages
  };
}
router.get('/', function(req, res, next) {
  var page = req.query.page || 1;
  page = parseInt(page, 10);
  var perPage = 10;
  Survey.count(function(err, count) {
    Survey.find({}).sort({createdAt: -1})
    .skip((page-1)*perPage).limit(perPage)
    .exec(function(err, posts) {
      if (err) {
        return next(err);
      }
      res.render('surveys/index', {
        posts: posts,
        pagination: pagination(count, page, perPage, function(p) {
          return '/surveys?page=' + p;
        })
      });
    });
  });
});

module.exports = router;
