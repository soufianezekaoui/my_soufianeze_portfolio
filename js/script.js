$(document).ready(function () {

    /* ============================================================  NAVBAR — scroll behavior & mobile menu  ============================================================ */
    const $navbar = $('#navbar');
  
    $(window).on('scroll.navbar', function () {
      if ($(this).scrollTop() > 60) {
        $navbar.addClass('scrolled');
      } else {
        $navbar.removeClass('scrolled');
      }
    });
  
    // Active nav link on scroll
    const sections = $('section[id]');
    $(window).on('scroll.navactive', function () {
      let current = '';
      sections.each(function () {
        const sectionTop = $(this).offset().top - 120;
        if ($(window).scrollTop() >= sectionTop) {
          current = $(this).attr('id');
        }
      });
      $('.nav-link-item').removeClass('active');
      $(`.nav-link-item[href="#${current}"]`).addClass('active');
    });
  
    // Smooth scroll for all anchor links
    $(document).on('click', 'a[href^="#"]', function (e) {
      const target = $(this).attr('href');
      if (target.length > 1 && $(target).length) {
        e.preventDefault();
        const offset = $(target).offset().top - 70;
        $('html, body').animate({ scrollTop: offset }, 700, 'swing');
      }
    });
  
    /* ============================================================  SCROLL-TO-TOP BUTTON  ============================================================ */
    const $scrollBtn = $('#scrollTopBtn');
  
    $(window).on('scroll.scrolltop', function () {
      if ($(this).scrollTop() > 400) {
        $scrollBtn.addClass('visible');
      } else {
        $scrollBtn.removeClass('visible');
      }
    });
  
    $scrollBtn.on('click', function () {
      $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
    });
  
    /* ============================================================  REVEAL ANIMATIONS  ============================================================ */
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          $(entry.target).addClass('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  
    // Observe all reveal elements
    $('.reveal, .project-card, .timeline-item').each(function () {
      revealObserver.observe(this);
    });
  
    /* ============================================================  TYPING EFFECT — Hero subtitle  ============================================================ */
    const roles = [
      'Full Stack Developer',
      'Information Systems Engineer',
      'React & Spring Boot Builder',
      'Data-Driven Problem Solver'
    ];
  
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const $typed = $('#typed-text');
  
    function typeLoop() {
      const current = roles[roleIndex];
  
      if (isDeleting) {
        $typed.text(current.substring(0, charIndex - 1));
        charIndex--;
      } else {
        $typed.text(current.substring(0, charIndex + 1));
        charIndex++;
      }
  
      let speed = isDeleting ? 50 : 90;
  
      if (!isDeleting && charIndex === current.length) {
        speed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 400;
      }
  
      setTimeout(typeLoop, speed);
    }
  
    typeLoop();
  
    /* ============================================================  LOAD CERTIFICATIONS VIA AJAX  ============================================================ */
    function loadCertifications() {
      const $container = $('#cert-track-inner');
  
      $.ajax({
        url: './assets/certifications.json',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
          const certs = data.certifications;
          let html = '';
  
          // Build cards
          function buildCards(list) {
            return list.map(function (cert) {
              return `
                <a href="${cert.url}" target="_blank" class="cert-card">
                  <div class="cert-icon">
                    <i class="${cert.icon}" style="color:${cert.color}"></i>
                  </div>
                  <div class="cert-info">
                    <div class="cert-name">${cert.title}</div>
                    <div class="cert-issuer">${cert.issuer} · ${cert.year}</div>
                  </div>
                </a>`;
            }).join('');
          }
  
          // Duplicate for infinite scroll illusion
          html = buildCards(certs) + buildCards(certs);
          $container.html(html).css('opacity', 0).animate({ opacity: 1 }, 500);
        },
        error: function () {
          $('#cert-track-inner').html(
            '<div class="cert-loading">Could not load certifications. Please refresh.</div>'
          );
        }
      });
    }
  
    loadCertifications();
  
    /* ============================================================  PROJECT FILTER  ============================================================ */
    $(document).on('click', '.filter-btn', function () {
      const filter = $(this).data('filter');
      $('.filter-btn').removeClass('active');
      $(this).addClass('active');
  
      if (filter === 'all') {
        $('.project-card').fadeIn(350);
      } else {
        $('.project-card').each(function () {
          const categories = $(this).data('category') || '';
          if (categories.includes(filter)) {
            $(this).fadeIn(350);
          } else {
            $(this).fadeOut(200);
          }
        });
      }
    });
  
    /* ============================================================  CONTACT FORM — EmailJS integration  ============================================================ */
    
    if (typeof emailjs !== 'undefined') {
      emailjs.init('euTpyjuLme3iL5Xa6');
    }
  
    $('#contactForm').on('submit', function (e) {
      e.preventDefault();
  
      const $form   = $(this);
      const $btn    = $form.find('.btn-submit');
      const $success = $('#formSuccess');
      const $error   = $('#formError');
  
      // Basic validation
      let valid = true;
      $form.find('.form-control-custom').each(function () {
        if (!$(this).val().trim()) {
          $(this).addClass('is-invalid');
          valid = false;
        } else {
          $(this).removeClass('is-invalid');
        }
      });
  
      if (!valid) return;
  
      // Email format check
      const email = $('#contactEmail').val();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        $('#contactEmail').addClass('is-invalid');
        return;
      }
  
      // Loading state
      $btn.prop('disabled', true).html(
        '<i class="fas fa-spinner fa-spin"></i> Sending...'
      );
      $success.hide();
      $error.hide();
  
      const templateParams = {
          from_name:    $('#contactName').val(),
          from_email:   email,
          subject:      $('#contactSubject').val() || 'No subject',
          message:      $('#contactMessage').val(),
          to_name:      'Soufiane'
      };
  
      if (typeof emailjs !== 'undefined') {
        emailjs.send('service_j3anfp5', 'template_89xahcs', templateParams)
          .then(function () {
            onFormSuccess($form, $btn, $success);
          }, function () {
            onFormError($btn, $error);
          });
      }
    });
  
    function onFormSuccess($form, $btn, $success) {
      $btn.prop('disabled', false).html('<i class="fas fa-paper-plane"></i> Send Message');
      $success.css('display', 'flex').hide().fadeIn(400);
      $form[0].reset();
      setTimeout(function () { $success.fadeOut(400); }, 5000);
    }
  
    function onFormError($btn, $error) {
      $btn.prop('disabled', false).html('<i class="fas fa-paper-plane"></i> Send Message');
      $error.css('display', 'flex').hide().fadeIn(400);
      setTimeout(function () { $error.fadeOut(400); }, 5000);
    }
  
    // Remove invalid state on input
    $(document).on('input', '.form-control-custom', function () {
      $(this).removeClass('is-invalid');
    });
  
    /* ============================================================  MICRO-INTERACTIONS  ============================================================ */
  
    // Skill chips ripple hover
    $(document).on('mouseenter', '.skill-chip', function () {
      $(this).stop(true).animate({ marginTop: '-2px' }, 120);
    }).on('mouseleave', '.skill-chip', function () {
      $(this).stop(true).animate({ marginTop: '0px' }, 120);
    });
  
    // Contact detail hover
    $(document).on('mouseenter', '.contact-detail', function () {
      $(this).find('.contact-detail-icon').stop(true).animate({ marginRight: '20px' }, 150);
    }).on('mouseleave', '.contact-detail', function () {
      $(this).find('.contact-detail-icon').stop(true).animate({ marginRight: '16px' }, 150);
    });
  
    console.log('%c🚀 Portfolio loaded — Soufiane Zekaoui', 'color:#043382;font-weight:bold;font-size:14px;');
});
