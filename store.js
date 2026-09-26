// ===== SVCET NSS — shared client-side store =====
// This is a browser-only data layer for the static (no-backend) site. It lets
// the admin pages edit content and have it show up on the public pages when
// viewed in the SAME browser, on the SAME deployed domain (localStorage is
// per-origin). It does NOT sync between different visitors or devices —
// that needs a real backend + database, same as any static site without one.

(function (global) {
  const STORE_KEY = 'svcetnss_site_v1';
  const uid = () => Math.random().toString(36).slice(2, 10);

  const DEFAULT_STATE = {
    programs: [
      { id: uid(), slug: 'plantation-environmental-awareness', icon: '🌱', image: null, title: 'Plantation & Environmental Awareness', shortDesc: 'Tree plantation drives and environmental awareness for schools, colleges and public spaces.', fullDesc: 'Our volunteers organise tree plantation drives and lead sessions on environmental responsibility, waste management and sustainable habits, helping institutions build a greener campus and community.', active: true },
      { id: uid(), slug: 'cleaning-discipline-5s', icon: '✨', image: null, title: 'Cleaning, Discipline & 5S', shortDesc: 'Classroom cleanliness drives built on the 5S method: Sort, Set in Order, Shine, Standardize, Sustain.', fullDesc: 'We help institutions build lasting cleanliness and discipline habits using the 5S framework, with hands-on classroom and campus cleaning drives led by trained volunteers.', active: true },
      { id: uid(), slug: 'mental-health-counselling', icon: '💗', image: null, title: 'Mental Health & Counselling', shortDesc: 'Awareness sessions on mental health, stress and depression, encouraging students to seek support.', fullDesc: 'These sessions help students recognise stress and early signs of mental health difficulty, reduce stigma around seeking help, and understand how to access professional support.', active: true },
      { id: uid(), slug: 'bls-cpr-training', icon: '❤️‍🩹', image: null, title: 'BLS & CPR Training', shortDesc: 'Hands-on Basic Life Support and CPR training for cardiac arrest and emergency response.', fullDesc: 'Participants learn recognising cardiac emergencies, performing CPR, and responding calmly in the first critical minutes of a medical emergency, through guided demonstration and practice.', active: true },
      { id: uid(), slug: 'addiction-awareness', icon: '🛡️', image: null, title: 'Addiction Awareness', shortDesc: 'Awareness on drug and technology addiction, and building healthy daily habits.', fullDesc: 'This program covers the risks of substance and mobile/technology addiction, and equips students with practical strategies for healthier, more balanced daily habits.', active: true },
      { id: uid(), slug: 'womens-safety-empowerment', icon: '🛡️', image: null, title: "Women's Safety & Empowerment", shortDesc: 'Sessions on personal safety, dignity, equality and empowerment for women.', fullDesc: 'We conduct interactive sessions on personal safety awareness, self-respect, and equal treatment, empowering young women with practical knowledge and confidence.', active: true },
      { id: uid(), slug: 'mens-safety-social-responsibility', icon: '🧑‍🤝‍🧑', image: null, title: "Men's Safety & Social Responsibility", shortDesc: 'Sessions on emotional well-being, responsible behaviour and social respect for men.', fullDesc: 'This program encourages emotional openness, responsible conduct and mutual respect, helping young men build healthier relationships with themselves and society.', active: true },
      { id: uid(), slug: 'brain-development-activities-games', icon: '🧩', image: null, title: 'Brain Development Activities & Games', shortDesc: 'Puzzles and team games that build logical thinking, creativity and problem-solving.', fullDesc: 'Through structured puzzles, group challenges and team activities, students strengthen logical reasoning, creativity and collaborative problem-solving skills.', active: true },
      { id: uid(), slug: 'motivation-inspiration-sessions', icon: '🚀', image: null, title: 'Motivation & Inspiration Sessions', shortDesc: 'Motivational sessions on goal setting, confidence and personal development.', fullDesc: 'Our sessions inspire students to set clear goals, build self-confidence, and take ownership of their personal growth journey.', active: true },
      { id: uid(), slug: 'industrial-health-safety-training', icon: '⛑️', image: null, title: 'Industrial Health & Safety Training', shortDesc: 'Workplace hazard awareness, PPE and emergency preparedness for industrial safety.', fullDesc: 'This program introduces students to workplace safety fundamentals, hazard identification, correct PPE use and emergency preparedness practices relevant to industrial settings.', active: true },
      { id: uid(), slug: 'life-skills-self-respect-financial-awareness', icon: '💰', image: null, title: 'Life Skills, Self-Respect & Financial Awareness', shortDesc: 'Sessions on life purpose, self-respect, career development and financial literacy.', fullDesc: 'Students explore the meaning of self-respect and purpose, alongside practical guidance on career development, budgeting and responsible money management.', active: true },
    ],
    team: [
      { id: uid(), name: 'Coordinator Name (placeholder)', role: 'COORDINATOR', designation: 'NSS Programme Officer', bio: '', photo: null, placeholder: true },
      { id: uid(), name: 'Staff Member (placeholder)', role: 'STAFF', designation: 'Faculty Coordinator', bio: '', photo: null, placeholder: true },
      { id: uid(), name: 'Volunteer (placeholder)', role: 'VOLUNTEER', designation: 'Student Volunteer', bio: '', photo: null, placeholder: true },
    ],
    activities: [],
    gallery: [],
    settings: { homeHeroImage: null },
  };

  function loadState() {
    let parsed = null;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch (e) { /* storage unavailable or corrupted — fall back to defaults */ }
    if (!parsed || typeof parsed !== 'object') return JSON.parse(JSON.stringify(DEFAULT_STATE));
    return {
      programs: (Array.isArray(parsed.programs) ? parsed.programs : DEFAULT_STATE.programs).map(p => ({ image: null, ...p })),
      team: Array.isArray(parsed.team) ? parsed.team : DEFAULT_STATE.team,
      activities: (Array.isArray(parsed.activities) ? parsed.activities : []).map(a => ({ images: [], coverImage: null, ...a })),
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
      settings: { homeHeroImage: null, ...(parsed.settings || {}) },
    };
  }

  function saveState(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
    catch (e) { return false; }
  }

  function hasCustomData() {
    try { return !!localStorage.getItem(STORE_KEY); } catch (e) { return false; }
  }

  function fileToResizedDataUrl(file, maxDim, cb) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
        else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  global.NSSStore = { uid, DEFAULT_STATE, loadState, saveState, hasCustomData, fileToResizedDataUrl, STORE_KEY };
})(window);
