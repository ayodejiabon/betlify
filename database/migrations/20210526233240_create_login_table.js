exports.up = async function up(knex) {
  await knex.schema.createTable('access', table => {
    table.increments('id').unsigned().notNullable().primary();
    table.string('userId', 20).unique().notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('password', 60).notNullable();
    table.enum('status', ['0','1']).notNullable().defaultTo('1');
    table.dateTime('lastin').nullable().defaultTo(null);
    table.dateTime('updated_at').nullable().defaultTo(null);
    table.dateTime('created').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('access');
};
