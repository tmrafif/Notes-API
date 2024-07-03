require("dotenv").config();

const Hapi = require("@hapi/hapi");

// notes
const notes = require("./api/notes");
const NotesServices = require("./services/postgres/NotesServices");
const NotesValidator = require("./validator/notes");

// users
const users = require("./api/users");
const UsersServices = require("./services/postgres/UsersServices");
const UsersValidator = require("./validator/users");

const ClientError = require("./exceptions/ClientError");

const init = async () => {
    // services
    const notesServices = new NotesServices();
    const usersServices = new UsersServices();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ["*"],
            },
        },
    });

    // register plugin
    await server.register([
        {
            plugin: notes,
            options: {
                service: notesServices,
                validator: NotesValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersServices,
                validator: UsersValidator,
            },
        },
    ]);

    // extension function
    server.ext("onPreResponse", (request, h) => {
        const { response } = request;

        if (response instanceof ClientError) {
            const newResponse = h.response({
                status: "fail",
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        if (response instanceof Error) {
            const newResponse = h.response({
                status: "error",
                message: response.output.payload.message,
            });
            newResponse.code(response.output.statusCode);
            console.error(response);
            return newResponse;
        }

        return h.continue;
    });

    // start server
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
