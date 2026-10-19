/* Keep the post beside the introduction and the map beside the open methods. */
(() => {
  const methods = document.querySelector("[data-whiplash] .bw-methods");
  const map = document.querySelector("[data-station-map]");
  const post = document.querySelector("[data-facebook-post]");
  const postContext = document.querySelector("[data-facebook-context]");
  if (!methods || !map || !("IntersectionObserver" in window)) return;
  const wide = window.matchMedia("(min-width: 1100px)");
  let dismissed = false, methodsVisible = false, postVisible = false;
  function render() {
    const showMap = methods.open && methodsVisible && !dismissed;
    const showPost = postVisible && !showMap && Boolean(post && postContext);
    map.classList.toggle("is-visible", showMap);
    map.inert = !showMap;
    if (post && postContext) {
      post.classList.toggle("is-visible", showPost);
      post.inert = wide.matches && !showPost;
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === methods) {
          methodsVisible = entry.isIntersecting;
          if (!methodsVisible) dismissed = false;
        } else {
          postVisible = entry.isIntersecting;
        }
      }
      render();
    },
    { rootMargin: "-15% 0px -15% 0px" },
  );
  observer.observe(methods);
  methods.addEventListener("toggle", () => {
    dismissed = false;
    render();
  });
  if (post && postContext) {
    post.dataset.sidebarReady = "";
    observer.observe(postContext);
  }
  wide.addEventListener("change", render);
  render();
  map.querySelector("[data-map-close]").addEventListener("click", () => {
    dismissed = true;
    render();
  });
})();
