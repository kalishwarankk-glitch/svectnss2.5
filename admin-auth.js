// ===== SVCET NSS — admin "auth" =====
// IMPORTANT: this is NOT real authentication. It's a client-side gate so the
// admin pages aren't wide open by accident, but the credential check happens
// entirely in the browser and anyone who reads this file can see it. Do not
// treat this as securing anything sensitive — see README.md for how to add
// real auth if that's ever needed.

(function (global) {
  const SESSION_KEY = 'svcetnss_admin_session';
  const ADMIN_EMAIL = 'svcetnss26@gmail.com';
  const ADMIN_PASSWORD = 'svcetnss@26';

  function login(email, password) {
    const ok = (email || '').trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (ok) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
    }
    return ok;
  }

  function isLoggedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function requireLogin(redirectTo) {
    if (!isLoggedIn()) window.location.href = redirectTo || 'admin-login.html';
  }

  global.NSSAuth = { login, isLoggedIn, logout, requireLogin };
})(window);
