const moment = require("moment");

const Courier = require("@trycourier/courier");

const verifyEmail = async (minutes, id, email) => {
  const auth_link_expiry = moment().utc().add(minutes, "minutes").format("YYYY-MM-DDTHH:mm:ss");

  const courier = Courier.CourierClient({ authorizationToken: process.env.COURIER_AUTH_TOKEN });

  const { requestId } = await courier.send({
    message: {
      to: {
        email: email,
      },
      content: {
        title: "Verify your email",
        body: `Verify your email by clicking this link. Link expires in 30 minutes. ${process.env.FRONT_END_URL}/verify/${id}?ex=${auth_link_expiry}`,
      },
      routing: {
        method: "all",
        channels: ["email"],
      },
    },
  });
  return requestId;
};

module.exports = verifyEmail;
