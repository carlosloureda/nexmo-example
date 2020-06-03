// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fetch = require('node-fetch');
require('dotenv').config()

// Declare a route
fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
})


fastify.post("/webhooks/inbound", { schema: null }, (req, reply) => {
    reply.send("inbound hook")
})

fastify.post("/webhooks/events", { schema: null }, (req, reply) => {
    reply.send("events hook")
})

fastify.post("/webhooks/status", { schema: null }, (req, reply) => {
    reply.send("status hook")
})

const createApplication = () => {
    const { NEXMO_API_KEY, NEXMO_SECRET } = process.env;
    let authToken = new Buffer(`${NEXMO_API_KEY}:${NEXMO_SECRET}`).toString('base64');


    fetch("https://api.nexmo.com/v2/applications/", {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${authToken}`
        },
        body: JSON.stringify({
            name: "ieSupport",
            public_key: "-----BEGIN PUBLIC KEY-----\
            MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuubnPa4Qsy0NBpOKOLSu\
            2muNz3PjD948pGJ8UGuOGH7r5vMaLeiyUU98Q+WAc7inwSrc1PsVEYAkxCliw5eu\
            pkOKS7JEM3b8ycGT0ou4WbOzK35WZ2nq9l6ZmsGpsFndWppiNEKQEBgQlkY+U0it\
            Fi6h+PqPp7vEcev1/xxFOkw9VQ6y+3iT7M/Rm3u9yIh896+0XP59DHO191VTlETB\
            4zH1/D8NjbjC05TCA7f2Aa1o1EUhVxw//l5PB1qunfZbnMQt9Seowe4Z3ON+vODY\
            ie6bqIzhT9Plz5b0ndqgxnc8v9yxyp2u9FpiAybf0tL1O3Oy38T4ASbqWjQcLHIn\
            cQIDAQAB\
            -----END PUBLIC KEY-----\
            ",
            capabilities: {
                messages: {
                    webhooks: {
                        inbound_url: {
                            address: "http://localhost:3000/webhooks/inbound",
                            http_method: "POST"
                        },
                        status_url: {
                            address: "http://localhost:3000/webhooks/status",
                            http_method: "POST"
                        }
                    }
                },
                rtc: {
                    webhooks: {
                        event_url: {
                            address: "http://localhost:3000/webhooks/event",
                            http_method: "POST"

                        }
                    }
                }
            }
        })
    })
        .then(response => response.json())
        .then(function (data) {
            console.log('Request succeeded with JSON response', data);
            console.log('Request succeeded with JSON response', Object.keys(data));
            // id, name, keys, capabilities, and links.self
            const applicationId = data.id;
            const applicationLink = data._links.self.href;
            console.log(`Application id: ${applicationId} and link: ${applicationLink}`);
            //   reply.send(JSON.stringify(data))
        })
        .catch(function (error) {
            console.log('Request failed', error);
            // reply.code(error.code)
            // reply.send(error.message)
        });

    // uthorization: Basic base64(API_KEY:API_SECRET)
}

createApplication()
// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()