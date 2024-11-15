require("./middleware/instrument");

const http = require("http");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const routes = require("./routes");

const bodyParser = require('body-parser');
const app = express();

//sentry
const Sentry = require("@sentry/node");
// app.use(Sentry.Handlers.requestHandler());
Sentry.setupExpressErrorHandler(app);

app.get("/debug-sentry", function mainHandler(req, res) {
  try {
    // Simulasi error
    throw new Error("My first Sentry error!");
  } catch (error) {
    // Kirim error ke Sentry
    Sentry.captureException(error);
    res.status(500).json({
      status: false,
      message: "An error occurred and has been reported to Sentry.",
    });
  }
});


// app.get("/debug-sentry", function mainHandler(err, req, res) {
//   throw new Error("My first Sentry error!");
// });

// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.errorHandler());

//email

// const nodeMailer = require('nodemailer');
// const emailRoutes = require('./routes/emailRoutes');
// app.use('/api/v1/email', emailRoutes);

const nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,               // Gunakan port 465 untuk koneksi aman SSL
  secure: true,            // true untuk port 465, false untuk port lain
  auth: {
    user: process.env.EMAIL_USER,  // Ganti dengan email Anda
    pass: process.env.EMAIL_PASS              // Ganti dengan password atau app password jika menggunakan Gmail
  },
  secure: true,
});

app.post("/text-mail", (req, res) => {
  const { to, subject, text } = req.body || {};

  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const mailData = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: "<b>Hey there!</b><br>This is our first message sent with Nodemailer<br/>"
  };

  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Error sending email", error });
    }
    res.status(200).json({ message: "Mail sent", message_id: info.messageId });
  });
});




app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//imagekit
// const imageRouter = require('./routes/image');
// app.use('/api/v1', imageRouter);

//swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/openapi.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(routes);

// app.use(Sentry.Handlers.errorHandler());

// app.use((err, req, res, next) => {
//   res.status(err.status).json({
//       status: false,
//       message: err.message
//   })
// })

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
      message: err.message || "Internal Server Error"
  });
});

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}
