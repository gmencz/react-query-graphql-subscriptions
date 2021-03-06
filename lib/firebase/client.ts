// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app'

// Add the Firebase products that you want to use
import 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBG0y5UgN5PBuhXTzGJ1G-p8aGzVNIryjs',
  authDomain: 'chatskee-ca7cf.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: 'chatskee-ca7cf.appspot.com',
  messagingSenderId: '215273238907',
  appId: '1:215273238907:web:da580d5e8714f676100dde',
  measurementId: 'G-K6JMLT0J1Y',
}

if (!firebase.apps.length) {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)

  if (process.env.NODE_ENV !== 'production') {
    const auth = firebase.auth()
    auth.useEmulator('http://localhost:9099')
  }
}

export default firebase
