const mongoose = require("mongoose");

const connectDB = async () => {
  try {
   mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "video-carousel"
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

module.exports = connectDB;