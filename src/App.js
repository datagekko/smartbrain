import React, { useState } from 'react';
import './App.css';
import ParticlesBg from 'particles-bg';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const initialState = {
  imageURL: '',
  box: {
    leftCol: null,
    topRow: null,
    rightCol: null,
    bottomRow: null,
  },
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  },
};

function App() {
  // Use the useState hook to create state variables in functional components
  const [imageURL, setImageURL] = useState(initialState.imageURL);
  const [box, setBox] = useState(initialState.box);
  const [route, setRoute] = useState(initialState.route);
  const [isSignedIn, setIsSignedIn] = useState(initialState.isSignedIn);
  const [user, setUser] = useState(initialState.user);

  const loadUser = (data) => {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    });
  }

  const resetState = () => {
    setImageURL(initialState.imageURL);
    setBox(initialState.box);
    setRoute(initialState.route);
    setIsSignedIn(initialState.isSignedIn);
    setUser(initialState.user);
  };

  const calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height),
      }
  }

  const displayFaceBox = (box) => {
    setBox(box); 
  }

  const onInputChange = (event) => {
    console.log(event.target.value); // Log the value of the input, not the event object
    setImageURL(event.target.value);
  }

  const onButtonSubmit = async () => {
    setImageURL(imageURL);
    fetch('https://smartbrain-api-7prp.onrender.com/imageurl', {
              method: 'post',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  imageURL: imageURL
              })
            })
    .then(response => response.json())
    .then(data => {
      if (data && data.outputs) {
        const faceLocation = calculateFaceLocation(data);
        displayFaceBox(faceLocation);
        // Update user entries only if face detection is successful
        updateUserEntries();
      }
    })
    .catch(error => console.error('Error fetching the Clarifai API:', error));
  };

  const updateUserEntries = () => {
    fetch('https://smartbrain-api-7prp.onrender.com/image', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id })
    })
    .then(response => response.json())
    .then(count => {
      setUser(Object.assign(user, { entries: count }));
    })
    .catch(error => console.error('Error updating user entries:', error));
  };

const onRouteChange = (route) => {
  if (route === 'signout') {
    resetState();
  } else if (route === 'home') {
    setIsSignedIn(true)
  }
  setRoute(route);
}

  return (
    <div className="App">
      <ParticlesBg className="particles" type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      { route === 'home' 
        ? <div>
            <Logo/>
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm 
              onInputChange={onInputChange}
              onButtonSubmit={onButtonSubmit}
            />
            <FaceRecognition box={box} imageURL={imageURL}/>
          </div>
        : (
          route === 'signin' 
          ? <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
          : <Register loadUser={loadUser} onRouteChange={onRouteChange}/>
        )
      }
    </div>
  );
}

export default App;