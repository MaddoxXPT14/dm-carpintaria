(() => {
  const header = document.querySelector(".site-header");
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navCta = document.querySelector(".nav-cta");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  burger?.addEventListener("click", () => {
    nav.classList.toggle("open");
    navCta.classList.toggle("open");
    burger.setAttribute("aria-expanded", nav.classList.contains("open"));
  });

  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      navCta.classList.remove("open");
    });
  });

  document.querySelectorAll(".faq-item button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const open = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((el) => el.classList.remove("open"));
      if (!open) item.classList.add("open");
    });
  });

  const filterBtns = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".gal-item");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      items.forEach((it) => {
        it.classList.toggle("hide", f !== "all" && it.dataset.cat !== f);
      });
    });
  });

  const lb = document.querySelector(".lightbox");
  const lbImg = lb?.querySelector("img");
  document.querySelectorAll(".gal-item").forEach((it) => {
    it.addEventListener("click", () => {
      const src = it.querySelector("img").src;
      lbImg.src = src;
      lb.classList.add("open");
    });
  });
  lb?.querySelector("button").addEventListener("click", () => lb.classList.remove("open"));
  lb?.addEventListener("click", (e) => {
    if (e.target === lb) lb.classList.remove("open");
  });

  const form = document.querySelector("#lead-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const msg = encodeURIComponent(
      `Olá, o meu nome é ${data.nome}.\nTelefone: ${data.telefone}\nEmail: ${data.email || "—"}\nServiço: ${data.servico}\nLocalidade: ${data.localidade || "—"}\n\nMensagem:\n${data.mensagem}`
    );
    const success = document.querySelector(".form-success");
    success.style.display = "block";
    window.open(`https://wa.me/351911829220?text=${msg}`, "_blank");
    form.reset();
  });

  const cookie = document.querySelector(".cookie");
  if (cookie && !localStorage.getItem("dm-cookie")) cookie.classList.add("show");
  document.querySelector("#accept-cookies")?.addEventListener("click", () => {
    localStorage.setItem("dm-cookie", "1");
    cookie.classList.remove("show");
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
