const Courier = require("@trycourier/courier");

const limitReached = async (email, mobile, limit) => {
  const courier = Courier.CourierClient({ authorizationToken: process.env.COURIER_AUTH_TOKEN });

  const { requestId } = await courier.send({
    message: {
      to: {
        email: email,
        phone_number: mobile,
      },
      content: {
        title: "Verify your email",
        body: `You have reached your monthly limit of ₹${limit}`,
      },
      routing: {
        method: "all",
        channels: ["email", "sms"],
      },
    },
  });
  console.log(requestId);
  return requestId;
};

module.exports = limitReached;
