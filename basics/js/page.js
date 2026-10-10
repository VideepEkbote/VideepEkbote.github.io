(function () {
    var toggle = document.getElementById("themeToggle");
    var root = document.documentElement;

    function setTheme(theme) {
        if (theme === "light") {
            root.classList.add("light-mode");
            localStorage.setItem("theme", "light");
        } else {
            root.classList.remove("light-mode");
            localStorage.setItem("theme", "dark");
        }
    }

    if (toggle) {
        toggle.addEventListener("click", function () {
            setTheme(root.classList.contains("light-mode") ? "dark" : "light");
        });
    }

    var bar = document.querySelector(".progress span");
    if (bar) {
        var onScroll = function () {
            var height = document.documentElement.scrollHeight - window.innerHeight;
            var amount = height > 0 ? (window.scrollY / height) * 100 : 0;
            bar.style.width = amount + "%";
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    var topBtn = document.getElementById("backToTop");
    if (topBtn) {
        window.addEventListener("scroll", function () {
            topBtn.classList.toggle("visible", window.pageYOffset > 420);
        }, { passive: true });
        topBtn.addEventListener("click", function () {
            var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        });
    }
})();
