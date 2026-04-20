function typewriterEffect() {
    const element = document.getElementById("typewriter");
    if (!element) {
        return;
    }

    const text = "Data and Analytics";
    let index = 0;

    const type = () => {
        if (index <= text.length) {
            element.textContent = text.slice(0, index);
            index += 1;
            setTimeout(type, 70);
        }
    };

    type();
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(showToast.timerId);
    showToast.timerId = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2200);
}

showToast.timerId = null;

function setupNavigation() {
    const links = document.querySelectorAll('.nav-menu a, .hero-actions a');
    const sections = Array.from(document.querySelectorAll('#about, #experience, #skills, #projects, #linkedin, #contact'));
    const topbar = document.querySelector('.topbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
        });

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#') || href === '#') {
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            event.preventDefault();
            if (target.hidden) {
                return;
            }

            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    const updateActiveLink = () => {
        const profileVisible = document.body.classList.contains('profile-started');
        let currentId = 'about';
        sections.filter((section) => !section.hidden).forEach((section) => {
            const bounds = section.getBoundingClientRect();
            if (bounds.top <= window.innerHeight * 0.35) {
                currentId = section.id;
            }
        });

        document.querySelectorAll('.nav-menu a').forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });

        if (topbar) {
            const shouldShow = profileVisible && window.scrollY > Math.max(40, window.innerHeight * 0.08);
            topbar.classList.toggle('topbar-hidden', !shouldShow);
            topbar.classList.toggle('topbar-visible', shouldShow);
        }
    };

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    return {
        refresh: updateActiveLink
    };
}

function setupStartReveal(navigationController) {
    const startButton = document.getElementById('start-profile');
    const stage = document.getElementById('reveal-stage');
    const cards = Array.from(document.querySelectorAll('.content-card'));
    const heroName = document.querySelector('.hero-name');
    const aboutCard = document.getElementById('about');
    const transitionStar = document.getElementById('transition-star');

    if (!startButton || !stage || !cards.length) {
        return;
    }

    let started = false;
    let highestRevealedIndex = 0;
    let transitionRunning = false;

    const revealCardAt = (index) => {
        const card = cards[index];
        if (!card) {
            return;
        }

        if (card.hidden) {
            card.hidden = false;
        }

        requestAnimationFrame(() => {
            card.classList.add('is-visible');
        });
    };

    const unlockNextCard = () => {
        const nextIndex = highestRevealedIndex + 1;
        const nextCard = cards[nextIndex];
        if (!nextCard || !nextCard.hidden) {
            return;
        }

        highestRevealedIndex = nextIndex;
        revealCardAt(nextIndex);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || !started) {
                    return;
                }

                const index = cards.indexOf(entry.target);
                if (index === highestRevealedIndex) {
                    unlockNextCard();
                }
            });
        },
        {
            threshold: 0.72
        }
    );

    cards.forEach((card) => observer.observe(card));

    const runStarTransition = () => {
        if (!heroName || !aboutCard || !transitionStar) {
            return Promise.resolve();
        }

        const from = heroName.getBoundingClientRect();
        const to = aboutCard.getBoundingClientRect();

        const targetAnchorX = to.left + Math.min(54, to.width * 0.12);
        const startRangeMin = from.left + 10;
        const startRangeMax = from.right - 10;
        const dropX = Math.min(startRangeMax, Math.max(startRangeMin, targetAnchorX));
        const startY = from.top + from.height * 0.55;

        return new Promise((resolve) => {
            const duration = 1700;
            const startTime = performance.now();
            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
            const clamp01 = (value) => Math.max(0, Math.min(1, value));

            const step = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const easedDrop = easeOutCubic(progress);
                const currentTarget = aboutCard.getBoundingClientRect();
                const endY = currentTarget.top + Math.min(46, currentTarget.height * 0.22);
                const y = startY + (endY - startY) * easedDrop;

                const opacity = clamp01(1 - progress);
                const scale = 0.95 - progress * 0.42;

                transitionStar.style.opacity = String(Math.max(0, Math.min(1, opacity)));
                transitionStar.style.transform = `translate3d(${dropX}px, ${y}px, 0) scale(${Math.max(0.45, scale)})`;
                transitionStar.style.filter = `blur(${progress * 0.55}px)`;

                if (progress < 1) {
                    requestAnimationFrame(step);
                    return;
                }

                transitionStar.style.opacity = '0';
                transitionStar.style.filter = 'blur(0px)';
                resolve();
            }

            requestAnimationFrame(step);
        });
    };

    const revealProfile = async () => {
        if (transitionRunning) {
            return;
        }

        transitionRunning = true;

        if (started) {
            cards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            await runStarTransition();
            transitionRunning = false;
            return;
        }

        started = true;
        document.body.classList.add('profile-started');
        stage.hidden = false;
        highestRevealedIndex = 0;
        revealCardAt(0);

        requestAnimationFrame(() => {
            stage.classList.add('is-visible');
            if (navigationController) {
                navigationController.refresh();
            }
        });

        cards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

        await runStarTransition();
        transitionRunning = false;
    };

    startButton.addEventListener('click', revealProfile);
}

function setupContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        showToast("Transmission received. Thanks for reaching out.");
        form.reset();
    });
}

window.addEventListener("load", () => {
    typewriterEffect();
    const navigationController = setupNavigation();
    setupStartReveal(navigationController);
    setupContactForm();
});
