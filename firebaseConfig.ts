import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 這是從你的截圖中提取的真實設定
const firebaseConfig = {
  apiKey: "AIzaSyB0abQmyf4vALgQ3XNM_we5B0JCfrteZ4I",
  authDomain: "mindtreehk.firebaseapp.com",
  projectId: "mindtreehk",
  storageBucket: "mindtreehk.firebasestorage.app",
  messagingSenderId: "326871687350",
  appId: "1:326871687350:web:92ce082c58f80ef74b8617",
  measurementId: "G-R6TVNF43T4"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出資料庫功能，讓其他檔案 (AppContext) 可以使用
export const db = getFirestore(app);
