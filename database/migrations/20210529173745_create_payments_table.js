exports.up = async function up(knex) {
  await knex.schema.createTable('payments', table => {
    table.increments('id').unsigned().notNullable().primary();
    table.string('userId', 20).notNullable();
    table.string('email', 100).notNullable();
    table.string('plan_id', 15).notNullable();
    table.string('ref_code', 100).unique().notNullable(); 
    table.float('amount').notNullable();
    table.float('charge').notNullable();
    table.enum('status', ['0','1']).notNullable().defaultTo('0');
    table.dateTime('created').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('payments');
};
