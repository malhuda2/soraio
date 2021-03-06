/**
  * Module dependencies.
  */
var express = require('express'),
    ApiController = express.Router(),
    // include Setting model
    User = require('../models/user'),
    Chat = require('../models/chat'),
    Menu = require('../models/menu')

ApiController.route('/chats')
.get(function(req, res, next) {
  var data = []
  Chat
  .fetchAll({withRelated: ['user']})
  .then(function(chats) {
    var b,
        position
    chats = chats.toJSON()
    for (var a of chats) {
      position = (!req.user || a.user_id !== req.user.id) ? 'right' : 'left'
      b = {
        message: a.message,
        username: a.user.username,
        fullname: a.user.firstName + ' ' + a.user.lastName,
        position: position
      }
      data.push(b)
    }
    return res.json(data)
  })
  .catch(function(err) {
    next(err)
  })
})
.post(function(req, res, next) {
  var uid = (!req.user) ? false : req.user.id
  if(!uid){
    return res.json({status: 'Chat not OK!'})
  }
  Chat
  .create({message: req.body.message, user_id: uid})
  .then(function(chat) {
    return res.json({status: 'Chat OK!'})
  })
  .catch(function(err) {
    next(err)
  })
})

ApiController.route('/menu')
.post(function(req, res, next) {
  if(!req.user){
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  }
  Menu
  .upsert({key: 'menu_parents'}, {value: req.body.menu_parents})
  .then(function(parent) {
    return res.json(parent.toJSON())
  })
  .catch(function(err) {
    next(err)
  })
})
module.exports = ApiController
