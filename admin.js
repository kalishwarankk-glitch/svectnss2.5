// ===== SVCET NSS — admin dashboard logic =====
(function () {
  NSSAuth.requireLogin('admin-login.html');

  const { uid, saveState: storeSave, fileToResizedDataUrl } = NSSStore;
  let STATE = NSSStore.loadState();
  function saveState() { storeSave(STATE); }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    NSSAuth.logout();
    window.location.href = 'admin-login.html';
  });

  /* ---------- Modal ---------- */
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBox = document.getElementById('modalBox');
  function openModal(html) { modalBox.innerHTML = html; modalBackdrop.classList.add('open'); }
  function closeModal() { modalBackdrop.classList.remove('open'); modalBox.innerHTML = ''; }
  window.closeModal = closeModal; // used by inline onclick in modal markup
  modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------- Tab switching ---------- */
  const renderers = { dashboard: renderDashboard, home: renderHomeSettings, programs: renderPrograms, activities: renderActivities, team: renderTeam, gallery: renderGallery };
  function showTab(tab) {
    Object.keys(renderers).forEach((t) => { document.getElementById('tab-' + t).style.display = t === tab ? 'block' : 'none'; });
    document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    renderers[tab]();
  }
  document.querySelectorAll('[data-tab]').forEach((btn) => btn.addEventListener('click', () => showTab(btn.dataset.tab)));

  /* ---------- Home Page settings ---------- */
  function renderHomeSettings() {
    const el = document.getElementById('tab-home');
    const hero = STATE.settings && STATE.settings.homeHeroImage;
    el.innerHTML = `
      <h1 style="font-size:1.5rem;">Home Page</h1>
      <p style="color:rgba(22,34,28,.6);font-size:.9rem;">Upload a photo to replace the decorative hero graphic on the homepage.</p>
      <div style="max-width:420px;margin-top:20px;">
        <div class="upload-drop" id="heroPhotoDrop">Click to choose a hero photo</div>
        <input type="file" id="heroPhotoInput" accept="image/*" style="display:none;" />
        <div id="heroPhotoPreview" style="margin-top:12px;">${hero ? `<img src="${hero}" style="width:100%;border-radius:12px;"/>` : '<p style="font-size:.85rem;color:rgba(22,34,28,.5);">No hero photo set — the homepage currently shows the default decorative cards.</p>'}</div>
        ${hero ? '<button class="btn btn-ghost" id="removeHeroBtn" style="margin-top:12px;">Remove photo (use default)</button>' : ''}
      </div>`;
    document.getElementById('heroPhotoDrop').onclick = () => document.getElementById('heroPhotoInput').click();
    document.getElementById('heroPhotoInput').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileToResizedDataUrl(file, 1200, (dataUrl) => {
        if (!STATE.settings) STATE.settings = { homeHeroImage: null };
        STATE.settings.homeHeroImage = dataUrl;
        saveState();
        renderHomeSettings();
      });
    };
    const removeBtn = document.getElementById('removeHeroBtn');
    if (removeBtn) removeBtn.onclick = () => {
      STATE.settings.homeHeroImage = null;
      saveState();
      renderHomeSettings();
    };
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const el = document.getElementById('tab-dashboard');
    const active = STATE.programs.filter((p) => p.active).length;
    el.innerHTML = `
      <h1 style="font-size:1.5rem;">Dashboard</h1>
      <p style="color:rgba(22,34,28,.6);font-size:.9rem;">Overview of NSS content on this site.</p>
      <div class="grid grid-4" style="margin-top:22px;">
        <div class="stat"><b>${active}</b><span>Active programs</span></div>
        <div class="stat"><b>${STATE.activities.length}</b><span>Activities logged</span></div>
        <div class="stat"><b>${STATE.team.length}</b><span>Team members</span></div>
        <div class="stat"><b>${STATE.gallery.length}</b><span>Gallery photos</span></div>
      </div>
      <p style="margin-top:24px;font-size:.8rem;color:rgba(22,34,28,.5);max-width:65ch;">
        This static site has no backend, so changes here are saved to <b>this browser only</b>
        (localStorage) and shown on the public pages only when viewed on this same browser and
        domain. They are not shared with other visitors. For real shared/persistent admin data,
        see the "Real admin backend" note in the project README.
      </p>`;
  }

  /* ---------- Programs ---------- */
  function renderPrograms() {
    const el = document.getElementById('tab-programs');
    el.innerHTML = `
      <div class="admin-header-row">
        <h1 style="font-size:1.5rem;margin:0;">Manage Programs</h1>
        <button class="btn btn-primary" id="btnAddProgram">+ Add Program</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Photo</th><th>Program</th><th>Slug</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead>
        <tbody>${STATE.programs.map((p) => `
          <tr>
            <td>${p.image ? `<img src="${p.image}" alt="" style="width:44px;height:44px;border-radius:8px;object-fit:cover;"/>` : `<span class="avatar-mini" style="width:44px;height:44px;font-size:1.3rem;">${p.icon}</span>`}</td>
            <td>${p.title}</td>
            <td style="color:rgba(22,34,28,.5);">${p.slug}</td>
            <td><button class="status-pill-toggle" data-toggle-program="${p.id}"><span class="status-pill ${p.active ? 'status-active-pill' : 'status-inactive-pill'}">${p.active ? 'Active' : 'Inactive'}</span></button></td>
            <td style="text-align:right;">
              <button class="icon-btn" data-edit-program="${p.id}">✏️</button>
              <button class="icon-btn" data-del-program="${p.id}">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
    document.getElementById('btnAddProgram').onclick = () => openProgramModal(null);
  }
  function openProgramModal(program) {
    const editing = !!program;
    program = program || { icon: '🌿', image: null, title: '', slug: '', shortDesc: '', fullDesc: '', active: true };
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>${editing ? 'Edit Program' : 'Add Program'}</h3>
      <form id="programForm">
        <label>Icon (emoji, used when no photo is set)</label><input name="icon" value="${program.icon}" required />
        <label>Photo (optional)</label>
        <div class="upload-drop" id="programPhotoDrop">Click to choose a photo</div>
        <input type="file" id="programPhotoInput" accept="image/*" style="display:none;" />
        <div id="programPhotoPreview" style="margin-top:10px;"></div>
        <label>Title</label><input name="title" value="${program.title}" required />
        <label>URL slug</label><input name="slug" value="${program.slug}" ${editing ? 'readonly' : 'required'} placeholder="e.g. tree-plantation" />
        <label>Short description</label><textarea name="shortDesc" rows="2" required>${program.shortDesc}</textarea>
        <label>Full description</label><textarea name="fullDesc" rows="4" required>${program.fullDesc}</textarea>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${editing ? 'Save Changes' : 'Create Program'}</button>
        </div>
        ${!editing ? '<p style="font-size:.75rem;color:rgba(22,34,28,.5);margin-top:10px;">Note: a brand-new program has no matching individual page in the static export yet — you\'d need to add one manually (copy an existing program .html file). Editing existing programs works fully.</p>' : ''}
      </form>`);
    let pendingImage = program.image;
    if (pendingImage) document.getElementById('programPhotoPreview').innerHTML = `<img src="${pendingImage}" style="width:100%;max-width:220px;border-radius:8px;"/>`;
    document.getElementById('programPhotoDrop').onclick = () => document.getElementById('programPhotoInput').click();
    document.getElementById('programPhotoInput').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileToResizedDataUrl(file, 900, (dataUrl) => {
        pendingImage = dataUrl;
        document.getElementById('programPhotoPreview').innerHTML = `<img src="${dataUrl}" style="width:100%;max-width:220px;border-radius:8px;"/>`;
      });
    };
    document.getElementById('programForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = { icon: fd.get('icon'), image: pendingImage, title: fd.get('title'), shortDesc: fd.get('shortDesc'), fullDesc: fd.get('fullDesc') };
      if (editing) Object.assign(program, data);
      else STATE.programs.push({ id: uid(), slug: fd.get('slug'), active: true, ...data });
      saveState(); closeModal(); renderPrograms();
    };
  }
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-program]');
    if (editBtn) { openProgramModal(STATE.programs.find((p) => p.id === editBtn.dataset.editProgram)); return; }
    const toggleBtn = e.target.closest('[data-toggle-program]');
    if (toggleBtn) {
      const p = STATE.programs.find((p) => p.id === toggleBtn.dataset.toggleProgram);
      if (p) { p.active = !p.active; saveState(); renderPrograms(); }
      return;
    }
    const delBtn = e.target.closest('[data-del-program]');
    if (delBtn) {
      if (confirm('Delete this program?')) { STATE.programs = STATE.programs.filter((p) => p.id !== delBtn.dataset.delProgram); saveState(); renderPrograms(); }
    }
  });

  /* ---------- Activities ---------- */
  function renderActivities() {
    const el = document.getElementById('tab-activities');
    el.innerHTML = `
      <div class="admin-header-row">
        <h1 style="font-size:1.5rem;margin:0;">Manage Activities</h1>
        <button class="btn btn-primary" id="btnAddActivity">+ Add Activity</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Status</th><th>Photos</th><th style="text-align:right;">Actions</th></tr></thead>
        <tbody>${STATE.activities.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((a) => `
          <tr>
            <td>${a.title}</td>
            <td>${new Date(a.date).toLocaleDateString()}</td>
            <td>${a.location}</td>
            <td><button class="status-pill-toggle" data-toggle-activity="${a.id}"><span class="status-pill ${a.status === 'UPCOMING' ? 'status-active-pill' : 'status-inactive-pill'}">${a.status.charAt(0) + a.status.slice(1).toLowerCase()}</span></button></td>
            <td><button class="icon-btn" data-photos-activity="${a.id}">🖼️ ${(a.images || []).length}</button></td>
            <td style="text-align:right;">
              <button class="icon-btn" data-edit-activity="${a.id}">✏️</button>
              <button class="icon-btn" data-del-activity="${a.id}">🗑️</button>
            </td>
          </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:rgba(22,34,28,.5);padding:24px;">No activities yet.</td></tr>`}
        </tbody>
      </table>`;
    document.getElementById('btnAddActivity').onclick = () => openActivityModal(null);
  }
  function openActivityModal(activity) {
    const editing = !!activity;
    activity = activity || { title: '', description: '', date: new Date().toISOString().slice(0, 10), location: '', status: 'UPCOMING', coverImage: null, images: [] };
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>${editing ? 'Edit Activity' : 'Add Activity'}</h3>
      <form id="activityForm">
        <label>Title</label><input name="title" value="${activity.title}" required />
        <label>Description</label><textarea name="description" rows="3" required>${activity.description}</textarea>
        <label>Date</label><input type="date" name="date" value="${new Date(activity.date).toISOString().slice(0, 10)}" required />
        <label>Location</label><input name="location" value="${activity.location}" required />
        <label>Status</label>
        <select name="status">
          <option value="UPCOMING" ${activity.status === 'UPCOMING' ? 'selected' : ''}>Upcoming</option>
          <option value="COMPLETED" ${activity.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        </select>
        <label>Cover photo (optional)</label>
        <div class="upload-drop" id="activityPhotoDrop">Click to choose an image</div>
        <input type="file" id="activityPhotoInput" accept="image/*" style="display:none;" />
        <div id="activityPhotoPreview" style="margin-top:10px;"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${editing ? 'Save Changes' : 'Create Activity'}</button>
        </div>
      </form>`);
    let pendingCover = activity.coverImage;
    if (pendingCover) document.getElementById('activityPhotoPreview').innerHTML = `<img src="${pendingCover}" style="width:100%;max-width:220px;border-radius:8px;"/>`;
    document.getElementById('activityPhotoDrop').onclick = () => document.getElementById('activityPhotoInput').click();
    document.getElementById('activityPhotoInput').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileToResizedDataUrl(file, 900, (dataUrl) => {
        pendingCover = dataUrl;
        document.getElementById('activityPhotoPreview').innerHTML = `<img src="${dataUrl}" style="width:100%;max-width:220px;border-radius:8px;"/>`;
      });
    };
    document.getElementById('activityForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = { title: fd.get('title'), description: fd.get('description'), date: fd.get('date'), location: fd.get('location'), status: fd.get('status'), coverImage: pendingCover };
      if (editing) Object.assign(activity, data);
      else STATE.activities.push({ id: uid(), images: [], ...data });
      saveState(); closeModal(); renderActivities();
    };
  }
  function openActivityPhotosModal(activity) {
    if (!activity.images) activity.images = [];
    function draw() {
      openModal(`
        <button class="modal-close" onclick="closeModal()">✕</button>
        <h3>Photos — ${activity.title}</h3>
        <div class="upload-drop" id="actPhotoDrop">Click to choose an image</div>
        <input type="file" id="actPhotoInput" accept="image/*" style="display:none;" />
        <input type="text" id="actPhotoCaption" placeholder="Caption (optional)" style="width:100%;margin-top:10px;padding:9px 11px;border-radius:8px;border:1px solid rgba(31,77,58,.22);font-family:inherit;font-size:.87rem;background:var(--paper);color:var(--ink);" />
        <div class="thumb-grid-admin">${activity.images.map((img) => `
          <div class="thumb-admin"><img src="${img.dataURL}" alt="${img.caption || ''}"/><button data-del-activity-photo="${img.id}">Delete</button></div>`).join('')}
        </div>
        ${activity.images.length === 0 ? `<p style="margin-top:10px;font-size:.85rem;color:rgba(22,34,28,.5);">No photos added yet.</p>` : ''}
      `);
      document.getElementById('actPhotoDrop').onclick = () => document.getElementById('actPhotoInput').click();
      document.getElementById('actPhotoInput').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        fileToResizedDataUrl(file, 900, (dataUrl) => {
          const caption = document.getElementById('actPhotoCaption').value;
          activity.images.push({ id: uid(), dataURL: dataUrl, caption });
          saveState(); renderActivities(); draw();
        });
      };
    }
    draw();
  }
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-activity]');
    if (editBtn) { openActivityModal(STATE.activities.find((a) => a.id === editBtn.dataset.editActivity)); return; }
    const toggleBtn = e.target.closest('[data-toggle-activity]');
    if (toggleBtn) {
      const a = STATE.activities.find((a) => a.id === toggleBtn.dataset.toggleActivity);
      if (a) { a.status = a.status === 'UPCOMING' ? 'COMPLETED' : 'UPCOMING'; saveState(); renderActivities(); }
      return;
    }
    const photosBtn = e.target.closest('[data-photos-activity]');
    if (photosBtn) { openActivityPhotosModal(STATE.activities.find((a) => a.id === photosBtn.dataset.photosActivity)); return; }
    const delBtn = e.target.closest('[data-del-activity]');
    if (delBtn) {
      if (confirm('Delete this activity?')) { STATE.activities = STATE.activities.filter((a) => a.id !== delBtn.dataset.delActivity); saveState(); renderActivities(); }
    }
    const delPhoto = e.target.closest('[data-del-activity-photo]');
    if (delPhoto) {
      const activity = STATE.activities.find((a) => (a.images || []).some((img) => img.id === delPhoto.dataset.delActivityPhoto));
      if (activity) { activity.images = activity.images.filter((img) => img.id !== delPhoto.dataset.delActivityPhoto); saveState(); renderActivities(); openActivityPhotosModal(activity); }
    }
  });

  /* ---------- Team ---------- */
  function avatarHtml(m) {
    return m.photo
      ? `<span class="avatar-mini" style="width:56px;height:56px;"><img src="${m.photo}" alt=""/></span>`
      : `<span class="avatar-mini" style="width:56px;height:56px;">👤</span>`;
  }
  function renderTeam() {
    const el = document.getElementById('tab-team');
    el.innerHTML = `
      <div class="admin-header-row">
        <h1 style="font-size:1.5rem;margin:0;">Staff &amp; Volunteers</h1>
        <button class="btn btn-primary" id="btnAddMember">+ Add Member</button>
      </div>
      <div class="grid grid-3">${STATE.team.map((m) => `
        <div class="card">
          <div style="display:flex;gap:10px;align-items:center;">
            ${avatarHtml(m)}
            <div><h3 style="margin:0;font-size:1rem;">${m.name}</h3><p style="margin:0;">${m.designation} &middot; ${m.role.charAt(0) + m.role.slice(1).toLowerCase()}</p></div>
          </div>
          ${m.placeholder ? `<span class="badge-note">Placeholder</span>` : ''}
          <div class="modal-actions" style="margin-top:14px;">
            <button class="icon-btn" data-edit-member="${m.id}">✏️ Edit</button>
            <button class="icon-btn" data-del-member="${m.id}">🗑️ Remove</button>
          </div>
        </div>`).join('')}
      </div>`;
    document.getElementById('btnAddMember').onclick = () => openMemberModal(null);
  }
  function openMemberModal(member) {
    const editing = !!member;
    member = member || { name: '', role: 'VOLUNTEER', designation: '', bio: '', photo: null, placeholder: false };
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>${editing ? 'Edit Member' : 'Add Team Member'}</h3>
      <form id="memberForm">
        <label>Full name</label><input name="name" value="${member.name}" required />
        <label>Role</label>
        <select name="role">
          <option value="COORDINATOR" ${member.role === 'COORDINATOR' ? 'selected' : ''}>Coordinator</option>
          <option value="STAFF" ${member.role === 'STAFF' ? 'selected' : ''}>Staff</option>
          <option value="VOLUNTEER" ${member.role === 'VOLUNTEER' ? 'selected' : ''}>Volunteer</option>
        </select>
        <label>Designation</label><input name="designation" value="${member.designation}" required />
        <label>Short bio (optional)</label><textarea name="bio" rows="2">${member.bio || ''}</textarea>
        <label>Photo (optional)</label>
        <div class="upload-drop" id="memberPhotoDrop">Click to choose a photo</div>
        <input type="file" id="memberPhotoInput" accept="image/*" style="display:none;" />
        <div id="memberPhotoPreview" style="margin-top:10px;"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${editing ? 'Save Changes' : 'Add Member'}</button>
        </div>
      </form>`);
    let pendingPhoto = member.photo;
    if (pendingPhoto) document.getElementById('memberPhotoPreview').innerHTML = `<img src="${pendingPhoto}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;"/>`;
    document.getElementById('memberPhotoDrop').onclick = () => document.getElementById('memberPhotoInput').click();
    document.getElementById('memberPhotoInput').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileToResizedDataUrl(file, 300, (dataUrl) => {
        pendingPhoto = dataUrl;
        document.getElementById('memberPhotoPreview').innerHTML = `<img src="${dataUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;"/>`;
      });
    };
    document.getElementById('memberForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = { name: fd.get('name'), role: fd.get('role'), designation: fd.get('designation'), bio: fd.get('bio'), photo: pendingPhoto, placeholder: false };
      if (editing) Object.assign(member, data);
      else STATE.team.push({ id: uid(), ...data });
      saveState(); closeModal(); renderTeam();
    };
  }
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-member]');
    if (editBtn) { openMemberModal(STATE.team.find((m) => m.id === editBtn.dataset.editMember)); return; }
    const delBtn = e.target.closest('[data-del-member]');
    if (delBtn) {
      if (confirm('Remove this team member?')) { STATE.team = STATE.team.filter((m) => m.id !== delBtn.dataset.delMember); saveState(); renderTeam(); }
    }
  });

  /* ---------- Gallery ---------- */
  function renderGallery() {
    const el = document.getElementById('tab-gallery');
    el.innerHTML = `
      <div class="admin-header-row">
        <h1 style="font-size:1.5rem;margin:0;">Gallery Photos</h1>
        <button class="btn btn-primary" id="btnAddPhoto">+ Add Photo</button>
      </div>
      <div class="thumb-grid-admin">${STATE.gallery.map((g) => `
        <div class="thumb-admin"><img src="${g.dataURL}" alt="${g.caption || ''}"/><button data-del-photo="${g.id}">Delete</button></div>`).join('')}
      </div>
      ${STATE.gallery.length === 0 ? `<div class="placeholder-box" style="margin-top:16px;">No photos yet — add the first one.</div>` : ''}`;
    document.getElementById('btnAddPhoto').onclick = openPhotoModal;
  }
  function openPhotoModal() {
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>Add Photo</h3>
      <form id="photoForm">
        <div class="upload-drop" id="galleryPhotoDrop">Click to choose an image</div>
        <input type="file" id="galleryPhotoInput" accept="image/*" style="display:none;" />
        <div id="galleryPhotoPreview" style="margin-top:10px;"></div>
        <label>Caption (optional)</label><input name="caption" />
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" id="photoSubmitBtn" disabled>Upload</button>
        </div>
      </form>`);
    let pendingPhoto = null;
    document.getElementById('galleryPhotoDrop').onclick = () => document.getElementById('galleryPhotoInput').click();
    document.getElementById('galleryPhotoInput').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileToResizedDataUrl(file, 900, (dataUrl) => {
        pendingPhoto = dataUrl;
        document.getElementById('galleryPhotoPreview').innerHTML = `<img src="${dataUrl}" style="width:100%;max-width:220px;border-radius:8px;"/>`;
        document.getElementById('photoSubmitBtn').disabled = false;
      });
    };
    document.getElementById('photoForm').onsubmit = (e) => {
      e.preventDefault();
      if (!pendingPhoto) return;
      const fd = new FormData(e.target);
      STATE.gallery.push({ id: uid(), dataURL: pendingPhoto, caption: fd.get('caption') || '' });
      saveState(); closeModal(); renderGallery();
    };
  }
  document.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-del-photo]');
    if (delBtn) {
      if (confirm('Delete this photo?')) { STATE.gallery = STATE.gallery.filter((g) => g.id !== delBtn.dataset.delPhoto); saveState(); renderGallery(); }
    }
  });

  showTab('dashboard');
})();
