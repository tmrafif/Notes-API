require('dotenv').config();

const Hapi = require("@hapi/hapi");
const notes = require("./api/notes");
const NotesServices = require("./services/postgres/NotesServices");
const NotesValidator = require("./validator/notes");
const ClientError = require("./exceptions/ClientError");

const init = async () => {
    const notesServices = new NotesServices();

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
    await server.register({
        plugin: notes,
        options: {
            service: notesServices,
            validator: NotesValidator,
        },
    });

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

        return h.continue;
    });

    // start server
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
