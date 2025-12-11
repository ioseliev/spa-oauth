import "./style.css";
// import { getRedirectUrl } from './utils'; //

const app = document.querySelector("#app");

// Captura os parâmetros da URL
const queryString = new URLSearchParams(window.location.search);
// Se NÃO tem 'code', precisa logar
const needs_login = !queryString.has('code'); 

(() => {
  function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const values = new Uint8Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
        result += charset[values[i] % charset.length];
    }
    return result;
  }

  async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  }

  function base64UrlEncode(arrayBuffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
  }

  const AUTH_CONFIG = {
    authEndpoint: "https://github.com/login/oauth/authorize",
    clientId: "Ov23liCAkJQZP7wDEXGy", 
    redirectUri: "https://spa-oauth.vercel.app/", 
    scopes: "read:user"
  };


  async function iniciarLogin() {

    const codeVerifier = generateRandomString(128);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64UrlEncode(hashed);
    const state = generateRandomString(32);


    sessionStorage.setItem('auth_code_verifier', codeVerifier);
    sessionStorage.setItem('auth_state', state);

    const url = new URL(AUTH_CONFIG.authEndpoint);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", AUTH_CONFIG.clientId);
    url.searchParams.append("redirect_uri", AUTH_CONFIG.redirectUri);
    url.searchParams.append("scope", AUTH_CONFIG.scopes);
    url.searchParams.append("state", state);
    url.searchParams.append("code_challenge", codeChallenge);
    url.searchParams.append("code_challenge_method", "S256");

    window.location.href = url.toString();
  }


  const login_btn  = document.createElement("a");
  const logout_btn = document.createElement("a");
  const repos_ul   = document.createElement("ul");

  login_btn.className = logout_btn.className = 'btn';
  
 
  login_btn.innerText = "Log in with GitHub";
  login_btn.href = "#";
 
  login_btn.addEventListener("click", (e) => {
      e.preventDefault();
      iniciarLogin();
  });

 
  logout_btn.innerText = "Log out";
  logout_btn.href = "/"; 

  repos_ul.id = "repos";

  if (needs_login) {
    app.appendChild(login_btn);
  } else {
    app.appendChild(logout_btn);
  }
  app.appendChild(repos_ul);

 
  if (!needs_login) {
    const returnedState = queryString.get("state");
    const savedState = sessionStorage.getItem('auth_state');
    
    if (returnedState !== savedState) {
        repos_ul.innerHTML = `<li class="error">Erro de Segurança: State inválido. Tente logar novamente.</li>`;
        return; 
    }

    const codeVerifier = sessionStorage.getItem('auth_code_verifier');

    fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
          code: queryString.get("code"),
          code_verifier: codeVerifier 
      })
    }).then((response) => {
      return response.json();
    }).then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
      
      const token = data.token;
      
      sessionStorage.removeItem('auth_code_verifier');
      sessionStorage.removeItem('auth_state');

      return fetch("/api/repos", {
        method: "GET",
        headers: {
          token: token
        }
      });
    }).then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.json();
    }).then((data) => {
      if (data.status) {
        throw new Error(`${data.status} - ${data.message}`);
      }

      data.forEach((element) => {
        const li = document.createElement('li');
        if (element.private) {
          li.className = 'private';
        }
        li.innerHTML = `<a href="${element.html_url}" target="_blank" rel="noreferrer noopener">${element.full_name}</a>`;
        repos_ul.appendChild(li);
      });
    }).catch((error) => {
      repos_ul.innerHTML = `<li class="error">Error: ${error.message}</li>`;
    });
  }

})();