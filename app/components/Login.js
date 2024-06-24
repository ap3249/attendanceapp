import React, { useState, useRef } from 'react'
import { uploadImageLogin } from '../lib/action';
// import path from 'path';
import * as faceapi from 'face-api.js';
import { db } from '@/firebase';
import { collection, doc, getDocs, updateDoc,arrayUnion } from 'firebase/firestore';


export const Login = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleLoginClick = () => {
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

  const markAttendance = async (employeeId) => {
    try {
      const querySnapshot = await getDocs(collection(db, "attendance"));
      let employeeDocId = null;

      querySnapshot.forEach((doc) => {
        if (doc.data().employeeId === employeeId) {
          employeeDocId = doc.id;
        }
      });

      if (employeeDocId) {
        const employeeDocRef = doc(db, "attendance", employeeDocId);
        await updateDoc(employeeDocRef, {
          attendance: arrayUnion(new Date())
        });
        console.log("Attendance updated for employee ID: ", employeeId);
      } else {
        console.log("Employee not found");
      }
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };


  const handleFaceMatching = async (imagePath1, employeeId) => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');


    // const imagePath1 = '/images/test_img.jpg';
    const imagePath2 = '/random.jpg';

    // Load images
    const image1 = await faceapi.fetchImage(imagePath1);
    const image2 = await faceapi.fetchImage(imagePath2);
    const detection1 = await faceapi.detectSingleFace(image1).withFaceLandmarks().withFaceDescriptor();
    const detection2 = await faceapi.detectSingleFace(image2).withFaceLandmarks().withFaceDescriptor();

    if (!detection1 || !detection2) {
      alert('Faces not detected in one or both images.');
      return;
    }

    const faceMatcher = new faceapi.FaceMatcher([{ descriptor: detection1.descriptor, label: 'Image 1' }]);
    const match = faceMatcher.findBestMatch(detection2.descriptor);
    if (match.label != 'unknown') {
      markAttendance(employeeId)
      return true;
    }
    return false;
  };

  const generateRandomString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const handleCapture = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasRef.current.toBlob(blob => {
      const fileName = `random.jpg`; // Unique filename without numbers
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      setCapturedImage(file);
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }, 'image/jpeg');
    setIsDisabled(false);
  };

  const handleClose = () => {
    setShowCamera(false);
    setIsDisabled(true);
    handleFaceMatching()
  };

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (capturedImage) {
      formData.append('img', capturedImage);
    } else if (file) {
      formData.append('img', file);
    }
    await uploadImageLogin(formData);

    const attendanceCollectionRef = collection(db, "attendance");

    // Fetch all documents in the "attendance" collection
    const querySnapshot = await getDocs(attendanceCollectionRef);

    // Loop through the documents and print the employeeId
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      console.log(`Employee ID: ${data.employeeId}`);
      
      let imagePath1 = `/images/${data.employeeId}.jpg`;
      let resp = await handleFaceMatching(imagePath1, data.employeeId);
      
      if (resp === true) {
        break; 
      }
    }
    setShowCamera(false)
  };

  return (
    <>
      <a href="#" onClick={handleLoginClick} className="block py-2 px-16 inside-padding-hamburger mt-2 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500">Login</a>
      {showCamera && (
        <form onSubmit={submit} className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-4 rounded-lg">
            <video ref={videoRef} autoPlay className="w-full h-auto mb-4" />
            <canvas ref={canvasRef} width="640" height="480" className="hidden" />
            <button type="button" onClick={handleCapture} className="block py-2 px-4 bg-blue-700 text-white rounded mb-4">Capture Photo</button>
            <button
              type="submit"
              className={`block py-2 px-4 rounded mb-4 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 text-white'}`}
              disabled={isDisabled}
            >
              Mark Attendance
            </button>
            <button onClick={handleClose} className="block py-2 px-4 bg-red-700 text-white rounded">Close</button>
          </div>
        </form>
      )}
    </>
  )
}