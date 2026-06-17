/**
 * Dra. Clínica Premium - Main JavaScript Core Logic
 */

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. HEADER SCROLL EFFECT ---
    const mainHeader = document.getElementById('mainHeader');

    function toggleHeaderScrollClass() {
        if (window.scrollY > 50) {
            mainHeader.classList.add('navbar-scrolled');
        } else {
            mainHeader.classList.remove('navbar-scrolled');
        }
    }

    // Initial check and scroll listener
    toggleHeaderScrollClass();
    window.addEventListener('scroll', toggleHeaderScrollClass);


    // --- 2. MOBILE NAVBAR AUTO-CLOSE ---
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    const navbarCollapse = document.getElementById('navbarNav');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Check if Bootstrap Collapse is active and visible
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        });
    });


    // --- 3. SCROLL SPY (ACTIVE NAVIGATION NAVIGATION INDICATOR) ---
    const sections = document.querySelectorAll('section[id]');

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.2, // Section must cover at least 20% of viewport
        rootMargin: '-10% 0px -70% 0px'
    });

    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });


    // --- 4. SCROLL REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll(
        '.scroll-reveal-fade-up, .scroll-reveal-fade-left, .scroll-reveal-fade-right'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-reveal-active');
                // Optional: stop observing once revealed to maintain performance
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    // --- 5. SOCIAL PROOF DYNAMIC COUNT ANIMATIONS ---
    const counterPacientes = document.getElementById('counterPacientes');
    const counterProcedimentos = document.getElementById('counterProcedimentos');
    const counterAnos = document.getElementById('counterAnos');

    // Default values if [X] remains in HTML
    const defaultStats = {
        pacientes: 1500,
        procedimentos: 3200,
        anos: 8
    };

    function parseHTMLStat(element, fallbackValue) {
        const text = element.textContent.trim();
        // Extract numbers from text (e.g. "+1.200" or "+[X]" -> 1200 or fallback)
        const digitsOnly = text.replace(/\D/g, '');
        if (digitsOnly === '' || text.includes('[X]')) {
            return fallbackValue;
        }
        return parseInt(digitsOnly, 10);
    }

    const targetPacientes = parseHTMLStat(counterPacientes, defaultStats.pacientes);
    const targetProcedimentos = parseHTMLStat(counterProcedimentos, defaultStats.procedimentos);
    const targetAnos = parseHTMLStat(counterAnos, defaultStats.anos);

    let animated = false;

    function animateCounters() {
        if (animated) return;
        animated = true;

        animateValue(counterPacientes, 0, targetPacientes, 2000, '+');
        animateValue(counterProcedimentos, 0, targetProcedimentos, 2000, '+');
        animateValue(counterAnos, 0, targetAnos, 1500, '');
    }

    function animateValue(element, start, end, duration, prefix = '') {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(easeProgress * (end - start) + start);

            // Format number with thousand separator
            const formatted = currentValue.toLocaleString('pt-BR');
            element.textContent = prefix + formatted;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = prefix + end.toLocaleString('pt-BR');
            }
        };
        window.requestAnimationFrame(step);
    }

    // Trigger counters animation when social proof bar enters viewport
    const socialProofSection = document.getElementById('prova-social');
    if (socialProofSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                statsObserver.unobserve(socialProofSection);
            }
        }, { threshold: 0.5 });
        statsObserver.observe(socialProofSection);
    }


    // --- 6. PHONE NUMBER INPUT MASK ---
    const phoneInput = document.getElementById('formPhone');

    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);

            if (!x[2]) {
                e.target.value = x[1];
            } else {
                e.target.value = '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            }
        });

        // Prevent typing non-numeric keys manually just in case
        phoneInput.addEventListener('keydown', function (e) {
            const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
            if (allowedKeys.includes(e.key)) return;

            // Allow only numbers
            if (!/\d/.test(e.key)) {
                e.preventDefault();
            }
        });
    }


    // --- 7. LEAD FORM VALIDATION & HANDLING ---
    const leadForm = document.getElementById('leadForm');
    const formSuccessAlert = document.getElementById('formSuccessAlert');
    const formErrorAlert = document.getElementById('formErrorAlert');

    if (leadForm) {
        leadForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            // Clear previous alerts
            formSuccessAlert.classList.add('d-none');
            formErrorAlert.classList.add('d-none');

            const name = document.getElementById('formName');
            const phone = document.getElementById('formPhone');
            const email = document.getElementById('formEmail');
            const consent = document.getElementById('formConsent');

            let isValid = true;

            // Name validation
            if (name.value.trim().length < 3) {
                name.classList.add('is-invalid');
                isValid = false;
            } else {
                name.classList.remove('is-invalid');
                name.classList.add('is-valid');
            }

            // Phone validation - format (XX) XXXXX-XXXX
            const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
            if (!phoneRegex.test(phone.value.trim())) {
                phone.classList.add('is-invalid');
                isValid = false;
            } else {
                phone.classList.remove('is-invalid');
                phone.classList.add('is-valid');
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                email.classList.add('is-invalid');
                isValid = false;
            } else {
                email.classList.remove('is-invalid');
                email.classList.add('is-valid');
            }

            // Consent validation
            if (!consent.checked) {
                consent.classList.add('is-invalid');
                isValid = false;
            } else {
                consent.classList.remove('is-invalid');
                consent.classList.add('is-valid');
            }

            if (!isValid) {
                formErrorAlert.classList.remove('d-none');
                return;
            }

            // Form is valid - Simulate lead capture API submission
            const submitBtn = document.getElementById('formSubmitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            // Simulate server network latency
            setTimeout(() => {
                // Success feedback
                formSuccessAlert.classList.remove('d-none');
                leadForm.reset();

                // Clear validation classes
                name.classList.remove('is-valid');
                phone.classList.remove('is-valid');
                email.classList.remove('is-valid');
                consent.classList.remove('is-valid');

                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Solicitação de Avaliação';

                // Marketing Conversion Track Call
                trackMarketingLead(name.value, email.value, phone.value);
            }, 1500);
        });
    }


    // --- 8. MARKETING CONVERSION TRACKING ---
    // Helper function for tracking lead submissions
    function trackMarketingLead(name, email, phone) {
        console.log('Lead Capturado com Sucesso: ', { name, email, phone });

        // Google Analytics 4 Custom Event Trigger
        if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', {
                'event_category': 'Leads',
                'event_label': 'Formulário de Avaliação'
            });
        }

        // Meta Pixel Lead Event Trigger
        if (typeof fbq === 'function') {
            fbq('track', 'Lead', {
                content_name: 'Formulário de Avaliação',
                status: 'Success'
            });
        }
    }

    // WhatsApp Cta Conversion Tracking Hooks
    const whatsappElements = [
        document.getElementById('navCtaBtn'),
        document.getElementById('heroCtaWhatsapp'),
        document.getElementById('aboutCtaWhatsapp'),
        document.getElementById('proceduresCtaWhatsapp'),
        document.getElementById('faqCtaWhatsapp'),
        document.getElementById('finalCtaWhatsapp'),
        document.getElementById('floatingWhatsappBtn')
    ];

    whatsappElements.forEach(element => {
        if (element) {
            element.addEventListener('click', function () {
                console.log('WhatsApp CTA Clicado: ' + element.id);

                // Google Analytics 4 Custom Event Trigger
                if (typeof gtag === 'function') {
                    gtag('event', 'click_whatsapp', {
                        'event_category': 'Contact',
                        'event_label': element.id
                    });
                }

                // Meta Pixel Contact Event Trigger
                if (typeof fbq === 'function') {
                    fbq('track', 'Contact', {
                        content_name: 'WhatsApp Button Click',
                        content_category: element.id
                    });
                }
            });
        }
    });

});
