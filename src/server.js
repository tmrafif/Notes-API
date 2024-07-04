require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

// notes
const notes = require("./api/notes");
const NotesServices = require("./services/postgres/NotesServices");
const NotesValidator = require("./validator/notes");

// users
const users = require("./api/users");
const UsersServices = require("./services/postgres/UsersServices");
const UsersValidator = require("./validator/users");

// authentications
const authentications = require("./api/authentications");
const AuthenticationsServices = require("./services/postgres/AuthenticationsServices");
const AuthenticationsValidator = require("./validator/authentications");
const TokenManager = require("./tokenize/TokenManager");

const ClientError = require("./exceptions/ClientError");

const init = async () => {
    // services
    const notesServices = new NotesServices();
    const usersServices = new UsersServices();
    const authenticationsServices = new AuthenticationsServices();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ["*"],
            },
        },
    });

    // register external plugin
    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    // define authentications strategy
    server.auth.strategy("notesapp_jwt", "jwt", {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
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
        {
            plugin: authentications,
            options: {
                authenticationsService: authenticationsServices,
                usersService: usersServices,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
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
