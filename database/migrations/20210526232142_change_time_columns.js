exports.up = function(knex, Promise) {
	return knex.raw('ALTER TABLE `registration` MODIFY `email_verified_at` DATETIME NULL DEFAULT NULL, MODIFY `updated_at` DATETIME NULL DEFAULT NULL');
};

exports.down = function(knex, Promise) {
};