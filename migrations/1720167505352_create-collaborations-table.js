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
    // create table collaborations
    pgm.createTable("collaborations", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        note_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        user_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
    });

    // add constraint unique_note_id_and_user_id
    pgm.addConstraint(
        "collaborations",
        "unique_note_id_and_user_id",
        "UNIQUE(note_id, user_id)",
    );

    // add foreign key in collaborations
    pgm.addConstraint(
        "collaborations",
        "fk_collaborations.note_id_notes.id",
        "FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE",
    );

    pgm.addConstraint(
        "collaborations",
        "fk_collaborations.user_id_users.id",
        "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE",
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // drop table collaborations
    pgm.dropTable("collaborations");
};
