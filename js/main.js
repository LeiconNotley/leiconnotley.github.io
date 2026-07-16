/* ==========================================================================
   Leicon Notley & Leicon Electrical and Controls Enigeering
   Main Stylesheet
   ========================================================================== */

/* ===== 1. HEADER, NAV, HAMBURGER, FADE-IN, FILTER, BACK-TO-TOP ===== */
(function () {
  'use strict';

  // ----- Header scroll shadow -----
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ----- Hamburger menu -----
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      nav.classList.toggle('open');
    });

    document.querySelectorAll('nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
      }
    });
  }

  // ----- Active nav link on scroll -----
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('nav a');
  window.addEventListener('scroll', function () {
    var current = '';
    sections.forEach(function (section) {
      var sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // ----- Fade-in animations on scroll -----
  var animateElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  animateElements.forEach(function (el) { observer.observe(el); });

  // ----- Project category filter -----
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');
  
  
  // ----- Re-apply row alternation to only visible project cards -----
  function reapplyProjectAlternation() {
    var projectsSection = document.getElementById('projects');
    var isExpanded = projectsSection && projectsSection.classList.contains('projects-expanded');
    var visibleIndex = 0;

    projectCards.forEach(function (card) {
      card.classList.remove('project-row-left', 'project-row-right');

      var filteredOut = card.style.display === 'none';
      var collapsedHidden = card.classList.contains('project-hidden') && !isExpanded;

      if (!filteredOut && !collapsedHidden) {
        card.classList.add(visibleIndex % 2 === 0 ? 'project-row-left' : 'project-row-right');
        visibleIndex++;
      }
    });
  }
  window.reapplyProjectAlternation = reapplyProjectAlternation;
  
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      var projectsSectionEl = document.getElementById('projects');
      if (projectsSectionEl && filter && filter !== 'all') {
        projectsSectionEl.classList.add('projects-expanded');
      }
      projectCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category').indexOf(filter) !== -1) {
          card.classList.remove('hidden');
          card.style.display = '';
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });
      reapplyProjectAlternation();
    });
  });

  // ----- Back to top button -----
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();


/* ===== 2. UNIFIED SPLASH + HERO STATS COUNTER (FIXED) ===== */
(function () {
  'use strict';

  var splash = document.getElementById('splashScreen');
  var countersAnimated = false;

  // ----- Counter formatter -----
  function formatValue(value, target) {

    var atFinalValue = (value === target);

    if (target === 1987) return String(value);
    if (target === 300)  return value + (atFinalValue ? '+' : '');
    if (target === 5000) return value + (atFinalValue ? '+' : '');
    if (target === 3)    return String(value);
    return String(value);
  }

  // ----- Animate all hero-stat counters -----
  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    var counters = document.querySelectorAll('.hero-stat .number[data-target]');
    console.log('[Counter] Starting animation for', counters.length, 'counters');

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      var duration = 2000;
      var startTime = performance.now();

      function update(now) {
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        counter.textContent = formatValue(current, target);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = formatValue(target, target);
        }
      }
      requestAnimationFrame(update);
    });
  }

  // ----- Splash flow: reveal hero, THEN start counters -----
  function finishSplash() {
    if (splash) {
      splash.classList.add('done');
    }
    document.body.classList.remove('splash-loading');
    document.body.classList.add('hero-visible');
    // Wait for hero cascade to complete before starting counters
    setTimeout(animateCounters, 1200);
  }

  // ----- Skip splash on mobile or when missing -----
  if (window.innerWidth <= 920 || !splash) {
    if (splash) splash.remove();
    document.body.classList.add('hero-visible');
    setTimeout(animateCounters, 400);
    return;
  }

  // ----- Desktop: show splash for 3.6s, then reveal -----
  document.body.classList.add('splash-loading');
  setTimeout(finishSplash, 3600);

  // Allow user to skip splash by clicking
  splash.addEventListener('click', finishSplash);

  // ----- Safety net: if 8s pass and counters haven't started, force them -----
  setTimeout(function () {
    if (!countersAnimated) {
      console.warn('[Counter] Safety-net trigger fired');
      animateCounters();
    }
  }, 8000);
})();


