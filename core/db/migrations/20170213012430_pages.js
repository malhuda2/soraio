var dbPrefix = require('../../../conf/config').dbPrefix
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists(dbPrefix + 'pages', function (table) {
    table.increments('id').primary()
    table.string('title')
    table.string('slug')
    table.text('content')
    table.integer('user_id').references(dbPrefix + 'users.id')
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists(dbPrefix + 'pages')
}
