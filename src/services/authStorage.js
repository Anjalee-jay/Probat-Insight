export function saveAuthToken(token) {
  localStorage.setItem('adminAuthToken', token);
}

export function getAuthToken() {
  return localStorage.getItem('adminAuthToken');
}

export function removeAuthToken() {
  localStorage.removeItem('adminAuthToken');
}

export function isAuthenticated() {
  return getAuthToken() !== null;
}