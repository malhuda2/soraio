/**
  * Module dependencies.
  */
var express = require('express'),
    IndexController = express.Router(),
    // include Post model
    Post = require('../models/post'),
    Project = require('../models/project'),
    Page = require('../models/page'),
    Log = require('../models/log')

/**
  * GET / rules.
  */
IndexController.route('(/pagies/:pid?|/)?')
.get(function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  Post.forge()
  .where({publish: true})
  .orderBy("-created_at")
  .fetchPage({
    page: req.params.pid,
    pageSize: 20,
    withRelated: ['user', 'project']
  })
  .then(function(posts){
    var current_prev = posts.pagination.page,
        current_next = posts.pagination.page,
        size = posts.pagination.pageCount,
        pages = {
          uri: req.baseUrl + '/pagies/',
          next: (current_next < size) ? current_next += 1 : false,
          prev: (current_prev > 0) ? current_prev -= 1 : false,
          total: size,
          current: posts.pagination.page
        }
    Log.create({type: 'home', related_id: 0, ip: ip})
    res.render('index', {user: req.user, posts: posts.toJSON(), pages: pages, message: req.flash('info')})
  })
  .catch(function(err) {
    next(err)
  })
})

/**
  * GET /posts/:slug rules.
  * @param pid {post_slug}.
  */
IndexController.route('/posts/:slug')
.get(function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  var slug = req.params.slug
  Post
  .fetchAll({withRelated: ['user', 'project']})
  .then(function(posts) {
    var post = false, pages
    posts = posts.toJSON()
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].slug === slug && posts[i].publish){
            post = posts[i]
            pages = {
              uri: req.baseUrl,
              next: posts[i+1] ? posts[i+1].slug : false,
              prev: posts[i-1] ? posts[i-1].slug : false
            }
      }
    }
    if(!post){
      var err = new Error('Not Found')
      err.status = 404
      throw err
    }
    Log.create({type: 'view', related_id: post.id, ip: ip})
    res.render('posts/single', {user: req.user, post: post, pages: pages, message: req.flash('info')})
  })
  .catch(function(err) {
    next(err)
  })
})

/**
  * GET /pages/:slug rules.
  * @param slug {page_slug}.
  */
IndexController.route('/pages/:slug')
.get(function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  var slug = req.params.slug
  Page
  .fetchAll({withRelated: ['user']})
  .then(function(posts) {
    var post = false, pages
    posts = posts.toJSON()
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].slug === slug){
            post = posts[i]
            pages = {
              uri: req.baseUrl,
              next: posts[i+1] ? posts[i+1].slug : false,
              prev: posts[i-1] ? posts[i-1].slug : false
            }
      }
    }
    if(!post){
      var err = new Error('Not Found')
      err.status = 404
      throw err
    }
    Log.create({type: 'view', related_id: post.id, ip: ip})
    res.render('pages/single', {user: req.user, page: post, pages: pages, message: req.flash('info')})
  })
  .catch(function(err) {
    next(err)
  })
})

/**
  * GET /projects/:slug rules.
  * @param slug {project_slug}.
  */
IndexController.route('/projects/:slug')
.get(function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  var slug = req.params.slug
  Project
  .findOne({slug: slug}, {require: true})
  .then(function(project) {
    Post.where({anime_id: project.id}).fetchAll({withRelated: ['user', 'project']})
    .then(function(posts){
      var pages = {
        url: req.baseUrl + '/',
        next: false,
        prev: false
      }
      Log.create({type: 'view', related_id: project.id, ip: ip})
      res.render('index', {user: req.user, project: project.toJSON(), posts: posts.toJSON(), pages: pages, message: req.flash('info')})
    })
    .catch(function(err) {
      next(err)
    })
  })
  .catch(function(err) {
    next(err)
  })
})

module.exports = IndexController
