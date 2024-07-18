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
    phone: '',
    deviceModel: ''
  });
  const [lastFetchDate, setLastFetchDate] = useState(new Date().toDateString());

  const API_URL = 'http://localhost:5001/api';

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

  useEffect(() => {
    if (isCheckedIn) {
      fetchTodaySales();
    }
  }, [isCheckedIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      if (today !== lastFetchDate) {
        fetchTodaySales();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastFetchDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    return response.json();
  };

  const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  };

  const fetchTodaySales = async () => {
    const today = new Date().toDateString();
    if (today !== lastFetchDate) {
      setSales([]); // Reset sales if it's a new day
      setLastFetchDate(today);
    }

    if (isCheckedIn) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/sales`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch sales');
        }
        const data = await response.json();
        setSales(data);
      } catch (error) {
        console.error('Error fetching sales:', error);
        setMessage('Error fetching today\'s sales');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(formData);
      setMessage(response.message);
      setIsRegistering(false);
    } catch (error) {
      setMessage('Registration failed. Please try again.');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      setMessage(`Welcome, ${response.user.name}!`);
    } catch (error) {
      setMessage('Sign in failed. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location })
      });

      if (!response.ok) {
        throw new Error('Check-in failed');
      }

      const data = await response.json();
      setIsCheckedIn(true);
      setMessage(data.message);
      fetchTodaySales();
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage('Check-in failed. Please try again.');
    }
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setSales([]);
    setMessage('Checked out. Sales reset.');
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const saleData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        deviceModel: formData.deviceModel
      };
      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      });

      if (!response.ok) {
        throw new Error('Failed to record sale');
      }

      await fetchTodaySales(); // Refresh the sales after successful submission
      setMessage('Sale recorded successfully!');
      setFormData({ email: '', password: '', name: '', phone: '', deviceModel: '' });
    } catch (error) {
      console.error('Error recording sale:', error);
      setMessage('Failed to record sale. Please try again.');
    }
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
              <p>Sale at {new Date(sale.createdAt).toLocaleString()}</p>
              <p>Customer: {sale.customerName}</p>
              <p>Device: {sale.deviceModel}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CanvasserApp;