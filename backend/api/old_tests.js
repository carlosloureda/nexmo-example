// TODO: en vez de crearla recuperarla del dashboard porque se duplican y crean multiples ...
const createApplication = () => {
  fetch("https://api.nexmo.com/v2/applications/", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authToken}`,
    },
    body: JSON.stringify({
      name: "ieSupport",
      public_key: publicKEY,
      capabilities: {
        messages: {
          webhooks: {
            inbound_url: {
              address: "http://localhost:3000/webhooks/inbound",
              http_method: "POST",
            },
            status_url: {
              address: "http://localhost:3000/webhooks/status",
              http_method: "POST",
            },
          },
        },
        rtc: {
          webhooks: {
            event_url: {
              address: "http://localhost:3000/webhooks/event",
              http_method: "POST",
            },
          },
        },
      },
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      console.log("Request succeeded with JSON response", data);
      console.log("Request succeeded with JSON response", Object.keys(data));
      // id, name, keys, capabilities, and links.self
      applicationId = data.id;
      applicationLink = data._links.self.href;
      console.log(
        `Application id: ${applicationId} and link: ${applicationLink}`
      );
      //   reply.send(JSON.stringify(data))
    })
    .catch(function (error) {
      console.log("Request failed", error);
      // reply.code(error.code)
      // reply.send(error.message)
    });

  // uthorization: Basic base64(API_KEY:API_SECRET)
};

const getApplication = async (id) => {
  try {
    let response = await fetch(`https://api.nexmo.com/v2/applications/${id}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`,
      },
    });
    let data = await response.json();
    applicationId = data.id;
    applicationLink = data._links.self.href;
    console.log(
      `Application id: ${applicationId} and link: ${applicationLink}`
    );
  } catch (error) {
    console.log("--> Request failed", error.message);
    // console.log('--> Request failed', error.type);
  }
};
