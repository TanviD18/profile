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
    let touchStartY = null;
    let wheelGestureActive = false;
    let wheelDeltaAccumulator = 0;
    let revealUnlockTimerId = null;

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

    const unlockNextCard = async () => {
        const nextIndex = highestRevealedIndex + 1;
        const currentCard = cards[highestRevealedIndex];
        const nextCard = cards[nextIndex];
        if (!currentCard || !nextCard || !nextCard.hidden || transitionRunning) {
            return;
        }

        transitionRunning = true;
        highestRevealedIndex = nextIndex;
        revealCardAt(nextIndex);
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await runStarTransition(currentCard, nextCard);
        transitionRunning = false;
        releaseRevealLock();
    };

    const triggerNextCardReveal = () => {
        if (!started || transitionRunning) {
            return;
        }

        unlockNextCard();
    };

    const hasHiddenNextCard = () => Boolean(cards[highestRevealedIndex + 1]?.hidden);

    const resetWheelGesture = () => {
        if (revealUnlockTimerId) {
            clearTimeout(revealUnlockTimerId);
            revealUnlockTimerId = null;
        }

        wheelGestureActive = false;
        wheelDeltaAccumulator = 0;
    };

    const releaseRevealLock = () => {
        if (revealUnlockTimerId) {
            clearTimeout(revealUnlockTimerId);
        }

        revealUnlockTimerId = window.setTimeout(() => {
            resetWheelGesture();
        }, 140);
    };

    const resetRevealSequence = () => {
        resetWheelGesture();
        highestRevealedIndex = 0;
        stage.hidden = true;
        stage.classList.remove('is-visible');

        cards.forEach((card, index) => {
            card.hidden = index !== 0;
            card.classList.remove('is-visible', 'is-current');
        });
    };

    window.addEventListener('wheel', (event) => {
        if (!started || !hasHiddenNextCard() || event.deltaY <= 16) {
            return;
        }

        event.preventDefault();

        if (wheelGestureActive) {
            return;
        }

        wheelDeltaAccumulator += event.deltaY;
        if (wheelDeltaAccumulator < 70) {
            return;
        }

        wheelGestureActive = true;
        wheelDeltaAccumulator = 0;
        triggerNextCardReveal();
    }, { passive: false });

    window.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0]?.clientY ?? null;
    }, { passive: true });

    window.addEventListener('touchend', (event) => {
        if (touchStartY === null) {
            return;
        }

        const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
        const deltaY = touchStartY - touchEndY;
        touchStartY = null;

        if (deltaY > 40) {
            wheelGestureActive = true;
            wheelDeltaAccumulator = 0;
            triggerNextCardReveal();
        }
    }, { passive: true });

    window.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'PageDown', ' '].includes(event.key)) {
            return;
        }

        if (event.target instanceof HTMLElement) {
            const tagName = event.target.tagName;
            if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
                return;
            }
        }

        if (!started || !hasHiddenNextCard()) {
            return;
        }

        event.preventDefault();
        if (wheelGestureActive) {
            return;
        }

        wheelGestureActive = true;
        wheelDeltaAccumulator = 0;
        triggerNextCardReveal();
    });

    const runStarTransition = (fromElement, toElement) => {
        if (!fromElement || !toElement || !transitionStar) {
            return Promise.resolve();
        }

        const getPath = () => {
            const from = fromElement.getBoundingClientRect();
            const to = toElement.getBoundingClientRect();
            const targetX = to.left + Math.min(54, to.width * 0.12);

            if (fromElement === heroName) {
                const startRangeMin = from.left + 10;
                const startRangeMax = from.right - 10;

                return {
                    startX: Math.min(startRangeMax, Math.max(startRangeMin, targetX)),
                    startY: from.top + from.height * 0.55,
                    endX: targetX,
                    endY: to.top + Math.min(46, to.height * 0.22)
                };
            }

            return {
                startX: from.left + Math.min(54, from.width * 0.12),
                startY: from.bottom - Math.min(36, from.height * 0.18),
                endX: targetX,
                endY: to.top + Math.min(46, to.height * 0.22)
            };
        };

        return new Promise((resolve) => {
            const duration = fromElement === heroName ? 1700 : 980;
            const startTime = performance.now();
            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
            const clamp01 = (value) => Math.max(0, Math.min(1, value));

            const step = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const easedDrop = easeOutCubic(progress);
                const path = getPath();
                const x = path.startX + (path.endX - path.startX) * easedDrop;
                const y = path.startY + (path.endY - path.startY) * easedDrop;

                const opacity = clamp01(1 - progress);
                const scale = 0.95 - progress * 0.42;

                transitionStar.style.opacity = String(Math.max(0, Math.min(1, opacity)));
                transitionStar.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${Math.max(0.45, scale)})`;
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
            resetRevealSequence();
        } else {
            started = true;
            document.body.classList.add('profile-started');
        }

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

        await runStarTransition(heroName, aboutCard);
        transitionRunning = false;
        releaseRevealLock();
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

function setupScrollPlayfulness() {
    const cards = Array.from(document.querySelectorAll('.content-card'));

    if (!cards.length) {
        return;
    }

    let ticking = false;

    const updateScrollState = () => {
        const doc = document.documentElement;
        const scrollableHeight = Math.max(doc.scrollHeight - window.innerHeight, 1);
        const scrollProgress = Math.min(window.scrollY / scrollableHeight, 1);

        document.body.style.setProperty('--scroll-progress', scrollProgress.toFixed(4));

        const visibleCards = cards.filter((card) => !card.hidden);
        let currentCard = visibleCards[0] || null;
        let bestDistance = Number.POSITIVE_INFINITY;
        const viewportAnchor = window.innerHeight * 0.42;

        visibleCards.forEach((card) => {
            const bounds = card.getBoundingClientRect();
            const cardCenter = bounds.top + bounds.height / 2;
            const distance = Math.abs(cardCenter - viewportAnchor);

            if (distance < bestDistance) {
                bestDistance = distance;
                currentCard = card;
            }
        });

        cards.forEach((card) => {
            card.classList.toggle('is-current', card === currentCard);
        });

        if (currentCard) {
            const bounds = currentCard.getBoundingClientRect();
            const spotlightY = Math.max(16, Math.min(window.innerHeight - 40, bounds.top + bounds.height / 2));
            document.body.style.setProperty('--spotlight-y', `${spotlightY}px`);
        }

        ticking = false;
    };

    const requestTick = () => {
        if (ticking) {
            return;
        }

        ticking = true;
        requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    requestTick();

    return {
        refresh: requestTick
    };
}

window.addEventListener("load", () => {
    typewriterEffect();
    const navigationController = setupNavigation();
    const scrollPlayfulnessController = setupScrollPlayfulness();
    setupStartReveal(navigationController);
    setupContactForm();

    if (scrollPlayfulnessController) {
        scrollPlayfulnessController.refresh();
    }
});
