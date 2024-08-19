const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const { default: axios } = require("axios");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/purchase-orders", require("./routes/purchaseOrders"));
app.use("/api/users", require("./routes/users"));
app.use(
  "/proxy",
  async (req, res) => {
    try {
      let path = req.headers.path;
      const data = req.body;
      
      const config = {
        method: "post",
        url: `https://gearvn.com${path}`,
        timeout: 6000,
        headers: {
          referer: "https://gearvn.com/",
        },
        data: data,
      };
      const result = await axios.request(config);
      
      return res.json(result.data)
    } catch (error) {
        console.log(error);
        
      return res.status(500).json({ message: error.message });
    }
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
