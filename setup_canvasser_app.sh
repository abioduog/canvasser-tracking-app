#!/bin/bash

# Create project directory and navigate into it
mkdir canvasser-tracking-app
cd canvasser-tracking-app

# Initialize npm project
npm init -y

# Install dependencies
npm install react react-dom react-scripts tailwindcss@latest postcss@latest autoprefixer@latest

# Create project structure
mkdir -p public src

# Create public/index.html
cat > public/index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Canvasser Tracking App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
EOL

# Create src/index.js
cat > src/index.js << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
EOL

# Create src/index.css
cat > src/index.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

# Create src/App.js
cat > src/App.js << EOL
import React, { useState, useEffect } from 'react';

const CanvasserApp = () => {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [sales, setSales] = useState([]);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const simulateBackendCall = (action, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (action === 'register') {
          resolve({ success: true, message: 'Registration successful. Please sign in.' });
        } else if (action === 'login') {
          resolve({ success: true, user: { email: data.email, name: 'John Doe' } });
        } else if (action === 'checkIn') {
          resolve({ success: true, message: 'Checked in successfully.' });
        } else {
          reject({ success: false, message: 'Unknown action' });
        }
      }, 1000);
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await simulateBackendCall('register', formData);
      setMessage(response.message);
      setIsRegistering(false);
    } catch (error) {
      setMessage('Registration failed. Please try again.');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await simulateBackendCall('login', formData);
      setUser(response.user);
      setMessage(\`Welcome, \${response.user.name}!\`);
    } catch (error) {
      setMessage('Sign in failed. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await simulateBackendCall('checkIn', { user, location });
      setIsCheckedIn(true);
      setMessage(response.message);
    } catch (error) {
      setMessage('Check-in failed. Please try again.');
    }
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setSales([]);
    setMessage('Checked out. Sales reset.');
  };

  const handleSaleSubmit = (e) => {
    e.preventDefault();
    const newSale = {
      timestamp: new Date().toLocaleString(),
      customerDetails: { ...formData }
    };
    setSales(prevSales => [...prevSales, newSale]);
    setFormData({ email: '', password: '', name: '', phone: '' });
    setMessage('Sale recorded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const renderAuthForm = () => (
    <form onSubmit={isRegistering ? handleRegister : handleSignIn} className="mb-4">
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email Address"
        className="mt-2 p-2 w-full border rounded"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Password"
        className="mt-2 p-2 w-full border rounded"
        required
      />
      {isRegistering && (
        <>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="mt-2 p-2 w-full border rounded"
            required
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="mt-2 p-2 w-full border rounded"
            required
          />
        </>
      )}
      <button
        type="submit"
        className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        {isRegistering ? 'Register' : 'Sign In'}
      </button>
    </form>
  );

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Canvasser Tracking App</h1>
      
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {!user ? (
        <>
          {renderAuthForm()}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            {isRegistering ? 'Already have an account? Sign In' : 'New user? Register'}
          </button>
        </>
      ) : !isCheckedIn ? (
        <button
          onClick={handleCheckIn}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          disabled={!location}
        >
          {location ? 'Check In' : 'Getting location...'}
        </button>
      ) : (
        <>
          <form onSubmit={handleSaleSubmit} className="mb-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Customer Name"
              className="mt-2 p-2 w-full border rounded"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="mt-2 p-2 w-full border rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="mt-2 p-2 w-full border rounded"
              required
            />
            <input
              type="text"
              name="deviceModel"
              value={formData.deviceModel}
              onChange={handleInputChange}
              placeholder="Device Model"
              className="mt-2 p-2 w-full border rounded"
              required
            />
            <button
              type="submit"
              className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Record Sale
            </button>
          </form>
          
          <button
            onClick={handleCheckOut}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Check Out
          </button>
        </>
      )}

      {isCheckedIn && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Today's Sales: {sales.length}</h2>
          {sales.map((sale, index) => (
            <div key={index} className="mt-2 text-sm">
              <p>Sale at {sale.timestamp}</p>
              <p>Customer: {sale.customerDetails.name}</p>
              <p>Device: {sale.customerDetails.deviceModel}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CanvasserApp;
EOL

# Create tailwind.config.js
cat > tailwind.config.js << EOL
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# Create postcss.config.js
cat > postcss.config.js << EOL
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Update package.json scripts
npm pkg set scripts.start="react-scripts start"
npm pkg set scripts.build="react-scripts build"
npm pkg set scripts.test="react-scripts test"
npm pkg set scripts.eject="react-scripts eject"

# Add browser list to package.json
npm pkg set browserslist.production[0]=">0.2%"
npm pkg set browserslist.production[1]="not dead"
npm pkg set browserslist.production[2]="not op_mini all"
npm pkg set browserslist.development[0]="last 1 chrome version"
npm pkg set browserslist.development[1]="last 1 firefox version"
npm pkg set browserslist.development[2]="last 1 safari version"

# Start the development server
echo "Setup complete. Starting the development server..."
npm start