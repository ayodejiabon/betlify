exports.up = async function up(knex) {
  await knex.schema.createTable('reset_password', table => {
    table.increments('id').unsigned().notNullable().primary();
    table.string('userId', 20).notNullable();
    table.string('email', 100).notNullable();
    table.string('code', 6).notNullable();
    table.string('token', 100).unique().notNullable();
    table.enum('status', ['0','1']).notNullable().defaultTo('0');
    table.dateTime('created').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('reset_password');
};
