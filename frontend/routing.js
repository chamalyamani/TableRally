const routes = 
{
    login: "login-page",
    signup: "signup-page",
    resetpassword: "resetpassword-page",
    newpassword: "newpassword-page",
    dashboard: "dashboard-page",
    authentification: "authentification-page",
    chat: "chat-page",
    game: "game-page" ,
    settings: "settings-page",
};
  
function navigateTo(page) 
{
  // console.log("Navigating to:", page);
  const app = document.getElementById("app");
  const loader = document.getElementById("loader");

  loader.style.display = "flex";

  if (routes[page])
  {
    app.innerHTML = "";

    history.pushState({ page }, "", `/${page}`);
    app.innerHTML = `<${routes[page]}></${routes[page]}>`;

    document.body.className = `body-${page}`;

    const randomDelay = Math.floor(Math.random() * (900 - 100 + 1)) + 100;

    setTimeout(() => 
    {
      loader.style.display = "none";
    }, randomDelay);
  } 
  else 
    navigateTo("login");
}


window.addEventListener("popstate", (e) => 
{
    const state = e.state;
    if (state && state.page) 
    {
      navigateTo(state.page);
    }
});

document.addEventListener("DOMContentLoaded", () => 
{
    const path = window.location.pathname.slice(1);
    const page = path || "login";
    navigateTo(page);
});
  
