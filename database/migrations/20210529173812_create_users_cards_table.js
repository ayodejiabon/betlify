exports.up = async function up(knex) {
  await knex.schema.createTable('users_cards', table => {
    table.increments('id').unsigned().notNullable().primary();
    table.string('userId', 20).notNullable();
    table.string('email', 100).notNullable();
    table.string('auth_code', 100).unique().notNullable();
    table.string('brand', 100).notNullable();
    table.string('card_no', 100).notNullable();
    table.string('expires', 100).notNullable();
    table.string('bank', 100).notNullable();
    table.string('signature', 100).notNullable();
    table.string('bk_country').notNullable();
    table.dateTime('created').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('users_cards');
};
