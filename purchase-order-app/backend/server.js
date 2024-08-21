const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const { default: axios } = require("axios");
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

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

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate an OAuth2 URL for authentication
app.get('/auth/google', (req, res) => {
  const { sheetUrl } = req.query;

  // Hàm trích xuất spreadsheetId từ URL Google Sheets
  const extractSpreadsheetId = (url) => {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const spreadsheetId = extractSpreadsheetId(sheetUrl);

  if (!spreadsheetId) {
    return res.status(400).send('Không tìm thấy Spreadsheet ID.');
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    state: JSON.stringify({ spreadsheetId }) // Gửi spreadsheetId qua state
  });

  res.redirect(authUrl);
});

// Xử lý callback sau khi xác thực thành công
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

  // Parse `state` để lấy lại `spreadsheetId`
  const { spreadsheetId } = JSON.parse(state);
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("tokens", tokens);
    
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    // Lấy danh sách các sheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    // Lấy tên sheet đầu tiên
    const firstSheet = spreadsheet.data.sheets[0]; // Sheet đầu tiên
    const firstSheetTitle = firstSheet.properties.title; // Lấy tên sheet
    
    // Sử dụng spreadsheetId để lấy dữ liệu từ Google Sheets
    const range = `${firstSheetTitle}!A1:R1000`; // Tùy chỉnh theo range cần lấy
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const data = response.data.values;

    // Chuyển dữ liệu về frontend qua query params hoặc session
    
    if (data.length) {
      // Gửi dữ liệu về frontend
      res.redirect(`${process.env.FRONTEND_URL}/create-purchase-order?data=${encodeURIComponent(JSON.stringify(data))}`);
    } else {
      return res.status(404).send('Không có dữ liệu trong file Google Sheets.');
    }
  } catch (error) {
    console.log("error",error);
    
    console.error('Lỗi khi xác thực hoặc lấy dữ liệu:', error);
    return res.status(500).send('Lỗi khi xác thực hoặc lấy dữ liệu.');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
