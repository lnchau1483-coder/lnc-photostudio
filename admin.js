// admin.js
const GITHUB_API = "https://api.github.com";
let siteData = null;
let changedImages = {}; // Store base64 of changed images { "images/hero.jpg": "base64..." }

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const adminForm = document.getElementById('adminForm');
const loadingIndicator = document.getElementById('loadingIndicator');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const saveBtn = document.getElementById('saveBtn');
const loginError = document.getElementById('loginError');
const githubTokenInput = document.getElementById('githubToken');
const githubRepoInput = document.getElementById('githubRepo');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('lnc_github_token');
  const repo = localStorage.getItem('lnc_github_repo');
  
  if (token && repo) {
    githubTokenInput.value = token;
    githubRepoInput.value = repo;
    login(token, repo);
  }
});

// Navigation Logic
document.querySelectorAll('.sidebar__nav .nav-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.sidebar__nav .nav-item').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    const target = e.currentTarget.getAttribute('data-target');
    document.querySelectorAll('.form-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`section-${target}`).classList.add('active');
  });
});

// Login Logic
loginBtn.addEventListener('click', () => {
  const token = githubTokenInput.value.trim();
  const repo = githubRepoInput.value.trim();
  if (!token || !repo) {
    loginError.textContent = "Vui lòng nhập Token và Tên Repository.";
    return;
  }
  login(token, repo);
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('lnc_github_token');
  dashboard.style.display = 'none';
  loginScreen.style.display = 'flex';
});

async function login(token, repo) {
  loginBtn.disabled = true;
  loginBtn.textContent = "Đang kiểm tra...";
  loginError.textContent = "";

  try {
    // Check if token is valid
    const userRes = await fetch(`${GITHUB_API}/user`, {
      headers: { 'Authorization': `token ${token}` }
    });
    
    if (!userRes.ok) throw new Error("Token không hợp lệ hoặc đã hết hạn.");

    localStorage.setItem('lnc_github_token', token);
    localStorage.setItem('lnc_github_repo', repo);

    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    
    await loadData(token, repo);

  } catch (err) {
    loginError.textContent = err.message;
    localStorage.removeItem('lnc_github_token');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Đang nhập";
  }
}

