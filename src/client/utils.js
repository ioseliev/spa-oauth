export const getRedirectUrl = () => {
  const SCOPES = 'read:user';
  return 'https://github.com/login/oauth/authorize/' +
         `?client_id=${import.meta.env.VITE_CLIENT_ID}` +
         `&redirect_uri=${import.meta.env.VITE_REDIRECT_URI}` +
         `&scope=${SCOPES}`;
};