/* ===== 3. PROJECT SLIDESHOW ===== */
(function () {
  'use strict';

  document.querySelectorAll('.project-slideshow').forEach(function (slideshow) {
    var track = slideshow.querySelector('.slideshow-track');
    var slides = track.querySelectorAll('img');
    var prevBtn = slideshow.querySelector('.slide-prev');
    var nextBtn = slideshow.querySelector('.slide-next');
    var dotsContainer = slideshow.querySelector('.slide-dots');
    var counter = slideshow.querySelector('.slide-counter');
    var currentIndex = 0;

    if (slides.length <= 1) {
      slideshow.classList.add('single-image');
      return;
    }

    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.className = 'slide-dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        goToSlide(index);
      });
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll('.slide-dot');

    function goToSlide(index) {
      currentIndex = index;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
    }

    function nextSlide() { goToSlide((currentIndex + 1) % slides.length); }
    function prevSlide() { goToSlide((currentIndex - 1 + slides.length) % slides.length); }

    if (prevBtn) prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      prevSlide();
    });
    if (nextBtn) nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      nextSlide();
    });

    var touchStartX = 0;
    var touchEndX = 0;

    slideshow.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slideshow.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var swipeThreshold = 50;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    if (counter) counter.textContent = '1 / ' + slides.length;
  });
})();


/* ===== 4. PROJECTS "SEE MORE / SEE LESS" TOGGLE + LAZY LOAD ===== */
(function () {
  'use strict';

  const projectsSection = document.getElementById('projects');
  const toggleBtn = document.getElementById('projectsToggle');
  if (!projectsSection || !toggleBtn) return;

  const toggleText = toggleBtn.querySelector('.toggle-text');

  // ----- Lazy-load helper: load ONLY the first frame of each hidden project card -----
  //   Subsequent slideshow frames are loaded just-in-time by Section 6 as the
  //   user navigates the carousel, keeping initial payload minimal.
  function loadHiddenProjectImages() {
    const hiddenCards = projectsSection.querySelectorAll('.project-card.project-hidden');
    hiddenCards.forEach(function (card) {
      const firstImg = card.querySelector('.slideshow-track img[data-src]');
      if (firstImg) {
        firstImg.src = firstImg.getAttribute('data-src');
        firstImg.removeAttribute('data-src');
      }
    });
  }

  toggleBtn.addEventListener('click', function () {
    const expanded = projectsSection.classList.toggle('projects-expanded');
    toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (toggleText) {
      toggleText.textContent = expanded ? 'See Less Projects' : 'See More Projects';
    }
    if (expanded) {
      // Trigger download of first frame in each previously-hidden card
      loadHiddenProjectImages();
    } else {
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof window.reapplyProjectAlternation === 'function') window.reapplyProjectAlternation();
  });

  document.querySelectorAll('#projects .filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.filter && btn.dataset.filter !== 'all') {
        projectsSection.classList.add('projects-expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
        if (toggleText) toggleText.textContent = 'See Less Projects';
        // Trigger download of first frame in each previously-hidden card
        loadHiddenProjectImages();
      }
    });
    if (typeof window.reapplyProjectAlternation === 'function') window.reapplyProjectAlternation();
  });
})();


/* ===== 5. FLOATING CONTACT FAB VISIBILITY ===== */
(function () {
  'use strict';

  const fab = document.getElementById('contactFab');
  const homeSection = document.getElementById('home');
  const contactSection = document.getElementById('contact');
  if (!fab || !homeSection) return;

  let heroOut = false;
  let inContact = false;

  const updateFab = () => {
    if (heroOut && !inContact) {
      fab.classList.add('is-visible');
    } else {
      fab.classList.remove('is-visible');
    }
  };

  // Watch entire HOME section (works on all devices)
  new IntersectionObserver(function (entries) {
    heroOut = !entries[0].isIntersecting;
    updateFab();
  }, { threshold: 0.1 }).observe(homeSection);

  // Watch contact section
  if (contactSection) {
    new IntersectionObserver(function (entries) {
      inContact = entries[0].isIntersecting;
      updateFab();
    }, { threshold: 0.2 }).observe(contactSection);
  }
})();

