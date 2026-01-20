// Typewriter effect with backspace
function typewriterEffect() {
    const element = document.getElementById('typewriter');
    const text = 'Welcome to my creative place!';
    let index = 0;
    let isDeleting = false;
    let speed = 200;
    const deleteSpeed = 150;
    const pauseTime = 2000;
    let cycles = 0;
    const maxCycles = 1;

    function type() {
        if (!isDeleting && index < text.length) {
            element.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(type, speed);
        } else if (isDeleting && index > 0) {
            element.textContent = text.substring(0, index - 1);
            index--;
            setTimeout(type, deleteSpeed);
        } else if (!isDeleting && index === text.length) {
            // Pause before deleting
            setTimeout(() => {
                isDeleting = true;
                type();
            }, pauseTime);
        } else if (isDeleting && index === 0) {
            cycles++;
            // Stop after maxCycles, otherwise start typing again
            if (cycles < maxCycles) {
                isDeleting = false;
                setTimeout(type, 300);
            } else {
                // Animation complete - keep the text visible
                element.textContent = text;
            }
        }
    }

    type();
}

// Initialize typewriter effect when page loads
window.addEventListener('load', typewriterEffect);

// Show welcome message when button is clicked
function showMessage() {
    alert('Welcome! Thank you for visiting my website. Feel free to explore and get in touch!');
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! I will get back to you soon.');
    event.target.reset();
}

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animation for service cards
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        const cardPosition = card.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (cardPosition < screenPosition) {
            card.style.opacity = '1';
            card.style.animation = 'slideUp 0.6s ease forwards';
        }
    });
});

// Add slide-up animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Log page load
console.log('Website loaded successfully!');
