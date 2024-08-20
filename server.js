require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./db/connect");


const PORT = process.env.PORT;

const start = async () => {
  try {
      const mongoURL = 
      process.env.NODE_ENV === 'production'
        ? process.env.MONGO_URL // use production MONGO DB
        : process.env.DEV_MONGO_URL // use dev MONGO DB
        
      await connectDB(mongoURL)

      app.listen(PORT, () => {
          console.log(`Server Running on PORT: ${PORT}`)
      })
  } 
  catch (error) {
      console.log(error, "What went Wrong?")
  }
}

start();