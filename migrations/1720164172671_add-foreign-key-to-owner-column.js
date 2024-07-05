/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
// exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    // create new user
    pgm.sql(
        "INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old_notes')",
    );

    // set owner to new user
    pgm.sql("UPDATE notes SET owner = 'old_notes' WHERE owner IS NULL");

    // add constraint
    pgm.addConstraint(
        "notes",
        "fk_notes.owner_users.id",
        "FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE",
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // drop constraint
    pgm.dropConstraint("notes", "fk_notes.owner_users.id");

    // set owner to null
    pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");

    // delete new user
    pgm.sql("DELETE FROM users WHERE username = 'old_notes'");
};
