const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// General-purpose proxy route
app.use('/api/proxy', async (req, res) => {
  try {
    const { method, url, data, params } = req.body;

    if (!method || !url) {
      return res.status(400).json({ error: 'Missing required parameters: method and url' });
    }

    const config = {
      method: method.toLowerCase(),
      url: `https://gearvn.com${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://gearvn.com/',
      },
    };

    if (['post', 'put', 'patch'].includes(config.method) && data) {
      config.data = data;
    }

    if (params) {
      config.params = params;
    }

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request);
      res.status(500).json({ error: 'No response received from the server' });
    } else {
      console.error('Error message:', error.message);
      res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
    }
  }
});

// Keep the existing productSearch endpoint for backwards compatibility
app.post('/api/productSearch', async (req, res) => {
  try {
    const { search, pageIndex, pageSize } = req.body;
    
    const response = await axios.post('https://gearvn.com/apps/gvn_search/search_products', {
      search,
      pageIndex,
      pageSize
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});