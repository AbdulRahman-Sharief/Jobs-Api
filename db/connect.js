const mongoose = require("mongoose");

const connectDB = (DB) => {
  return mongoose.connect(
    DB,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    },
    () => {
      console.log(`Connected to DB ((${DB.split("/")[3]})) Successfully!!`);
    }
  );
};

module.exports = connectDB;
