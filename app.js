import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, startAfter,
  doc, updateDoc, deleteDoc, where }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6DeWkKOiynidZDftDc_aMuLuNdIB4cNQ",
  authDomain: "nisanx-otp.firebaseapp.com",
  databaseURL: "https://nisanx-otp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nisanx-otp",
  storageBucket: "nisanx-otp.firebasestorage.app",
  messagingSenderId: "315362812085",
  appId: "1:315362812085:web:08838a776d65a056e85efc",
  measurementId: "G-4HW6F2C2XV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let quill = new Quill('#editor', { theme: 'snow' });
let lastDoc = null;
let currentUser = null;

// Dark/Light Mode
const themeToggle = document.getElementById('themeToggle');
themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light'? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'light'? '🌙' : '☀️';
};
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');

// Auth
document.getElementById('loginBtn').onclick = () => signInWithPopup(auth, new GoogleAuthProvider());
document.getElementById('logoutBtn').onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  currentUser = user;
  document.getElementById('loginBtn').style.display = user? 'none' : 'inline';
  document.getElementById('logoutBtn').style.display = user? 'inline' : 'none';
  document.getElementById('uploadBtn').style.display = user? 'inline' : 'none';
  document.getElementById('profileBtn').style.display = user? 'inline' : 'none';
  loadPosts();
});

// Modal open/close
document.getElementById('uploadBtn').onclick = () => {
  document.getElementById('uploadModal').style.display = 'flex';
};
window.closeModal = () => {
  document.getElementById('uploadModal').style.display = 'none';
  document.getElementById('postTitle').value = '';
  quill.root.innerHTML = '';
  document.getElementById('imageUpload').value = '';
};

// Upload Post with Image
document.getElementById('submitPost').onclick = async () => {
  const title = document.getElementById('postTitle').value;
  const content = quill.root.innerHTML;
  const file = document.getElementById('imageUpload').files[0];

  let imageUrl = '';

  try {
    if(file) {
      const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, 'posts'), {
      title,
      content,
      imageUrl,
      uid: currentUser.uid,
      author: currentUser.displayName,
      createdAt: Date.now(),
      likes: 0
    });

    closeModal();
    loadPosts();
    alert('Post done!');

  } catch(err) {
    console.error(err);
    alert('Error: ' + err.message);
  }
};

// Load Posts with Pagination & Search
async function loadPosts() {
  const search = document.getElementById('searchBox').value;
  let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));

  const snap = await getDocs(q);
  lastDoc = snap.docs[snap.docs.length-1];

  document.getElementById('postsContainer').innerHTML = '';
  snap.forEach(doc => renderPost(doc.id, doc.data()));

  document.getElementById('loadMore').style.display = snap.size === 10? 'block' : 'none';
}

// Load More
document.getElementById('loadMore').onclick = async () => {
  if(!lastDoc) return;
  let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(10));
  const snap = await getDocs(q);
  lastDoc = snap.docs[snap.docs.length-1];
  snap.forEach(doc => renderPost(doc.id, doc.data()));
  document.getElementById('loadMore').style.display = snap.size === 10? 'block' : 'none';
};

// Edit/Delete
window.deletePost = async (id, uid) => {
  if(uid!== currentUser?.uid) return alert('Not allowed');
  if(confirm('Delete this post?')) {
    await deleteDoc(doc(db, 'posts', id));
    loadPosts();
  }
};

// Profile button
document.getElementById('profileBtn').onclick = () => {
  window.location.href = `profile.html?uid=${currentUser.uid}`;
};

// Search on type
document.getElementById('searchBox').oninput = loadPosts;

// Render post with blink effect
function renderPost(id, data) {
  const postsContainer = document.getElementById('postsContainer');

  const postDiv = document.createElement('div');
  postDiv.className = 'post blink'; // blink add korlam
  postDiv.style.background = 'transparent'; // background transparent
  postDiv.style.border = '1px solid #7db8ff33'; // border only

  postDiv.innerHTML = `
    <h3 class="blink">${data.title}</h3>
    <div class="blink">${data.content}</div>
    ${data.imageUrl? `<img src="${data.imageUrl}" style="max-width:100%; border-radius:8px; margin-top:10px;">` : ''}
    <p style="font-size:12px; opacity:0.7;" class="blink">Posted by ${data.author}</p>
    ${currentUser && currentUser.uid === data.uid?
      `<button onclick="deletePost('${id}', '${data.uid}')">Delete</button>` : ''}
  `;

  postsContainer.appendChild(postDiv);
}
