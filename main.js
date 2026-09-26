// ===== SVCET NSS — shared behaviour (mobile nav, gallery lightbox, filters, live content) =====

function bindLightboxTriggers() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector('img');
  document.querySelectorAll('[data-lightbox-src]').forEach((el) => {
    if (el.dataset.lightboxBound) return;
    el.dataset.lightboxBound = '1';
    el.addEventListener('click', () => {
      lightboxImg.src = el.dataset.lightboxSrc;
      lightboxImg.alt = el.dataset.lightboxCaption || '';
      lightbox.classList.add('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile hamburger menu
  const hambBtn = document.getElementById('hambBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hambBtn && mobileMenu) {
    hambBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  // Mark the current page's nav link(s) as active based on a data-page
  // attribute set on <body>, e.g. <body data-page="about">
  const currentPage = document.body.dataset.page;
  if (currentPage) {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      if (el.dataset.nav === currentPage) el.classList.add('active');
    });
  }

  // Gallery lightbox
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    bindLightboxTriggers();
    function closeLightbox() { lightbox.classList.remove('open'); lightboxImg.src = ''; }
    closeBtn?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  // Generic filter buttons: [data-filter-group] buttons toggle visibility of
  // items matching its target selector whose data-status matches the filter.
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const buttons = group.querySelectorAll('button');
    const targetSelector = group.dataset.filterGroup;
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll(targetSelector).forEach((item) => {
          const show = filter === 'ALL' || item.dataset.status === filter;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });

  // ---------- Live content hydration ----------
  // If this page has containers for content the admin can edit, and the
  // shared store (js/store.js) is loaded, re-render those containers from
  // localStorage. On a browser that has never used the admin pages, this is
  // a no-op (defaults match the static HTML already on the page). See
  // js/store.js and README.md for what this can and can't do.
  if (typeof NSSStore === 'undefined') return;
  const STATE = NSSStore.loadState();

  function programCardHtml(p) {
    const media = p.image
      ? `<img src="${p.image}" alt="" style="width:100%;height:130px;object-fit:cover;border-radius:12px;margin-bottom:12px;"/>`
      : `<div class="icon-badge">${p.icon}</div>`;
    return `<div class="card">${media}<h3>${p.title}</h3><p>${p.shortDesc}</p>` +
      `<a href="${p.slug}.html" class="learn">Learn more &rarr;</a></div>`;
  }

  const homeGrid = document.getElementById('homeProgramGrid');
  if (homeGrid) {
    const active = STATE.programs.filter((p) => p.active);
    homeGrid.innerHTML = active.slice(0, 6).map((p) => programCardHtml(p)).join('') || '<div class="placeholder-box">No active programs yet.</div>';
  }
  const statPrograms = document.getElementById('statPrograms');
  if (statPrograms) {
    statPrograms.textContent = STATE.programs.filter((p) => p.active).length;
    document.getElementById('statActivities').textContent = STATE.activities.length || '—';
    document.getElementById('statGallery').textContent = STATE.gallery.length || '—';
    document.getElementById('statTeam').textContent = STATE.team.length || '—';
  }

  // Hero photo: if the admin uploaded one, replace the decorative hero-grid with it
  const heroImage = STATE.settings && STATE.settings.homeHeroImage;
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGrid && heroImage) {
    heroGrid.outerHTML = `<img src="${heroImage}" alt="SVCET NSS" style="width:100%;max-width:480px;border-radius:20px;margin:0 auto;display:block;object-fit:cover;" />`;
  }

  const allGrid = document.getElementById('allProgramsGrid');
  if (allGrid) {
    const active = STATE.programs.filter((p) => p.active);
    allGrid.innerHTML = active.map((p) => programCardHtml(p)).join('') || '<div class="placeholder-box">No active programs yet.</div>';
  }

  const programWrap = document.querySelector('[data-program-slug]');
  if (programWrap) {
    const slug = programWrap.dataset.programSlug;
    const match = STATE.programs.find((p) => p.slug === slug);
    if (match) {
      if (match.image) {
        document.getElementById('programIcon').outerHTML = `<img id="programIcon" src="${match.image}" alt="" style="margin-top:16px;width:100%;max-width:420px;height:220px;object-fit:cover;border-radius:16px;"/>`;
      } else {
        document.getElementById('programIcon').textContent = match.icon;
      }
      document.getElementById('programTitle').textContent = match.title;
      document.getElementById('programFullDesc').textContent = match.fullDesc;
    }
  }

  const activitiesList = document.getElementById('activitiesList');
  if (activitiesList && STATE.activities.length > 0) {
    const cardHtml = (a) => {
      const dateStr = new Date(a.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      const statusClass = a.status === 'UPCOMING' ? 'status-upcoming' : 'status-completed';
      return `<div class="card event-card" data-activity data-status="${a.status}">
        ${a.coverImage ? `<img class="cover" src="${a.coverImage}" alt="" style="height:150px;width:100%;object-fit:cover;"/>` : `<div class="cover">📅</div>`}
        <div class="body">
          <div class="meta"><span class="status-pill ${statusClass}">${a.status.charAt(0) + a.status.slice(1).toLowerCase()}</span><span>${dateStr}</span></div>
          <h3 style="font-size:1.05rem;">${a.title}</h3>
          <p>${a.description}</p>
          <div style="margin-top:10px;font-size:.78rem;color:rgba(22,34,28,.55);">📍 ${a.location}</div>
        </div>
      </div>`;
    };
    const sorted = STATE.activities.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    activitiesList.innerHTML = `<div class="grid grid-3">${sorted.map(cardHtml).join('')}</div>`;
  }

  const galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid && STATE.gallery.length > 0) {
    galleryGrid.innerHTML = `<div class="thumb-grid">${STATE.gallery.map((g) => `
      <button class="thumb" data-lightbox-src="${g.dataURL}" data-lightbox-caption="${g.caption || ''}">
        <img src="${g.dataURL}" alt="${g.caption || ''}" />
      </button>`).join('')}</div>`;
    bindLightboxTriggers();
  }

  function teamCardHtml(m) {
    const avatar = m.photo ? `<div class="avatar-placeholder"><img src="${m.photo}" alt=""/></div>` : `<div class="avatar-placeholder">👤</div>`;
    return `<div class="card center">${avatar}<h3 style="margin-top:10px;">${m.name}</h3><p>${m.designation}</p>${m.placeholder ? '<span class="badge-note">Details to be updated</span>' : (m.bio ? `<p style="margin-top:8px;">${m.bio}</p>` : '')}</div>`;
  }
  const teamCoord = document.getElementById('teamCoordinator');
  if (teamCoord) {
    const groups = [['COORDINATOR', 'teamCoordinator'], ['STAFF', 'teamStaff'], ['VOLUNTEER', 'teamVolunteers']];
    groups.forEach(([role, id]) => {
      const members = STATE.team.filter((m) => m.role === role);
      const container = document.getElementById(id);
      if (container && members.length) container.innerHTML = members.map(teamCardHtml).join('');
    });
  }
});
