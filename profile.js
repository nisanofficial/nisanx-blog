import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig); // same config as app.js
const db = getFirestore(app);

const uid = new URLSearchParams(window.location.search).get('uid');

async function loadUserPosts() {
  const q = query(collection(db, 'posts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    document.getElementById('userPosts').innerHTML += `<div class="post">${doc.data().title}</div>`;
  });
}
loadUserPosts();