// Fetch Data from GitHub
async function loadData(token, repo) {
  loadingIndicator.style.display = 'flex';
  adminForm.style.display = 'none';
  adminForm.innerHTML = '';

  try {
    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/data.json`, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    
    if (!res.ok) throw new Error("Không tìm thấy file data.json trên repo này.");
    
    const data = await res.json();
    siteData = JSON.parse(decodeURIComponent(escape(atob(data.content))));
    siteData.sha = data.sha; // Save SHA for updating later

    renderForms(siteData);
    
    loadingIndicator.style.display = 'none';
    adminForm.style.display = 'block';
    
    // Activate first section
    document.querySelector('.form-section').classList.add('active');

  } catch (err) {
    loadingIndicator.innerHTML = `<p style="color:var(--danger)">Lỗi: ${err.message}</p>`;
  }
}

// Render Forms dynamically based on JSON structure
function renderForms(data) {
  // 1. Hero Section
  let html = `<div id="section-hero" class="form-section">
    <h3 class="section-title">Hero Section</h3>
    <div class="card">
      <div class="form-group">
        <label>Tiêu đề chính (Dùng thẻ &lt;em&gt; để bôi vàng)</label>
        <textarea class="form-control" data-path="hero.title">${data.hero.title}</textarea>
      </div>
      <div class="form-group">
        <label>Mô tả ngắn</label>
        <textarea class="form-control" data-path="hero.desc">${data.hero.desc}</textarea>
      </div>
      ${renderImageUpload('Ảnh nền Hero', data.hero.bgImage, 'hero.bgImage')}
    </div>
  </div>`;

  // 2. Services Section
  html += `<div id="section-services" class="form-section">
    <h3 class="section-title">Dịch vụ</h3>`;
  data.services.forEach((srv, i) => {
    html += `<div class="card">
      <div class="card-header"><span class="card-title">Dịch vụ ${i+1}</span></div>
      <div class="form-group">
        <label>Tên dịch vụ</label>
        <input type="text" class="form-control" data-path="services.${i}.title" value="${srv.title}">
      </div>
      <div class="form-group">
        <label>Mô tả</label>
        <textarea class="form-control" data-path="services.${i}.desc">${srv.desc}</textarea>
      </div>
    </div>`;
  });
  html += `</div>`;

  // 3. Gallery Section
  html += `<div id="section-gallery" class="form-section">
    <h3 class="section-title">Thư Viện Ảnh</h3>`;
  data.gallery.forEach((item, i) => {
    html += `<div class="card">
      <div class="card-header"><span class="card-title">Ảnh ${i+1}</span></div>
      <div class="form-group">
        <label>Chú thích ảnh</label>
        <input type="text" class="form-control" data-path="gallery.${i}.caption" value="${item.caption}">
      </div>
      ${renderImageUpload(`Hình ảnh ${i+1}`, item.img, `gallery.${i}.img`)}
    </div>`;
  });
  html += `</div>`;

  // 4. Pricing Section
  html += `<div id="section-pricing" class="form-section">
    <h3 class="section-title">Bảng Giá</h3>`;
  data.pricing.forEach((pkg, i) => {
    html += `<div class="card">
      <div class="card-header"><span class="card-title">Gói ${pkg.title}</span></div>
      <div class="form-group">
        <label>Tên gói</label>
        <input type="text" class="form-control" data-path="pricing.${i}.title" value="${pkg.title}">
      </div>
      <div class="form-group">
        <label>Giá tiền</label>
        <input type="text" class="form-control" data-path="pricing.${i}.price" value="${pkg.price}">
      </div>
      <div class="form-group">
        <label>Thời hạn/Đơn vị</label>
        <input type="text" class="form-control" data-path="pricing.${i}.period" value="${pkg.period}">
      </div>
    </div>`;
  });
  html += `</div>`;

  // 5. FAQ Section
  html += `<div id="section-faq" class="form-section">
    <h3 class="section-title">Câu Hỏi Thường Gặp (FAQ)</h3>`;
  data.faq.forEach((faq, i) => {
    html += `<div class="card">
      <div class="form-group">
        <label>Câu hỏi ${i+1}</label>
        <input type="text" class="form-control" data-path="faq.${i}.q" value="${faq.q}">
      </div>
      <div class="form-group">
        <label>Trả lời</label>
        <textarea class="form-control" data-path="faq.${i}.a">${faq.a}</textarea>
      </div>
    </div>`;
  });
  html += `</div>`;

  adminForm.innerHTML = html;

  // Bind Image Uploads
  document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', handleImageUpload);
  });
}

function renderImageUpload(label, currentPath, dataPath) {
  return `
    <div class="image-upload">
      <label>${label}</label>
      <div class="image-preview">
        <img src="${currentPath}" id="preview-${dataPath.replace(/\./g, '-')}" alt="Preview">
      </div>
      <input type="file" accept="image/jpeg, image/png, image/webp" class="form-control" data-path="${dataPath}" data-img-path="${currentPath}">
    </div>
  `;
}

// Handle Image Selection
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const dataPath = e.target.getAttribute('data-path');
  const imgPath = e.target.getAttribute('data-img-path');
  const previewId = `preview-${dataPath.replace(/\./g, '-')}`;

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Full = event.target.result;
    document.getElementById(previewId).src = base64Full;
    
    // Store only the base64 data part (remove data:image/jpeg;base64,)
    const base64Data = base64Full.split(',')[1];
    changedImages[imgPath] = base64Data;
  };
  reader.readAsDataURL(file);
}

// Update JSON Object from Forms
function syncFormData() {
  const inputs = adminForm.querySelectorAll('input[type="text"], textarea');
  inputs.forEach(input => {
    const path = input.getAttribute('data-path');
    if (!path) return;
    
    const parts = path.split('.');
    let obj = siteData;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = input.value;
  });
}

// Save to GitHub
saveBtn.addEventListener('click', async () => {
  syncFormData();
  
  saveBtn.disabled = true;
  saveBtn.textContent = "Đang lưu...";
  
  const token = localStorage.getItem('lnc_github_token');
  const repo = localStorage.getItem('lnc_github_repo');

  try {
    // 1. Upload Changed Images
    for (const [path, base64Data] of Object.entries(changedImages)) {
      // Get current file SHA to update it
      const fileRes = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
        headers: { 'Authorization': `token ${token}` }
      });
      let sha = null;
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        sha = fileData.sha;
      }
      
      const body = {
        message: `Admin: Cập nhật hình ảnh ${path}`,
        content: base64Data,
      };
      if (sha) body.sha = sha;

      await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    
    // Clear changed images
    changedImages = {};

    // 2. Upload data.json
    const jsonString = JSON.stringify(siteData, null, 2);
    // Base64 encode supporting utf-8
    const base64Json = btoa(unescape(encodeURIComponent(jsonString)));

    const body = {
      message: "Admin: Cập nhật nội dung website",
      content: base64Json,
      sha: siteData.sha
    };

    const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/data.json`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("Lỗi khi lưu data.json");

    const result = await res.json();
    siteData.sha = result.content.sha; // Update SHA for next save

    showToast("Đã lưu thành công! Đang chờ Vercel cập nhật...");

  } catch (err) {
    alert("Lỗi khi lưu: " + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu & Cập nhật Web`;
  }
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
