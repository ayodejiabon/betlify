exports.up = async function up(knex) {
  await knex.schema.createTable('userdata', table => {
    table.increments('id').unsigned().notNullable().primary();
    table.string('userId', 20).unique().notNullable();
    table.string('bank_code', 100).notNullable();
    table.string('bank_account', 100).notNullable();
    table.string('bvn', 11).notNullable();
    table.date('dob').notNullable();
    table.enum('id_type', ['nimc','drivers_license', 'passport', 'voters_card']).notNullable();
    table.string('id_url', 200).notNullable();
    table.string('address', 100).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('country', 100).notNullable();
    table.string('nationality', 100).notNullable();
    table.dateTime('created').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {	
  await knex.schema.dropTable('userdata');
};