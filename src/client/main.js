import "./style.css";


const needs_login = true;

(() => {
  document.querySelector('#app').innerHTML = `<p>${import.meta.env.VITE_REDIRECT_URI}</p>`;
})();
