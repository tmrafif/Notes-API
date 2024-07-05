const mapDBToModel = (dbObject) => {
    return {
        id: dbObject.id,
        title: dbObject.title,
        body: dbObject.body,
        tags: dbObject.tags,
        createdAt: dbObject.created_at,
        updatedAt: dbObject.updated_at,
        username: dbObject.username,
    };
};

module.exports = {
    mapDBToModel,
};
