import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Database connected Successfully ${conn.connection.host} and Databse Name ${conn.connection.name}`
        .yellow.bold
    );
  } catch (error) {
    console.log(`Connection Database Error ${error.message}`.red.bold);
    process.exit(1);
  }
};
