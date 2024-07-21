import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/parse', { url });
      setProduct(response.data);
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
            <p>Price: {product.price}</p>
            <p>Description: {product.description}</p>
            <p>Sizes: {product.sizes.join(', ')}</p>
            <div>
              {product.images.map((img, index) => (
                <img key={index} src={img} alt={`Product ${index}`} />
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
