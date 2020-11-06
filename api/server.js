const express = require("express");
const app = express();

const bodyParser = require("body-parser");
let cors = require("cors");
const { corsOptions } = require("./middleware");

const connectDB = require("./config/db");
const colors = require("colors");

// const { User } = require("./models");

connectDB();

// LOAD MIDDLEWARE
app.use(bodyParser.json());
app.use(cors(corsOptions));

// ROUTE HANDLERS
app.use("/lists", require("./routes/lists.routes"));
app.use("/users", require("./routes/users.routes"));

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
