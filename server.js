const app = require('./app');
const connectDB = require('./db/connect');

const port = process.env.PORT || 3000;

const server = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
    const DB = process.env.DATABASE.replace(
      '<password>',
      process.env.DATABASE_PASSWORD
    );
    await connectDB(DB);
  } catch (error) {
    console.log(error);
  }
};

server();
