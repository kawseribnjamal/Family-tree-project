// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDF5LTKhkZIHTqYc_d5CwUze8DpH93ze-Y",
  authDomain: "amily-tree-project.firebaseapp.com",
  projectId: "amily-tree-project",
  storageBucket: "amily-tree-project.appspot.com",
  messagingSenderId: "152670565367",
  appId: "1:152670565367:web:a56068688e1c941aac34f2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// DOM elements
const loginSection = document.getElementById("login-section");
const formSection = document.getElementById("form-section");

window.adminLogin = () => {
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginSection.style.display = "none";
      formSection.style.display = "block";
    }).catch(err => alert("Login Failed: " + err.message));
};

window.logout = () => {
  signOut(auth).then(() => {
    loginSection.style.display = "block";
    formSection.style.display = "none";
  });
};

window.addMember = async () => {
  const name = document.getElementById("name").value;
  const generation = parseInt(document.getElementById("generation").value);
  const parentId = document.getElementById("parentId").value;
  if (!name || isNaN(generation)) return alert("ফর্ম পূরণ করুন");

  await addDoc(collection(db, "family"), {
    name,
    generation,
    parentId
  });
  alert("Member added!");
};

// Visitor mode: render tree
const treeContainer = document.getElementById("tree-container");
if (treeContainer) {
  const familyCol = collection(db, "family");
  onSnapshot(familyCol, (snapshot) => {
    const members = [];
    snapshot.forEach(doc => members.push({ id: doc.id, ...doc.data() }));
    renderTree(members);
  });
}

function renderTree(members) {
  const root = members.filter(m => !m.parentId);
  const makeList = (parentId, generation) => {
    const children = members.filter(m => m.parentId === parentId);
    if (!children.length) return "";
    return `
      <ul class="generation-${generation}">
        ${children.map(child => `
          <li class="member">
            <div class="member-name">${child.name}</div>
            ${makeList(child.id, generation + 1)}
          </li>
        `).join("")}
      </ul>
    `;
  }

  treeContainer.innerHTML = `
    <ul class="family-tree generation-0">
      ${root.map(r => `
        <li class="member">
          <div class="member-name">${r.name}</div>
          ${makeList(r.id, 1)}
        </li>
      `).join("")}
    </ul>
  `;
}
