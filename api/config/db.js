// This file will handle connection project to mongoDB
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb://localhost:27017/TaskManager",
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
    console.log(
      `MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`
        .yellow.bold
    );
  } catch (err) {
    console.log(`Error: ${err.message}`.red);
    process.exit(1);
  }
};

module.exports = connectDB;
