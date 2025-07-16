(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);


    // Fixed Navbar
    // $(window).scroll(function () {
    //     if ($(window).width() < 992) {
    //         if ($(this).scrollTop() > 55) {
    //             $('.fixed-top').addClass('shadow');
    //         } else {
    //             $('.fixed-top').removeClass('shadow');
    //         }
    //     } else {
    //         if ($(this).scrollTop() > 55) {
    //             $('.fixed-top').addClass('shadow').css('top', -55);
    //         } else {
    //             $('.fixed-top').removeClass('shadow').css('top', 0);
    //         }
    //     } 
    // });
    
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 30, 'easeInOutExpo');
        return false;
    });


    // Testimonial carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:1
            },
            992:{
                items:2
            },
            1200:{
                items:2
            }
        }
    });


    // vegetable carousel
    $(".vegetable-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
       

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });



    // Product Quantity
    $('.quantity button').on('click', function () {
        var button = $(this);
        var oldValue = button.parent().parent().find('input').val();
        if (button.hasClass('btn-plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        button.parent().parent().find('input').val(newVal);
    });

    
      // Auth functions
    function updateUserUI() {
        const user = localStorage.getItem('user');
        console.log('[Auth] Updating UI, user exists:', !!user);
        if (user) {
            $('#logoutLink').removeClass('d-none');
            $('.dropdown-item[data-bs-target="#loginModal"]').addClass('d-none');
            $('.dropdown-item[data-bs-target="#registerModal"]').addClass('d-none');
        } else {
            $('#logoutLink').addClass('d-none');
            $('.dropdown-item[data-bs-target="#loginModal"]').removeClass('d-none');
            $('.dropdown-item[data-bs-target="#registerModal"]').removeClass('d-none');
        }
    }

    function showToast(message, isSuccess = true) {
        const toastEl = $('#auth-toast');
        if (toastEl.length) {
            toastEl.find('.toast-body').text(message);
            toastEl.removeClass('bg-success bg-danger').addClass(isSuccess ? 'bg-success' : 'bg-danger');
            const toast = new bootstrap.Toast(toastEl[0], { autohide: true, delay: 3000 });
            toast.show();
        } else {
            console.warn('[Auth] Toast element not found');
        }
    }

    $(document).ready(function () {
        console.log('[Main] main.js loaded');

        // Initialize UI
        updateUserUI();

        // Register
        $('#registerBtn').on('click', function () {
            console.log('[Auth] Register button clicked');
            const email = $('#registerEmail').val().trim();
            const password = $('#registerPassword').val();
            const confirmPassword = $('#confirmPassword').val();

            if (!email || !password || !confirmPassword) {
                console.log('[Auth] Register: Missing fields');
                showToast('Please fill all fields', false);
                return;
            }
            if (password !== confirmPassword) {
                console.log('[Auth] Register: Passwords do not match');
                showToast('Passwords do not match', false);
                return;
            }

            // Save user
            localStorage.setItem('user', JSON.stringify({ email, password }));
            console.log('[Auth] Register: User saved', { email, password });
            $('#registerModal').modal('hide');
            showToast('Registration successful');
            updateUserUI();
        });

        // Login
        $('#loginBtn').on('click', function () {
            console.log('[Auth] Login button clicked');
            const email = $('#loginEmail').val().trim();
            const password = $('#loginPassword').val();

            if (!email || !password) {
                console.log('[Auth] Login: Missing fields');
                showToast('Please fill all fields', false);
                return;
            }

            // Check user
            const user = localStorage.getItem('user');
            if (user) {
                const parsedUser = JSON.parse(user);
                console.log('[Auth] Login: Checking user', { email, storedEmail: parsedUser.email });
                if (parsedUser.email === email && parsedUser.password === password) {
                    $('#loginModal').modal('hide');
                    showToast('Login successful');
                    updateUserUI();
                } else {
                    console.log('[Auth] Login: Invalid credentials');
                    showToast('Invalid email or password', false);
                }
            } else {
                console.log('[Auth] Login: No user found');
                showToast('User not found', false);
            }
        });

        // Logout
        $('#logoutLink').on('click', function (e) {
            e.preventDefault();
            console.log('[Auth] Logout clicked');
            localStorage.removeItem('user');
            showToast('Logged out successfully');
            updateUserUI();
        });

        // Fix ARIA warning by clearing focus on modal hide
        $('#registerModal, #loginModal').on('hidden.bs.modal', function () {
            console.log('[Auth] Modal hidden, clearing focus');
            $(this).find('input, button').blur();
        });
    });

    $(document).ready(function() {
    $('.category-link').on('click', function(e) {
        e.preventDefault();
        var selectedCategory = $(this).data('category');
        if (!selectedCategory) {
            // Show all products
            $('.fruite-item').closest('.col-md-6, .col-lg-6, .col-xl-4').show();
        } else {
            $('.fruite-item').each(function() {
                var productCategory = $(this).find('.category').text().trim().toLowerCase();
                if (productCategory === selectedCategory.toLowerCase()) {
                    $(this).closest('.col-md-6, .col-lg-6, .col-xl-4').show();
                } else {
                    $(this).closest('.col-md-6, .col-lg-6, .col-xl-4').hide();
                }
            });
        }
    });
});
})(jQuery);


