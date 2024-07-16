import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const HandwritingRecognition = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleImageToText = () => {
    if (selectedImage) {
      setLoading(true);
      Tesseract.recognize(
        selectedImage,
        'eng',
        {
          logger: (m) => console.log(m),
        }
      ).then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      });
    }
  };

  return (
    <div>
      <h1>Handwritten Text Recognition</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {selectedImage && (
        <div>
          <img src={selectedImage} alt="Selected" style={{ width: '300px', height: 'auto' }} />
          <button onClick={handleImageToText} disabled={loading}>
            {loading ? 'Processing...' : 'Convert to Text'}
          </button>
        </div>
      )}
      {text && (
        <div>
          <h2>Extracted Text:</h2>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default HandwritingRecognition;
