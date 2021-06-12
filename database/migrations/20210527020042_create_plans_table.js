exports.up = async function up(knex) {
  await knex.schema.createTable('invest_plans', table => {
    table.increments('id').unsigned().notNullable().primary();
    table.string('plan_id', 15).unique().notNullable();
    table.string('name', 100).notNullable();
    table.text('description').notNullable();
    table.float('daily_interest').notNullable();
 	table.float('duration').notNullable();
  	table.float('min_deposit').notNullable();
   	table.float('max_deposit').notNullable();
    table.float('percentage').notNullable();
    table.string('code', 6).notNullable();
    table.enum('status', ['0','1']).notNullable().defaultTo('1');
    table.dateTime('created').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable('invest_plans');
};
