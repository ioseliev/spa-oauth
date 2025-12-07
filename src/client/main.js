import "./style.css";
import { getRedirectUrl } from './utils';


const app = document.querySelector("#app");

const queryString = new URLSearchParams(window.location.search);
const needs_login = !queryString.has('code');

(() => {
  const login_btn  = document.createElement("a");
  const logout_btn = document.createElement("a");
  const repos_ul   = document.createElement("ul");

  login_btn.className = logout_btn.className = 'btn';

  // Login button
  login_btn.innerText = "Log in with GitHub";
  login_btn.href = getRedirectUrl(); // TODO

  // Logout button
  logout_btn.innerText = "Log out";
  logout_btn.href = "/";

  // Repos div
  repos_ul.id = "repos";

  if (needs_login) {
    app.appendChild(login_btn);
  } else {
    app.appendChild(logout_btn);
  }
  app.appendChild(repos_ul);

  if (!needs_login) {
    fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: queryString.get("code") })
    }).then((response) => {
      if (response.ok) {
        const token = response.json().token.substring(0, 5);
        const temp = document.createElement("li");
        temp.innerText = token;
        repos_ul.appendChild(temp);
      } else {
        throw new Error(response.text());
      }
    }).catch((error) => {
      repos_ul.innerHTML = `<li class="error">Error: ${error.message}</li>`;
    });
  }
})();
