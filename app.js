import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6DeWkKOiynidZDftDc_aMuLuNdIB4cNQ",
  authDomain: "nisanx-otp.firebaseapp.com",
  projectId: "nisanx-otp",
  storageBucket: "nisanx-otp.firebasestorage.app",
  messagingSenderId: "315362812085",
  appId: "1:315362812085:web:08838a776d65a056e85efc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

// Auth
document.getElementById('loginBtn').onclick = () => signInWithPopup(auth, new GoogleAuthProvider());
document.getElementById('logoutBtn').onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  currentUser = user;
  document.getElementById('loginBtn').style.display = user ? 'none' : 'inline';
  document.getElementById('logoutBtn').style.display = user ? 'inline' : 'none';
  loadPosts();
});

// Load posts from Firebase
async function loadPosts() {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';

    if(snap.empty) {
      container.innerHTML = '<p style="text-align:center; color:#666;">No posts yet</p>';
      return;
    }

    snap.forEach(doc => {
      const data = doc.data();
      const div = document.createElement('div');
      div.className = 'post';
      div.innerHTML = `
        <h3>${data.title || 'No Title'}</h3>
        <div>${data.content || ''}</div>
        ${data.imageUrl ? `<img src="${data.imageUrl}" style="max-width:100%; margin-top:10px; border-radius:8px;">` : ''}
        <p style="font-size:12px; color:#666; margin-top:10px;">Posted by ${data.author || 'Anonymous'}</p>
      `;
      container.appendChild(div);
    });

  } catch(err) {
    console.error(err);
    document.getElementById('postsContainer').innerHTML = '<p style="text-align:center; color:red;">Error loading posts</p>';
  }
}
