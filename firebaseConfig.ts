import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: 請去 Firebase Console > Project Settings > General > Your apps
// 把那邊的 config 複製過來替換下面這些內容
const firebaseConfig = {
  apiKey: "AIzaSy...",  
  authDomain: "mindtree-hk.firebaseapp.com", 
  projectId: "mindtree-hk", 
  storageBucket: "mindtree-hk.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
