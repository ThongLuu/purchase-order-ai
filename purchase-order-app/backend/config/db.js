const mongoose = require('mongoose');

// Set the strictQuery option to suppress the deprecation warning
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://thong:Yamato13@cluster-mongo-test.uleeww8.mongodb.net/?retryWrites=true&w=majority&appName=cluster-mongo-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;