"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/firebase'; // Ensure this path is correct
import { addDoc, collection } from "firebase/firestore"; 
import { Login } from './Login';
import { uploadImage } from '../lib/action';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(savePosition, positionError, { timeout: 10000 });
    } else {
      alert("Geolocation is not supported by this browser");
    }
  };

  const positionError = (error) => {
    const message = error.message;
    alert(message);
  };

  const savePosition = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const userLocation = { latitude, longitude };
    const officeLocation = { latitude: 28.548706, longitude: 77.218860 }; // Example coordinates, update accordingly

    const distance = haversineDistance(userLocation, officeLocation);
    console.log(`Distance to office: ${distance} meters`);

    if (distance <= 150) {
      setIsAuthorized(true);
    }
  };

  const haversineDistance = (coords1, coords2) => {
    function toRad(x) {
      return x * Math.PI / 180;
    }

    const R = 6371e3; // Earth’s mean radius in meters
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLong = toRad(coords2.longitude - coords1.longitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(coords1.latitude)) * Math.cos(toRad(coords2.latitude)) *
              Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;

    return d;
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleRegisterClick = () => {
    setShowCamera(true);
    startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  const handleCapture = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasRef.current.toBlob(blob => {
      const file = new File([blob], `${employeeId}.jpg`, { type: 'image/jpeg' });
      setCapturedImage(file);
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }, 'image/jpeg');
  };

  const generateRandomString = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    let imageName;
    if (capturedImage) {
      imageName = `${employeeId}.jpg`;
      formData.append('img', new File([capturedImage], imageName, { type: 'image/jpeg' }));
    } else if (file) {
      imageName = `${generateRandomString()}.jpg`;
      formData.append('img', new File([file], imageName, { type: 'image/jpeg' }));
    }
    
    await uploadImage(formData);
    
    try {
      const docRef = await addDoc(collection(db, "attendance"), {
        employeeId: employeeId,
        name: name,
        timestamp: new Date(),
        photo: capturedImage ? URL.createObjectURL(new File([capturedImage], imageName, { type: 'image/jpeg' })) : null,
        attendance: []
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    
    setEmployeeId('');
    setName('');
    setCapturedImage(null);
    setShowCamera(false)
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">NHSRCL</span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button onClick={handleToggle} type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-sticky" aria-expanded={isOpen}>
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>
          <div className={`items-center justify-between ${isOpen ? 'flex' : 'hidden'} w-full md:flex md:w-auto md:order-1`} id="navbar-sticky">
            <ul className="flex flex-col py-4 padding-hamburger md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <a href="#" onClick={handleRegisterClick} className="block py-2 px-16 inside-padding-hamburger text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" aria-current="page">Register Employee</a>
              </li>
              <li>
                {isAuthorized ? (
                  <Login/>
                ) : (
                  <p className="block py-2 px-16 inside-padding-hamburger mt-2 text-red-500 bg-gray-200 rounded md:bg-transparent md:text-red-500 md:p-0 md:dark:text-red-500">You are not within the allowed range</p>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {showCamera && (
        <form onSubmit={submit} className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-4 rounded-lg">
            <video ref={videoRef} autoPlay className="w-full h-auto mb-4" />
            <canvas ref={canvasRef} width="640" height="480" className="hidden" />
            <button type="button" onClick={handleCapture} className="block py-2 px-4 bg-blue-700 text-white rounded mb-4">Capture Photo</button>
            <input 
              type="text" 
              placeholder="Employee ID" 
              value={employeeId} 
              onChange={(e) => setEmployeeId(e.target.value)} 
              className="block w-full p-2 border border-gray-300 rounded mb-4 text-black"  
              required 
            />
            <input 
              type="text" 
              placeholder="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="block w-full p-2 border border-gray-300 rounded mb-4 text-black"  
              required 
            />
            <button type="submit" className="block py-2 px-4 bg-blue-700 text-white rounded mb-4">Upload</button>
            <button onClick={() => setShowCamera(false)} className="block py-2 px-4 bg-red-700 text-white rounded">Close</button>
          </div>
        </form>
      )}
    </>
  );
};

export default Navbar;
