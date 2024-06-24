import React, { useEffect } from 'react';

const GeocodingPage = () => {
  const getLocation = () => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(savePosition, positionError, { timeout: 10000 });
    } else {
      // Geolocation is not supported by this browser
      alert("NOT Supported");
    }
  };

  // handle the error here
  const positionError = (error) => {
    const errorCode = error.code;
    const message = error.message;

    alert(message);
  };

  const savePosition = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log(latitude, longitude);
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div>
      <button onClick={getLocation}>Get My Location</button>
      
    </div>
  );
};

export default GeocodingPage;