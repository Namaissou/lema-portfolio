(function () {
  const $ = id => document.getElementById(id);
  const setupWarning = $('setup-warning');
  const authPanel = $('auth-panel');
  const uploadPanel = $('upload-panel');
  const loginForm = $('login-form');
  const uploadForm = $('upload-form');
  const fileInput = $('art-file');
  const previewWrap = $('preview-wrap');
  const preview = $('art-preview');
  const authMessage = $('auth-message');
  const uploadMessage = $('upload-message');
  const isConfigured = () => window.supabase && window.PORTFOLIO_SUPABASE_URL && window.PORTFOLIO_SUPABASE_ANON_KEY && !window.PORTFOLIO_SUPABASE_URL.includes('PASTE_') && !window.PORTFOLIO_SUPABASE_ANON_KEY.includes('PASTE_');
  if (!isConfigured()) { setupWarning.hidden = false; loginForm.querySelector('button').disabled = true; return; }
  const client = window.supabase.createClient(window.PORTFOLIO_SUPABASE_URL, window.PORTFOLIO_SUPABASE_ANON_KEY);
  const bucket = window.PORTFOLIO_STORAGE_BUCKET || 'portfolio-designs';
  const setMessage = (el, message, bad = false) => { el.textContent = message; el.classList.toggle('error', bad); };
  async function refreshSession() {
    const { data } = await client.auth.getSession();
    const signedIn = !!data.session;
    authPanel.hidden = signedIn; uploadPanel.hidden = !signedIn;
    if (signedIn) loadAdminGallery();
  }
  loginForm.addEventListener('submit', async e => {
    e.preventDefault(); setMessage(authMessage, 'Signing in…');
    const { error } = await client.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value });
    if (error) setMessage(authMessage, error.message, true); else { setMessage(authMessage, 'Signed in.'); await refreshSession(); }
  });
  $('sign-out').addEventListener('click', async () => { await client.auth.signOut(); await refreshSession(); });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]; if (!file) { previewWrap.hidden = true; return; }
    if (file.size > 8 * 1024 * 1024) { setMessage(uploadMessage, 'Please choose an image smaller than 8 MB.', true); fileInput.value = ''; previewWrap.hidden = true; return; }
    preview.src = URL.createObjectURL(file); previewWrap.hidden = false;
  });
  uploadForm.addEventListener('submit', async e => {
    e.preventDefault(); const file = fileInput.files[0]; if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { setMessage(uploadMessage, 'Please upload a JPG, PNG, WEBP or GIF image.', true); return; }
    if (file.size > 8 * 1024 * 1024) { setMessage(uploadMessage, 'Maximum file size is 8 MB.', true); return; }
    const title = $('art-title').value.trim();
    const safeTitle = title.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 65) || 'artwork';
    const ext = file.name.split('.').pop().toLowerCase(); const filename = `${Date.now()}-${safeTitle}.${ext}`;
    const submit = uploadForm.querySelector('button[type="submit"]'); submit.disabled = true; setMessage(uploadMessage, 'Uploading artwork…');
    const { error } = await client.storage.from(bucket).upload(filename, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    submit.disabled = false;
    if (error) { setMessage(uploadMessage, `Upload failed: ${error.message}`, true); return; }
    setMessage(uploadMessage, 'Artwork uploaded to the public gallery.'); uploadForm.reset(); previewWrap.hidden = true; await loadAdminGallery();
    if (window.refreshDesignGallery) await window.refreshDesignGallery();
  });
  async function loadAdminGallery() {
    const root = $('admin-gallery'); root.innerHTML = '<p class="small-note">Loading…</p>';
    const { data, error } = await client.storage.from(bucket).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) { root.textContent = `Could not list files: ${error.message}`; return; }
    const files = (data || []).filter(f => f.name && !f.name.startsWith('.')).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f.name));
    root.innerHTML = '';
    if (!files.length) { root.innerHTML = '<p class="small-note">No artwork uploaded yet.</p>'; return; }
    files.forEach(file => {
      const item = document.createElement('div'); item.className = 'admin-art-item';
      const name = document.createElement('span'); name.textContent = file.name;
      const del = document.createElement('button'); del.className = 'delete-button'; del.type = 'button'; del.textContent = 'Delete';
      del.addEventListener('click', async () => { if (!confirm(`Delete ${file.name}? This cannot be undone.`)) return; del.disabled = true; const { error: deleteError } = await client.storage.from(bucket).remove([file.name]); if (deleteError) { alert(`Delete failed: ${deleteError.message}`); del.disabled = false; } else { await loadAdminGallery(); if (window.refreshDesignGallery) await window.refreshDesignGallery(); } });
      item.append(name, del); root.append(item);
    });
  }
  client.auth.onAuthStateChange(() => { refreshSession(); });
  refreshSession();
})();