/* ===== 6. SLIDESHOW JUST-IN-TIME FRAME LAZY LOAD ===== */
(function () {
  'use strict';

  // Swap data-src -> src on a single img (no-op if already loaded)
  function loadImg(img) {
    if (img && img.hasAttribute('data-src')) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    }
  }

  // For a given slideshow-track, ensure the img at index (and its neighbours) are loaded
  function ensureFramesLoaded(track, index) {
    const imgs = track.querySelectorAll('img');
    if (!imgs.length) return;
    // Load current frame
    loadImg(imgs[index]);
    // Preload next frame for smooth forward navigation
    if (index + 1 < imgs.length) loadImg(imgs[index + 1]);
    // Preload previous frame for smooth backward navigation
    if (index - 1 >= 0) loadImg(imgs[index - 1]);
  }

  // Derive current active slide index from the track's inline transform value.
  //   Section 3 sets: track.style.transform = 'translateX(-N%)'
  function getActiveIndex(track) {
    const t = track.style.transform || '';
    const m = t.match(/translateX\(\s*-?(\d+(?:\.\d+)?)%\s*\)/);
    if (m) return Math.round(parseFloat(m[1]) / 100);
    return 0;
  }

  const tracks = document.querySelectorAll('.project-slideshow .slideshow-track');

  tracks.forEach(function (track) {
    // Initial state: load current + neighbours
    ensureFramesLoaded(track, getActiveIndex(track));

    // Watch for transform changes (Section 3 mutates track.style.transform on nav)
    const mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName === 'style') {
          ensureFramesLoaded(track, getActiveIndex(track));
        }
      });
    });
    mo.observe(track, { attributes: true, attributeFilter: ['style'] });
  });

  // Safety net: when the projects section expands via "See More" or a filter,
  // ensure each newly-revealed hidden card's neighbouring frames are loaded too.
  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    const sectionObserver = new MutationObserver(function () {
      if (projectsSection.classList.contains('projects-expanded')) {
        document.querySelectorAll(
          '#projects .project-card.project-hidden .slideshow-track'
        ).forEach(function (track) {
          ensureFramesLoaded(track, getActiveIndex(track));
        });
      }
    });
    sectionObserver.observe(projectsSection, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
})();

/* ===== 7. CURRENT VACANCIES ACCORDION ===== */
(function () {
  'use strict';
  var headers = document.querySelectorAll('.vacancy-header');
  if (!headers.length) return;

  function closeCard(card) {
    var header = card.querySelector('.vacancy-header');
    var body   = card.querySelector('.vacancy-body');
    card.classList.remove('open');
    header.setAttribute('aria-expanded', 'false');
    body.style.maxHeight = null;
    // Delay hidden attribute until after transition for a11y
    setTimeout(function () {
      if (!card.classList.contains('open')) body.setAttribute('hidden', '');
    }, 400);
  }

  function openCard(card) {
    var header = card.querySelector('.vacancy-header');
    var body   = card.querySelector('.vacancy-body');
    body.removeAttribute('hidden');
    card.classList.add('open');
    header.setAttribute('aria-expanded', 'true');
    // Force layout, then set to scrollHeight for smooth animation
    body.style.maxHeight = body.scrollHeight + 'px';
  }

  headers.forEach(function (header) {
    header.addEventListener('click', function () {
      var card = header.closest('.vacancy-card');
      if (!card) return;
      var isOpen = card.classList.contains('open');

      // OPTIONAL: close all others for a true single-open accordion.
      // Comment out this block if you'd like multiple cards open at once.
      document.querySelectorAll('.vacancy-card.open').forEach(function (openCardEl) {
        if (openCardEl !== card) closeCard(openCardEl);
      });

      if (isOpen) closeCard(card);
      else openCard(card);
    });
  });

  // Recompute open card height on resize (content reflows on narrow screens)
  window.addEventListener('resize', function () {
    document.querySelectorAll('.vacancy-card.open .vacancy-body').forEach(function (body) {
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  });
})();