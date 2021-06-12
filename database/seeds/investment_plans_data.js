exports.seed = async function(knex) {
  return await knex('invest_plans').insert([
    {"plan_id":"152116037","name":"starter","description":"Enjoy entry level of investment","daily_interest":"0.33","duration":"30","min_deposit":"100000","max_deposit":"500000","percentage":"10","status":"1","created":"2020-11-30 12:05:06"},
    {"plan_id":"869822277","name":"silver","description":"Recommended plan of investment","daily_interest":"0.38","duration":"90","min_deposit":"250000","max_deposit":"1250000","percentage":"35","status":"1","created":"2021-03-17 05:51:10"},
    {"plan_id":"140948414","name":"diamond","description":"Advance level of investment","daily_interest":"0.25","duration":"180","min_deposit":"350000","max_deposit":"1750000","percentage":"45","status":"1","created":"2021-03-17 05:40:23"},
    {"plan_id":"709500722","name":"Nice one","description":"i love you","daily_interest":"0.0033","duration":"30","min_deposit":"100000","max_deposit":"250000","percentage":"10","status":"1","created":"2021-03-17 08:00:17"}
  ]);
};