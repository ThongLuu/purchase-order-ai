# Purchase Order Management System

This application is designed for procurement managers to create, track, and verify purchase orders, streamlining the procurement process and ensuring order accuracy.

## Features

- Create and manage purchase orders
- Track purchase order status
- Verify received orders
- User authentication and authorization
- Dashboard for overview of purchase orders

## Technologies Used

- Backend: Node.js with Express.js
- Frontend: React.js with PrimeReact
- Database: MongoDB

## Prerequisites

- Node.js (v14 or later)
- MongoDB

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/purchase-order-app.git
   cd purchase-order-app
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the `backend` directory with the following content:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost/purchase_order_db
   JWT_SECRET=your_jwt_secret
   ```
   Replace `your_jwt_secret` with a secure random string.

## Running the Application

1. Start MongoDB:
   Make sure your MongoDB server is running.

2. Start the backend server:
   ```
   cd backend
   npm start
   ```

3. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Register a new user account or log in with existing credentials
2. Use the dashboard to view and manage purchase orders
3. Create new purchase orders using the "Create Purchase Order" form
4. Track and update the status of existing purchase orders
5. Verify received orders and record any discrepancies

## Troubleshooting

If you encounter any issues while setting up or running the application, please check the following:

1. Make sure MongoDB is installed and running on your system.
2. Ensure all dependencies are installed by running `npm install` in both the `backend` and `frontend` directories.
3. Check that the `.env` file is properly configured in the `backend` directory with all required variables.
4. If you're having issues with the frontend, try clearing your browser cache or using an incognito/private browsing window.
5. Make sure you're using a compatible version of Node.js (v14 or later).
6. If you encounter any "Module not found" errors, try deleting the `node_modules` folder and running `npm install` again in both the backend and frontend directories.

If you're still experiencing issues, please check the console output for any error messages and refer to them for more specific troubleshooting steps.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.