import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [img, setImg] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractIdFromUrl = (url) => {
    const idMatch = url.match(/\/products\/([^/]+)\//);
    return idMatch ? idMatch[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productId = extractIdFromUrl(url);
    if (!productId) {
      alert('Invalid URL format');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://easytask-backend-production.up.railway.app/parse', { url });
      setProduct(response.data);
      setImg(response.data.images[0]);

      const priceResponse = await axios.get(`https://easytask-backend-production.up.railway.app/api/${productId}`);
      const l2Id = priceResponse.data.result.l2s[0].l2Id;
      const priceData = priceResponse.data.result.prices[l2Id];
      const stockStatus = priceResponse.data.result.stocks[l2Id].statusCode;
      const backInStock = priceResponse.data.result.stocks[l2Id].backInStock;

      setProductDetails({
        price: priceData.base.value,
        stockStatus,
        backInStock,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching product data', error);
      setLoading(false);
    }
  };

  return (
    <div className="">
      <header className="max-w-4xl mx-auto p-5 bg-gray-100">
        <h1 className="text-3xl font-medium mb-5">Yerzhan Karatayev для вас =)</h1>
        <form onSubmit={handleSubmit} className="mb-5 w-full">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Uniqlo product URL"
            className="p-2 border border-gray-300 rounded w-[90%] mb-3"
          />
          <button type="submit" className="p-2 bg-red-500 w-[10%] text-white rounded">
            Parse
          </button>
        </form>
        {loading ? (
          <div className="product-container max-w-4xl mx-auto p-5 bg-white rounded shadow">
            <div className="skeleton h-10 w-1/2 mb-5 bg-gray-200 rounded"></div>
            <div className="product-main flex mb-5">
              <div className="product-images flex-1 grid grid-cols-3 gap-2">
                <div className="skeleton w-full h-40 bg-gray-200 rounded"></div>
                <div className="skeleton w-full h-40 bg-gray-200 rounded"></div>
                <div className="skeleton w-full h-40 bg-gray-200 rounded"></div>
              </div>
              <div className="product-info flex-1 p-5 pt-0 border-l border-gray-300">
                <div className="skeleton w-full h-64 mb-2 bg-gray-200 rounded"></div>
                <div className="skeleton h-10 w-1/3 mb-5 bg-gray-200 rounded"></div>
                <div className="skeleton h-10 w-1/4 mb-5 bg-gray-200 rounded"></div>
                <div className="skeleton h-10 w-1/4 mb-5 bg-gray-200 rounded"></div>
                <div className="skeleton h-10 w-1/2 mb-5 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="skeleton h-20 w-full mb-5 bg-gray-200 rounded"></div>
            <div className="skeleton h-40 w-full bg-gray-200 rounded"></div>
          </div>
        ) : (
          product && (
            <div className="product-container max-w-4xl mx-auto p-5 bg-white rounded shadow">
              <h2 className="text-2xl font-bold mb-5">{product.title}</h2>
              <div className="product-main flex mb-5">
                <div className="product-images flex-1 grid grid-cols-3 gap-2">
                  {product.images.map((img, index) => (
                    <img key={index} src={img} onClick={() => setImg(img)} alt={`Product ${index}`} className="w-full h-auto cursor-pointer" />
                  ))}
                </div>
                <div className="product-info flex-1 p-5 pt-0 border-l border-gray-300">
                  <img src={img} alt="" className="w-full h-[400px] mb-2 object-contain" />
                  <p className="text-3xl text-red-500 mb-5">
                    {productDetails ? (
                      productDetails.stockStatus === "OUT_STOCK" ? (
                        <span>Товар нет в наличии</span>
                      ) : (
                        <span>{(productDetails.price * 3.02).toFixed(2)}₸ <span className="text-black text-[25px]">/ {productDetails.price}¥</span></span>
                      )
                    ) : 'Loading...'}
                  </p>
                  <div className="product-select mb-5">
                    <label htmlFor="color" className="block mb-2">Цвет</label>
                    <div className="flex space-x-2">
                      {product.colors.map((color, index) => (
                        <div key={index} className={`p-1 border ${selectedColor === color.name ? 'border-black' : 'border-gray-300'} rounded-full cursor-pointer`} onClick={() => setSelectedColor(color.name)}>
                          <img src={color.src} alt={color.name} className="w-8 h-8 rounded-full" />
                        </div>
                      ))}
                    </div>
                    {selectedColor && (
                      <span className="mt-2 block text-gray-600">
                        {product.colors.find(color => color.name === selectedColor).name}: {product.colors.find(color => color.name === selectedColor).count}
                      </span>
                    )}
                  </div>
                  <div className="product-select mb-5">
                    <label htmlFor="size" className="block mb-2">Размер</label>
                    <select id="size" className="p-2 border border-gray-300 rounded w-full">
                      {product.sizes.map((size, index) => (
                        <option key={index} value={size}>{size.replace(' (unavailable)', '')}</option>
                      ))}
                    </select>
                  </div>
                  <p className="stock-status mt-5 text-red-500">
                    {productDetails ? (productDetails.backInStock ? 'Можно сделать возврат' : 'Товар возврату не подлежит') : 'Loading...'}
                  </p>
                </div>
              </div>
              <div className="product-description mb-5">
                <p>{product.description}</p>
              </div>
              <div className="product-videos">
                {product.videos.map((video, index) => (
                  <video key={index} loop autoPlay muted style={{ pointerEvents: 'none' }} className="w-full mb-2">
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ))}
              </div>
            </div>
          )
        )}
      </header>
    </div>
  );
}

export default App;
