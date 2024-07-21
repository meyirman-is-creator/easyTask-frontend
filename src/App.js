import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  const extractIdFromUrl = (url) => {
    const idMatch = url.match(/\/products\/([^/]+)\//);
    return idMatch ? idMatch[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productId = extractIdFromUrl(url);
    if (!productId) {
      alert('Invalid URL format');
      return;
    }

    try {
      // Get product details from backend
      const response = await axios.post('http://localhost:3001/parse', { url });
      console.log(response)
      setProduct(response.data);

      // Get price and stock data
      const priceResponse = await axios.get(`http://localhost:3001/api/${productId}`);
      const l2Id = priceResponse.data.result.l2s[0].l2Id;
      const priceData = priceResponse.data.result.prices[l2Id];
      const stockStatus = priceResponse.data.result.stocks[l2Id].statusCode;
      const backInStock = priceResponse.data.result.stocks[l2Id].backInStock;

      setProductDetails({
        price: `${priceData.base.currency.symbol} ${priceData.base.value}`,
        stockStatus,
        backInStock,
      });
    } catch (error) {
      console.error('Error fetching product data', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Uniqlo Product Parser</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Uniqlo product URL"
          />
          <button type="submit">Parse</button>
        </form>
        {product && (
          <div>
            <h2>{product.title}</h2>
            <p>Description: {product.description}</p>
            <p>Sizes: 
              <select>
                {product.sizes.map((size, index) => (
                  <option key={index} value={size}>{size}</option>
                ))}
              </select>
            </p>
            <div>
              {product.images.map((img, index) => (
                <img key={index} src={img} alt={`Product ${index}`} />
              ))}
            </div>
            <div>
              {product.videos.map((video, index) => (
                <video key={index} controls>
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
            {productDetails && (
              <div>
                <p>Price: {productDetails.price}</p>
                <p>Status: {productDetails.stockStatus}</p>
                <p>{productDetails.backInStock ? 'Back in Stock' : 'Not available'}</p>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
