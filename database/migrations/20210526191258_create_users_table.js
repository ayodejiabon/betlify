exports.up = async function up(knex) {
  await knex.schema.createTable('registration', table => {
    table.increments('id').unsigned().notNullable().primary();
    table.string('userId', 20).unique().notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('name', 100).notNullable();
    table.string('phone', 20).notNullable();
    table.string('profile_image', 100).nullable();
    table.string('password', 60).notNullable();
    table.string('code', 6).notNullable();
    table.string('token', 100).unique().notNullable();
    table.enum('status', ['0','1']).notNullable().defaultTo('0');
    table.dateTime('email_verified_at').defaultTo(knex.fn.now());
    table
      .dateTime('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .dateTime('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('registration');
};
