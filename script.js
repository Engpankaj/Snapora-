// Basic JavaScript functionality for Snapora
const API_BASE_URL = 'https://snapora-jwxi.onrender.com/api';

// Slideshow functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slideshow-slide');
    let currentSlide = 0;

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Show the current slide
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Show the first slide
    showSlide(currentSlide);

    // Change slide every 5 seconds
    setInterval(nextSlide, 5000);
    
    // Rotating text functionality with typing and backspacing effect
    const rotatingTextElement = document.getElementById('rotating-text');
    if (rotatingTextElement) {
        // Array of texts to rotate
        const rotatingTexts = [
            "Share. Inspire.",
            "Share. Images.",
            "Share. Videos."
        ];
        
        let currentIndex = 0;
        
        // Function to simulate typing effect
        function typeText(text, callback) {
            let i = 0;
            rotatingTextElement.textContent = ""; // Clear the text
            
            // Type each character with a delay
            const typing = setInterval(function() {
                if (i < text.length) {
                    rotatingTextElement.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typing);
                    // Call the callback after typing is complete
                    if (callback) callback();
                }
            }, 100); // Adjust typing speed here (100ms per character)
        }
        
        // Function to simulate backspacing effect
        function backspaceText(callback) {
            let text = rotatingTextElement.textContent;
            let i = text.length;
            
            // Remove each character with a delay
            const backspacing = setInterval(function() {
                if (i > 0) {
                    text = text.substring(0, i - 1);
                    rotatingTextElement.textContent = text;
                    i--;
                } else {
                    clearInterval(backspacing);
                    // Call the callback after backspacing is complete
                    if (callback) callback();
                }
            }, 50); // Adjust backspacing speed here (50ms per character)
        }
        
        // Function to rotate through texts
        function rotateText() {
            // Get the current text
            const currentText = rotatingTexts[currentIndex];
            
            // Type the current text
            typeText(currentText, function() {
                // After typing is complete, wait for 5 seconds
                setTimeout(function() {
                    // Backspace the current text
                    backspaceText(function() {
                        // After backspacing is complete, move to the next text
                        currentIndex = (currentIndex + 1) % rotatingTexts.length;
                        // Start the rotation again
                        rotateText();
                    });
                }, 1000); // Wait 1 seconds before backspacing
            });
        }
        
        // Initial rotation
        rotateText();
    }
});

// ===== Mobile hamburger menu =====
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    // Only run if elements exist (some pages may not have the hamburger markup)
    if (hamburger && mobileMenu) {
        const setOpen = (isOpen) => {
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
            hamburger.setAttribute('aria-expanded', String(isOpen));
        };

        // Toggle when clicking hamburger button
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileMenu.getAttribute('aria-hidden') === 'false';
            setOpen(!isOpen);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.getAttribute('aria-hidden') === 'false') {
                if (!mobileMenu.contains(e.target) && e.target !== hamburger) {
                    setOpen(false);
                }
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        });

        // Close menu when user clicks any link inside the mobile menu
        mobileMenu.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => setOpen(false));
        });
    }

    // Initialize share counts from localStorage

    // Add a small delay to ensure HTML elements are fully loaded
    setTimeout(initializeShareCounts, 100);
    
    // Simple animation for feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    featureCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Form validation and submission for signup/login
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            console.log('Form submission started');
            e.preventDefault(); // Always prevent default form submission
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox.checked) {
                alert('Please agree to the Terms of Service and Privacy Policy to create an account.');
                return;
            }
            
            handleSignup(e);
        });
    }
    
     
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            handleLogin(e);
        });
    }
    
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            handleImageUpload(e);
        });
    }
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Form validation and submission for edit profile
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile(e);
        });
    }
    
    // Load profile data when the page loads
    loadProfileData();
    
    // Load explore images if we're on the explore page
    if (window.location.pathname.includes('explore.html')) {
        // Add event listeners for category and sort filters
        const categorySelect = document.getElementById('category');
        const sortSelect = document.getElementById('sort');
        const loadMoreButton = document.querySelector('.load-more button');
        
        if (categorySelect) {
            categorySelect.addEventListener('change', function() {
                currentCategory = this.value;
                currentPage = 1;
                loadExploreImages(currentCategory, currentSort, currentPage);
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                currentPage = 1;
                loadExploreImages(currentCategory, currentSort, currentPage);
            });
        }
        
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    loadExploreImages(currentCategory, currentSort, currentPage, true);
                }
            });
        }
        
        // Load initial images
        loadExploreImages(currentCategory, currentSort, currentPage);
    }
    
    // Check if we're on the profile page
    if (window.location.pathname.includes('profile.html')) {
        // Check if user is logged in and handle profile viewing
        const userToken = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // If no user data found, redirect to signup
        if (!userToken || !userData) {
            window.location.href = 'signup.html';
            return;
        }
        
        // Parse user data (may be null for non-logged users)
        const currentUser = userData ? JSON.parse(userData) : null;
        
        // Check if we're viewing another user's profile
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        
        if (!currentUser && userId) {
           // Non-logged user viewing another user's profile => allow view-only
           window.currentUsername = '';
           loadUserProfile(userId);
           window.currentUserId = userId;
           const profileTabs = document.getElementById('profile-tabs');
           if (profileTabs) {
               const tabs = profileTabs.querySelectorAll('.tab');
               if (tabs.length >= 4) {
                   tabs[2].style.display = 'none';
                   tabs[3].style.display = 'none';
               }
               const videosTabButton = document.getElementById('videos-tab-button');
               if (videosTabButton) {
                   videosTabButton.style.display = 'inline-block';
               }
               showTab('posts', tabs[0]);
           }
           return;
        }
        
        if (userId && currentUser && userId !== currentUser.id.toString()) {
           // Viewing another user's profile
           loadUserProfile(userId);

           // Store current viewed user ID
           window.currentUserId = userId;
           
           // Show separate posts and videos tabs for other users
           const profileTabs = document.getElementById('profile-tabs');
           if (profileTabs) {
               // Hide Liked and Collections tabs for other users
               const tabs = profileTabs.querySelectorAll('.tab');
               if (tabs.length >= 4) {
                   // Hide Liked tab (index 2)
                   tabs[2].style.display = 'none';
                   // Hide Collections tab (index 3)
                   tabs[3].style.display = 'none';
               }
               
               // Show the videos tab button
               const videosTabButton = document.getElementById('videos-tab-button');
               if (videosTabButton) {
                   videosTabButton.style.display = 'inline-block';
               }
               
               // Load the posts tab by default
               showTab('posts', tabs[0]);
           }
       } else {
            // Viewing own profile
            loadProfileData();
            document.getElementById('follow-button').style.display = 'none';
            document.getElementById('edit-profile-button').style.display = 'inline-block';
            
            // Load the posts tab by default
            showTab('posts', document.querySelector('.profile-tabs .tab'));
        }
    }
});

// Function to handle user signup
function handleSignup(e) {
    console.log('handleSignup function called');
    e.preventDefault();
    
    const form = e.target;
    const userData = {
        name: form['fullname'].value,
        username: form.username.value,
        email: form.email.value,
        password: form.password.value
    };
    
    console.log('User data:', userData);
    
    // Confirm password
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm-password');
    
    if (userData.password !== form['confirm-password'].value) {
        // Add error styling to both password fields
        passwordField.classList.add('input-error');
        confirmPasswordField.classList.add('input-error');
        alert('Passwords do not match!');
        return;
    } else {
        // Remove error styling if passwords match
        passwordField.classList.remove('input-error');
        confirmPasswordField.classList.remove('input-error');
    }
    
    // Simple validation
    if (!userData.name || !userData.username || !userData.email || !userData.password) {
        alert('Please fill in all fields!');
        return;
    }
    
    console.log('Sending signup request to backend');
    // Send signup request to backend
    fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        console.log('Received response from backend:', response);
        if (!response.ok) {
            // If response is not ok, throw an error
            return response.json().then(data => {
                throw data;
            }).catch(() => {
                throw { error: `HTTP error! status: ${response.status}` };
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Registration successful, data:', data);
        // Show success alert
        alert('Account created successfully! Welcome to Snapora.');
        
        // Save token to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to home page after a small delay to ensure alert is closed
        console.log('Redirecting to index.html');
        console.log('Current page:', window.location.href);
        
        // Add a small delay to ensure the alert is closed before redirecting
        setTimeout(() => {
            try {
                window.location.href = 'index.html';
                console.log('Redirect initiated with window.location.href');
            } catch (redirectError) {
                console.error('Error during redirect with window.location.href:', redirectError);
                // Fallback to assign method
                try {
                    window.location.assign('index.html');
                    console.log('Redirect initiated with window.location.assign');
                } catch (assignError) {
                    console.error('Error during redirect with window.location.assign:', assignError);
                    // Last resort fallback
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 100);
                }
            }
        }, 100); // 100ms delay
    })
    .catch(error => {
        console.error('Error:', error);
        // Display specific error message if available, otherwise generic message
        const errorMessage = (error && error.error) || 'An error occurred during signup. Please try again.';
        alert(`Error: ${errorMessage}`);
    })
    .finally(() => {
        console.log('Signup process completed');
    });
}

// Function to handle user login
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Simple validation
    if (!credentials.email || !credentials.password) {
        alert('Please fill in all fields!');
        return;
    }
    
    // Send login request to backend
    fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
    .then(response => {
        // Try to parse JSON regardless of status
        return response.json().then(data => {
            if (!response.ok) {
                // If response is not ok, throw the error data
                throw data;
            }
            return data;
        }).catch(parseError => {
            // If JSON parsing fails, throw a generic error
            if (!response.ok) {
                throw { error: `HTTP error! status: ${response.status}` };
            }
            throw parseError;
        });
    })
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            // Save token to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert('Login successful!');
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Display specific error message if available, otherwise generic message
        const errorMessage = error.error || 'An error occurred during login. Please try again.';
        alert(errorMessage);
    });
}

// Function to handle image upload
function handleImageUpload(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to upload media.');
        window.location.href = 'login.html';
        return;
    }
    
    const fileInput = document.getElementById('fileInput');
    
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert('Please select a file to upload.');
        return;
    }
    
    // Check if it's a video file
    const file = fileInput.files[0];
    const isVideo = file.type.startsWith('video/');
    
    // Validate video duration if it's a video file (basic check)
    if (isVideo) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        
        video.addEventListener('loadedmetadata', function() {
            // Check if video is longer than 1 minute (60 seconds)
            if (this.duration > 60) {
                alert('Video must be 1 minute or less in duration.');
                // Re-enable the submit button
                const submitButton = document.querySelector('#uploadForm button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                return;
            }
            
            // Continue with upload if video is valid
            continueUpload(file, token, isVideo);
        });
        
        video.addEventListener('error', function() {
            alert('Error loading video file.');
            // Re-enable the submit button
            const submitButton = document.querySelector('#uploadForm button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
            }
        });
        
        // Disable the submit button while validating
        const submitButton = document.querySelector('#uploadForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }
    } else {
        // For images, continue directly
        continueUpload(file, token, isVideo);
    }
}

// Function to continue upload after validation
function continueUpload(file, token, isVideo) {
    console.log('Continuing upload with file:', file);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('tags', document.getElementById('tags').value);
    formData.append('category', document.getElementById('category').value);
    
    console.log('Form data prepared:', {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        tags: document.getElementById('tags').value,
        category: document.getElementById('category').value
    });
    
    // Send upload request to backend
    fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        console.log('Upload response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Upload data response:', data);
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert(isVideo ? 'Video uploaded successfully!' : 'Image uploaded successfully!');
            // Refresh profile data to update post count
            loadProfileData();
            window.location.href = 'profile.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during upload. Please try again.');
    });
}

// Function to check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        // User is logged in
        const userData = JSON.parse(user);
        const authButtons = document.querySelector('.auth-buttons');
        
        if (authButtons) {
            authButtons.innerHTML = `
                <span>Welcome, ${userData.username}</span>
                <a href="profile.html" class="btn btn-outline">Profile</a>
                <button class="btn btn-primary" onclick="logout()">Logout</button>
            `;
        }
        
        // Hide the "Join Now" and "Create Free Account" buttons
        const joinNowButton = document.getElementById('join-now-button');
        const createAccountButton = document.getElementById('create-account-button');
        
        if (joinNowButton) {
            joinNowButton.style.display = 'none';
        }
        
        if (createAccountButton) {
            createAccountButton.style.display = 'none';
        }
        
        // Hide the footer login and signup links
        const footerLoginLink = document.getElementById('footer-login-link');
        const footerSignupLink = document.getElementById('footer-signup-link');
        
        if (footerLoginLink) {
            footerLoginLink.style.display = 'none';
        }
        
        if (footerSignupLink) {
            footerSignupLink.style.display = 'none';
        }
    }
}

// Function to logout user
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Function to update profile
function updateProfile(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to update your profile.');
        return;
    }
    
    const formData = new FormData();
    const name = document.getElementById('profile-name-input').value;
    const bio = document.getElementById('profile-bio-input').value;
    const gender = document.getElementById('profile-gender-input').value;
    const dateOfBirth = document.getElementById('profile-dob-input').value;
    const tags = document.getElementById('profile-tags-input').value;
    const avatarInput = document.getElementById('avatar-input');
    
    if (name) {
        formData.append('name', name);
    }
    
    if (bio) {
        formData.append('bio', bio);
    }
    
    if (gender) {
        formData.append('gender', gender);
    }
    
    if (dateOfBirth) {
        formData.append('date_of_birth', dateOfBirth);
    }
    
    if (tags) {
        formData.append('tags', tags);
    }
    
    if (avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
    }
    
    // Send update request to backend
    fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        // Try to parse JSON regardless of status
        return response.json().then(data => {
            if (!response.ok) {
                // If response is not ok, throw the error data
                throw data;
            }
            return data;
        }).catch(parseError => {
            // If JSON parsing fails, throw a generic error
            if (!response.ok) {
                throw { error: `HTTP error! status: ${response.status}` };
            }
            throw parseError;
        });
    })
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Profile updated successfully!');
            // Close the modal
            closeModal('edit-profile-modal');
            // Refresh profile data
            loadProfileData();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Display specific error message if available, otherwise generic message
        const errorMessage = error.error || 'An error occurred while updating your profile. Please try again.';
        alert(errorMessage);
    });
}

// Function to show edit profile modal
function showEditProfile() {
    // Load current profile data into the form
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('profile-name-input').value = user.name || '';
        document.getElementById('profile-bio-input').value = user.bio || '';
        document.getElementById('profile-gender-input').value = user.gender || '';
        document.getElementById('profile-dob-input').value = user.date_of_birth || '';
        document.getElementById('profile-tags-input').value = user.tags || '';
    }
    
    // Show the modal
    document.getElementById('edit-profile-modal').style.display = 'block';
}

// Function to show settings modal
function showSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

// Function to show followers modal
function showFollowers() {
    document.getElementById('followers-modal').style.display = 'block';
    loadFollowers();
}

// Function to show following modal
function showFollowing() {
    document.getElementById('following-modal').style.display = 'block';
    loadFollowing();
}

// Function to load followers list
function loadFollowers() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('followers-list').innerHTML = '<p>Please log in to view followers.</p>';
        return;
    }
    
    // Get user ID from localStorage or URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || (JSON.parse(localStorage.getItem('user')) || {}).id;
    
    if (!userId) {
        document.getElementById('followers-list').innerHTML = '<p>Unable to load followers.</p>';
        return;
    }
    
    // Fetch followers from server
    fetch(`${API_BASE_URL}/user/${userId}/followers`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.followers && data.followers.length > 0) {
            // Create HTML for followers list
            let followersHTML = '<div class="user-grid">';
            data.followers.forEach(follower => {
                followersHTML += `
                    <div class="user-card">
                        <img src="${follower.avatar ? `backend/uploads/${follower.avatar}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'}" alt="${follower.name}" class="user-avatar">
                        <div class="user-info">
                            <h3>${follower.name}</h3>
                            <p>@${follower.username}</p>
                        </div>
                        <button class="btn btn-outline" onclick="viewUserProfile(${follower.id})">View Profile</button>
                    </div>
                `;
            });
            followersHTML += '</div>';
            document.getElementById('followers-list').innerHTML = followersHTML;
        } else {
            document.getElementById('followers-list').innerHTML = '<p>No followers found.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading followers:', error);
        document.getElementById('followers-list').innerHTML = '<p>Error loading followers. Please try again later.</p>';
    });
}

// Function to load following list
function loadFollowing() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('following-list').innerHTML = '<p>Please log in to view following.</p>';
        return;
    }
    
    // Get user ID from localStorage or URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || (JSON.parse(localStorage.getItem('user')) || {}).id;
    
    if (!userId) {
        document.getElementById('following-list').innerHTML = '<p>Unable to load following.</p>';
        return;
    }
    
    // Fetch following from server
    fetch(`${API_BASE_URL}/user/${userId}/following`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.following && data.following.length > 0) {
            // Create HTML for following list
            let followingHTML = '<div class="user-grid">';
            data.following.forEach(user => {
                followingHTML += `
                    <div class="user-card">
                        <img src="${user.avatar ? `backend/uploads/${user.avatar}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'}" alt="${user.name}" class="user-avatar">
                        <div class="user-info">
                            <h3>${user.name}</h3>
                            <p>@${user.username}</p>
                        </div>
                        <button class="btn btn-outline" onclick="viewUserProfile(${user.id})">View Profile</button>
                    </div>
                `;
            });
            followingHTML += '</div>';
            document.getElementById('following-list').innerHTML = followingHTML;
        } else {
            document.getElementById('following-list').innerHTML = '<p>Not following anyone yet.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading following:', error);
        document.getElementById('following-list').innerHTML = '<p>Error loading following. Please try again later.</p>';
    });
}

// Function to close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Function to show tab content
function showTab(tabName, element) {
    // Hide all tab content
    document.getElementById('posts-tab').style.display = 'none';
    document.getElementById('liked-tab').style.display = 'none';
    document.getElementById('collections-tab').style.display = 'none';
    const videosTab = document.getElementById('videos-tab');
    if (videosTab) {
        videosTab.style.display = 'none';
    }
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    
    // Add active class to the clicked tab
    if (element) {
        element.classList.add('active');
    }
    
    // Load content for the selected tab
    loadTabContent(tabName);
}

// Function to load content for a specific tab
function loadTabContent(tabName) {
    // Viewing content should be allowed without login.
    // Actions like like/collect/download may still require login.
    const token = localStorage.getItem('token');

    
    // Clear the grid content before loading new content
    switch(tabName) {
        case 'posts':
            document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">Loading posts...</p>';
            // Check if we're viewing another user's profile
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('user');
            if (userId) {
                // Load images only (not videos) for another user
                loadUserImagesOnly(userId, window.currentUsername || '');
            } else {
                // Load posts for current user (images and videos)
                const user = JSON.parse(localStorage.getItem('user'));
                loadUserPosts(user.id, user.username);
            }
            break;
        case 'liked':
            document.getElementById('liked-grid').innerHTML = '<p class="no-images-message">Loading liked images...</p>';
            // Check if we're viewing another user's profile
            const likedUrlParams = new URLSearchParams(window.location.search);
            const likedUserId = likedUrlParams.get('user');
            if (likedUserId) {
                // Hide this tab for other users
                document.getElementById('liked-tab').style.display = 'none';
            } else {
                // Load liked images for current user
                const currentUser = JSON.parse(localStorage.getItem('user'));
                loadLikedImages(currentUser.id);
            }
            break;
        case 'collections':
            document.getElementById('collections-grid').innerHTML = '<p class="no-images-message">Loading collections...</p>';
            // Check if we're viewing another user's profile
            const collectionUrlParams = new URLSearchParams(window.location.search);
            const collectionUserId = collectionUrlParams.get('user');
            if (collectionUserId) {
                // Hide this tab for other users
                document.getElementById('collections-tab').style.display = 'none';
            } else {
                // Load collected images for current user
                const currentUser = JSON.parse(localStorage.getItem('user'));
                loadCollectedImages(currentUser.id);
            }
            break;
        case 'videos':
            document.getElementById('videos-grid').innerHTML = '<p class="no-images-message">Loading videos...</p>';
            // Check if we're viewing another user's profile
            const videoUrlParams = new URLSearchParams(window.location.search);
            const videoUserId = videoUrlParams.get('user');
            if (videoUserId) {
                // Load videos for another user
                loadUserVideos(videoUserId);
            } else {
                // Load videos for current user
                const currentUser = JSON.parse(localStorage.getItem('user'));
                loadUserVideos(currentUser.id);
            }
            break;
    }
}

// Function to load user posts
function loadUserPosts(userId, username) {
    const token = localStorage.getItem('token');
    
    // Fetch user's posts from server (including videos). View-only works without login.

    fetch(`${API_BASE_URL}/user/${userId}/images?limit=all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.images && data.images.length > 0) {
            // Filter out videos, only show images in posts tab
            const imagesOnly = data.images.filter(image => !image.is_video);
            
            if (imagesOnly.length > 0) {
                // Create HTML for posts using the same structure as explore page
                let postsHTML = '';
                imagesOnly.forEach(image => {
                    // For images only, show image preview
                    const mediaElement = `<img src="backend/${image.path}" alt="${image.title}">`;
                    
                    postsHTML += `
                        <div class="image-card" data-image-id="${image.id}">
                            <div class="image-container">
                                ${mediaElement}
                            </div>
                            <div class="image-info">
                                <h3>${image.title}</h3>
                                <p>by <a href="#" onclick="viewUserProfile(${userId}); return false;">@${username}</a></p>
                                <p>${image.description || 'No description'}</p>
                                <div class="image-stats">
                                    <span onclick="likeImage(${image.id}, this, event)"><i class="fas fa-heart"></i> ${image.likes || 0}</span>
                                    <span onclick="downloadImage('backend/${image.path}', ${image.id}, this, event)"><i class="fas fa-download"></i> ${image.downloads || 0}</span>
                                    <span onclick="shareImage(${image.id}, event)"><i class="fas fa-share-alt"></i> ${image.shares || 0}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                document.getElementById('posts-grid').innerHTML = postsHTML;
                
                // Update share counts from localStorage
                updateShareCountsFromLocalStorage();
            } else {
                document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">This user hasn\'t uploaded any images yet.</p>';
            }
        } else {
            document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">This user hasn\'t uploaded any posts yet.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading user posts:', error);
        document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">Error loading posts. Please try again later.</p>';
    });
}

// Function to load user images only (not videos) when viewing another user's profile
function loadUserImagesOnly(userId, username) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">Please log in to view posts.</p>';
        return;
    }
    
    // Fetch user's posts from server (including videos)
    fetch(`${API_BASE_URL}/user/${userId}/images?limit=all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.images && data.images.length > 0) {
            // Filter images only (not videos)
            const imagesOnly = data.images.filter(image => !image.is_video);
            
            if (imagesOnly.length > 0) {
                // Create HTML for posts using the same structure as explore page
                let postsHTML = '';
                imagesOnly.forEach(image => {
                    // For images only, show image preview
                    const mediaElement = `<img src="backend/${image.path}" alt="${image.title}">`;
                    
                    postsHTML += `
                        <div class="image-card" data-image-id="${image.id}">
                            <div class="image-container">
                                ${mediaElement}
                            </div>
                            <div class="image-info">
                                <h3>${image.title}</h3>
                                <p>by <a href="#" onclick="viewUserProfile(${userId}); return false;">@${username}</a></p>
                                <p>${image.description || 'No description'}</p>
                                <div class="image-stats">
                                    <span onclick="likeImage(${image.id}, this, event)"><i class="fas fa-heart"></i> ${image.likes || 0}</span>
                                    <span onclick="downloadImage('backend/${image.path}', ${image.id}, this, event)"><i class="fas fa-download"></i> ${image.downloads || 0}</span>
                                    <span onclick="shareImage(${image.id}, event)"><i class="fas fa-share-alt"></i> ${image.shares || 0}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                document.getElementById('posts-grid').innerHTML = postsHTML;
                
                // Update share counts from localStorage
                updateShareCountsFromLocalStorage();
            } else {
                document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">This user hasn\'t uploaded any images yet.</p>';
            }
        } else {
            document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">This user hasn\'t uploaded any posts yet.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading user posts:', error);
        document.getElementById('posts-grid').innerHTML = '<p class="no-images-message">Error loading posts. Please try again later.</p>';
    });
}

// Function to load liked images
function loadLikedImages(userId = null) {
    const token = localStorage.getItem('token');
    const user = userId ? { id: userId } : JSON.parse(localStorage.getItem('user'));
    
    console.log('Loading liked images for user:', user);
    
    if (!token || !user) {
        document.getElementById('liked-grid').innerHTML = '<p class="no-images-message">Please log in to view your liked images.</p>';
        return;
    }
    
    // Fetch user's liked images from server
    fetch(`${API_BASE_URL}/user/${user.id}/liked-images?limit=all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('Response from liked images API:', response);
        return response.json();
    })
    .then(data => {
        console.log('Data from liked images API:', data);
        if (data.images && data.images.length > 0) {
            // Create HTML for liked images using the same structure as explore page
            let imagesHTML = '';
            data.images.forEach(image => {
                // Check if it's a video
                const mediaElement = image.is_video ?
                    `<video controls>
                        <source src="backend/${image.path}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>` :
                    `<img src="backend/${image.path}" alt="${image.title}">`;
                    
                imagesHTML += `
                    <div class="image-card" data-image-id="${image.id}">
                        <div class="image-container">
                            ${mediaElement}
                        </div>
                        <div class="image-info">
                            <h3>${image.title}</h3>
                            <p>by <a href="#" onclick="viewUserProfile(${image.user_id}); return false;">@${image.username}</a></p>
                            <p>${image.description || 'No description'}</p>
                            <div class="image-stats">
                                <span onclick="likeImage(${image.id}, this, event)"><i class="fas fa-heart"></i> ${image.likes || 0}</span>
                                <span onclick="downloadImage('backend/${image.path}', ${image.id}, this, event)"><i class="fas fa-download"></i> ${image.downloads || 0}</span>
                                <span onclick="shareImage(${image.id}, event)"><i class="fas fa-share-alt"></i> ${image.shares || 0}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            document.getElementById('liked-grid').innerHTML = imagesHTML;
            
            // Update share counts from localStorage
            updateShareCountsFromLocalStorage();
        } else {
            document.getElementById('liked-grid').innerHTML = '<p class="no-images-message">This user hasn\'t liked any images yet.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading liked images:', error);
        document.getElementById('liked-grid').innerHTML = '<p class="no-images-message">Error loading liked images. Please try again later.</p>';
    });
}

// Function to load collected images
function loadCollectedImages(userId = null) {
    const token = localStorage.getItem('token');
    const user = userId ? { id: userId } : JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        document.getElementById('collections-grid').innerHTML = '<p class="no-images-message">Please log in to view your collected images.</p>';
        return;
    }
    
    // Fetch user's collected images from server
    fetch(`${API_BASE_URL}/user/${user.id}/collections?limit=all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.images && data.images.length > 0) {
            // Create HTML for collected images using the same structure as explore page
            let imagesHTML = '';
            data.images.forEach(image => {
                // Check if it's a video
                const mediaElement = image.is_video ?
                    `<video controls>
                        <source src="backend/${image.path}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>` :
                    `<img src="backend/${image.path}" alt="${image.title}">`;
                    
                imagesHTML += `
                    <div class="image-card" data-image-id="${image.id}">
                        <div class="image-container">
                            ${mediaElement}
                        </div>
                        <div class="image-info">
                            <h3>${image.title}</h3>
                            <p>by <a href="#" onclick="viewUserProfile(${image.user_id}); return false;">@${image.username}</a></p>
                            <p>${image.description || 'No description'}</p>
                            <div class="image-stats">
                                <span onclick="likeImage(${image.id}, this, event)"><i class="fas fa-heart"></i> ${image.likes || 0}</span>
                                <span onclick="downloadImage('backend/${image.path}', ${image.id}, this, event)"><i class="fas fa-download"></i> ${image.downloads || 0}</span>
                                <span onclick="shareImage(${image.id}, event)"><i class="fas fa-share-alt"></i> ${image.shares || 0}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            document.getElementById('collections-grid').innerHTML = imagesHTML;
            
            // Update share counts from localStorage
            updateShareCountsFromLocalStorage();
        } else {
            document.getElementById('collections-grid').innerHTML = '<p class="no-images-message">This user hasn\'t collected any images yet.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading collected images:', error);
        document.getElementById('collections-grid').innerHTML = '<p class="no-images-message">Error loading collected images. Please try again later.</p>';
    });
}

// Function to load profile data
function loadProfileData() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return;
    }
    
    // Fetch fresh profile data from server
    fetch(`${API_BASE_URL}/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            // Update the profile header with fresh data
            document.getElementById('profile-name').textContent = data.user.name || 'Anonymous';
            document.getElementById('profile-username').textContent = `@${data.user.username}`;
            document.getElementById('profile-bio').textContent = data.user.bio || 'No bio available';
            
            // Update stats
            document.getElementById('profile-posts').textContent = data.user.posts || '0';
            document.getElementById('profile-followers').textContent = data.user.followers || '0';
            document.getElementById('profile-following').textContent = data.user.following || '0';
            
            // Update avatar if available
            if (data.user.avatar) {
                document.getElementById('profile-avatar').src = `backend/uploads/${data.user.avatar}`;
            }
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(data.user));
        }
    })
    .catch(error => {
        console.error('Error loading profile data:', error);
        // Fallback to localStorage data if server fetch fails
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('profile-name').textContent = user.name || 'Anonymous';
            document.getElementById('profile-username').textContent = `@${user.username}`;
            document.getElementById('profile-bio').textContent = user.bio || 'No bio available';
            document.getElementById('profile-posts').textContent = user.posts || '0';
            document.getElementById('profile-followers').textContent = user.followers || '0';
            document.getElementById('profile-following').textContent = user.following || '0';
        }
    });
}

// Function to delete account
function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to delete your account.');
        return;
    }
    
    fetch(`${API_BASE_URL}/profile`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Account deleted successfully!');
            // Logout and redirect to home page
            logout();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while deleting your account. Please try again.');
    });
}

// Function to load another user's profile
function loadUserProfile(userId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Please log in to view profiles.');
        return;
    }
    
    // Fetch user data from server
    fetch(`${API_BASE_URL}/user/${userId}/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            // Update the profile header with user data
            document.getElementById('profile-name').textContent = data.user.name || 'Anonymous';
            document.getElementById('profile-username').textContent = `@${data.user.username}`;
            document.getElementById('profile-bio').textContent = data.user.bio || 'No bio available';
            
            // Update stats
            document.getElementById('profile-posts').textContent = data.user.posts || '0';
            document.getElementById('profile-followers').textContent = data.user.followers || '0';
            document.getElementById('profile-following').textContent = data.user.following || '0';
            
            // Update avatar if available
            if (data.user.avatar) {
                document.getElementById('profile-avatar').src = `backend/uploads/${data.user.avatar}`;
            } else {
                document.getElementById('profile-avatar').src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80';
            }
            
            // Show follow button and hide edit profile button
            document.getElementById('follow-button').style.display = 'inline-block';
            document.getElementById('edit-profile-button').style.display = 'none';
            
            // Hide settings button when viewing another user's profile
            const settingsButton = document.querySelector('.profile-actions .btn-outline');
            if (settingsButton) {
                settingsButton.style.display = 'none';
            }
            
            // Check follow status
            checkFollowStatus(userId);
            
            // Store username for later use
            window.currentUsername = data.user.username;
            
            // For other users, show both posts and videos tabs
            // Show the videos tab button
            const videosTabButton = document.getElementById('videos-tab-button');
            if (videosTabButton) {
                videosTabButton.style.display = 'inline-block';
                // Show the posts tab content by default
                showTab('posts', document.querySelector('.profile-tabs .tab'));
            }
        }
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
        // Don't show alert, just handle the error silently
        // alert('Error loading user profile.');
    });
}

// Function to check follow status
function checkFollowStatus(userId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return;
    }
    
    fetch(`${API_BASE_URL}/users/${userId}/follow-status`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const followButton = document.getElementById('follow-button');
        if (data.is_following) {
            followButton.textContent = 'Following';
            followButton.classList.add('following');
        } else {
            followButton.textContent = 'Follow';
            followButton.classList.remove('following');
        }
    })
    .catch(error => {
        console.error('Error checking follow status:', error);
    });
}

// Function to toggle follow status
function toggleFollow() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    
    // Validate user ID
    if (!userId || isNaN(userId)) {
        console.error('Invalid user ID for follow action');
        return;
    }
    
    const token = localStorage.getItem('token');
    const followButton = document.getElementById('follow-button');
    
    if (!token) {
        alert('Please log in to follow users.');
        return;
    }
    
    // Send follow request to backend
    fetch(`${API_BASE_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            // Handle error from server
            console.error('Server error:', data.error);
            alert(`Error: ${data.error}`);
        } else if (data.message) {
            // Update UI based on action
            if (data.message.includes('followed')) {
                followButton.textContent = 'Following';
                followButton.classList.add('following');
                
                // Update follower count
                const followersElement = document.getElementById('profile-followers');
                const currentFollowers = parseInt(followersElement.textContent) || 0;
                followersElement.textContent = currentFollowers + 1;
                
                // Update current user's following count
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser) {
                    currentUser.following = (parseInt(currentUser.following) || 0) + 1;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
            } else if (data.message.includes('unfollowed')) {
                followButton.textContent = 'Follow';
                followButton.classList.remove('following');
                
                // Update follower count
                const followersElement = document.getElementById('profile-followers');
                const currentFollowers = parseInt(followersElement.textContent) || 0;
                followersElement.textContent = currentFollowers - 1;
                
                // Update current user's following count
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser) {
                    currentUser.following = (parseInt(currentUser.following) || 0) - 1;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
            }
        } else {
            // Handle unexpected response
            console.error('Unexpected response from server:', data);
            alert('An unexpected error occurred. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error toggling follow status:', error);
        // Show more specific error message based on error type
        if (error instanceof TypeError) {
            alert('Network error. Please check your connection and try again.');
        } else {
            alert('An error occurred while updating follow status. Please try again.');
        }
    });
}

// Current pagination state
let currentPage = 1;
let currentCategory = 'all';
let currentSort = 'recent';
let totalPages = 1;

// Function to load images for the explore page
function loadExploreImages(category = 'all', sort = 'recent', page = 1, append = false) {
    // Build query string with filters
    const queryParams = new URLSearchParams({
        category: category,
        sort: sort,
        page: page,
        limit: 12
    });
    
    fetch(`${API_BASE_URL}/images?${queryParams}`)
    .then(response => response.json())
    .then(data => {
        const loadMoreButton = document.querySelector('.load-more');
        
        if (data.images && data.images.length > 0) {
            // Create HTML for images
            let imagesHTML = '';
            data.images.forEach(image => {
                // Check if it's a video
                const mediaElement = image.is_video ?
                    `<video controls>
                        <source src="backend/${image.path}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>` :
                    `<img src="backend/${image.path}" alt="${image.title}">`;
                    
                imagesHTML += `
                    <div class="image-card" data-image-id="${image.id}">
                        <div class="image-container">
                            ${mediaElement}
                        </div>
                        <div class="image-info">
                            <h3>${image.title}</h3>
                            <p>by <a href="#" onclick="viewUserProfile(${image.user_id}); return false;">@${image.username}</a></p>
                            <p>${image.description || 'No description'}</p>
                            <div class="image-stats">
                                <span onclick="likeImage(${image.id}, this, event)"><i class="fas fa-heart"></i> ${image.likes || 0}</span>
                                <span onclick="downloadImage('backend/${image.path}', ${image.id}, this, event)"><i class="fas fa-download"></i> ${image.downloads || 0}</span>
                                <span onclick="shareImage(${image.id}, event)"><i class="fas fa-share-alt"></i> ${image.shares || 0}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            if (append) {
                // Append images to existing ones
                document.querySelector('.image-grid').innerHTML += imagesHTML;
            } else {
                // Replace all images
                document.querySelector('.image-grid').innerHTML = imagesHTML;
            }
            
            // Update share counts from localStorage
            updateShareCountsFromLocalStorage();
            
            // Update pagination state
            if (data.pagination) {
                totalPages = data.pagination.pages;
                
                // Show or hide load more button based on pagination
                if (data.pagination.page < data.pagination.pages) {
                    if (loadMoreButton) {
                        loadMoreButton.style.display = 'block';
                    }
                } else {
                    if (loadMoreButton) {
                        loadMoreButton.style.display = 'none';
                    }
                }
            }
        } else {
            // Show specific message for category with no images
            if (category !== 'all') {
                document.querySelector('.image-grid').innerHTML = '<p class="no-images-message">this category pictures not availbe please try after some time</p>';
            } else {
                document.querySelector('.image-grid').innerHTML = '<p class="no-images-message">No images found.</p>';
            }
            
            // Hide load more button when no images
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
            }
        }
    })
    .catch(error => {
        console.error('Error loading explore images:', error);
        document.querySelector('.image-grid').innerHTML = '<p class="no-images-message">Error loading images. Please try again later.</p>';
    });
}


// Function to view user profile
function viewUserProfile(userId) {
    // Redirect to profile page with user ID as query parameter
    window.location.href = `profile.html?user=${userId}`;
}

// Function to like an image
function likeImage(imageId, element, event) {
    // Prevent default behavior that might cause page reload
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Check if the image is already liked
    const isLiked = element.classList.contains('liked');
    
    // If already liked, do nothing
    if (isLiked) {
        return false;
    }
    
    // Get the current count
    const countElement = element.querySelector('i').nextSibling;
    let currentCount = parseInt(countElement.textContent) || 0;
    
    // Update the UI immediately
    // Like
    element.classList.add('liked');
    countElement.textContent = currentCount + 1;
    
    // Get user token
    const token = localStorage.getItem('token');
    
    // Make API call to like the image
    if (token) {
        fetch(`${API_BASE_URL}/images/${imageId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log('Image liked successfully');
                // Add image to liked tab
                addToLikedTab(imageId);
            } else {
                console.error('Error liking image:', data.error);
                // Revert UI changes if API call fails
                element.classList.remove('liked');
                countElement.textContent = currentCount;
            }
        })
        .catch(error => {
            console.error('Error liking image:', error);
            // Revert UI changes if API call fails
            element.classList.remove('liked');
            countElement.textContent = currentCount;
        });
    }
    
    // Prevent any default action
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    return false;
}

// Function to share the user's profile
function shareProfile() {
    // Get the current user's profile URL
    const currentUrl = window.location.href;
    const profileUrl = currentUrl;
    
    // Create share data
    const shareData = {
        title: 'Check out my profile on Snapora',
        text: 'I found this amazing user on Snapora!',
        url: profileUrl
    };
    
    // Try to use the Web Share API if available
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                console.log('Profile shared successfully');
                // alert('Profile shared successfully!');
            })
            .catch((error) => {
                console.error('Error sharing profile:', error);
                // Fallback to copying the URL to clipboard
                copyUrlToClipboard(profileUrl);
                alert('Profile URL copied to clipboard! You can now share it.');
            });
    } else {
        // Fallback to copying the URL to clipboard
        copyUrlToClipboard(profileUrl);
        alert('Profile URL copied to clipboard! You can now share it.');
    }
}

// Function to add image to liked tab
function addToLikedTab(imageId) {
    // Refresh the liked tab content
    if (document.getElementById('liked-tab') && document.getElementById('liked-tab').style.display !== 'none') {
        // Check if we're viewing another user's profile
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        if (userId) {
            // Load liked images for another user
            loadLikedImages(userId);
        } else {
            // Load liked images for current user
            const currentUser = JSON.parse(localStorage.getItem('user'));
            loadLikedImages(currentUser.id);
        }
    }
    console.log(`Image ${imageId} added to liked tab`);
}

// Function to download an image
function downloadImage(imagePath, imageId, element, event) {
    // Prevent default behavior that might cause page reload
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    try {
        console.log('DownloadImage called with:', { imagePath, imageId });
        
        // Use the new backend endpoint for downloading images
        const downloadUrl = `${API_BASE_URL}/images/${imageId}/download-file`;
        
        console.log('Attempting to download image from:', downloadUrl);
        
        // Use fetch to download the file
        fetch(downloadUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Create a temporary URL for the blob
                const blobUrl = window.URL.createObjectURL(blob);
                
                // Create a temporary link element
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = ''; // Let the server set the filename
                
                // Add link to DOM, click it, and remove it
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Revoke the blob URL to free memory
                window.URL.revokeObjectURL(blobUrl);
                
                console.log('Download completed');
                
                // Get the current count
                const countElement = element.querySelector('i').nextSibling;
                let currentCount = parseInt(countElement.textContent) || 0;
                
                // Update the UI immediately
                countElement.textContent = currentCount + 1;
                
                // Get user token
                const token = localStorage.getItem('token');
                
                // Make API call to increment download count
                fetch(`${API_BASE_URL}/images/${imageId}/download`, {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        console.log('Download count updated successfully');
                    } else {
                        console.error('Error updating download count:', data.error);
                    }
                })
                .catch(error => {
                    console.error('Error updating download count:', error);
                });
                
                // Make API call to add image to collection
                if (token) {
                    fetch(`${API_BASE_URL}/images/${imageId}/collect`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            console.log('Image added to collection successfully');
                            // Add image to collection tab
                            addToCollectionTab(imageId);
                        } else {
                            console.error('Error adding image to collection:', data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error adding image to collection:', error);
                    });
                }
            })
            .catch(error => {
                console.error('Error downloading image:', error);
                alert('Error downloading image. Please try again later.');
            });
    } catch (error) {
        console.error('Error in downloadImage function:', error);
        alert('Error downloading image. Please try again later.');
    }
    
    // Prevent any default action
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    return false;
}

// Function to add image to collection tab
function addToCollectionTab(imageId) {
    // Refresh the collection tab content
    if (document.getElementById('collections-tab') && document.getElementById('collections-tab').style.display !== 'none') {
        // Check if we're viewing another user's profile
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        if (userId) {
            // Load collected images for another user
            loadCollectedImages(userId);
        } else {
            // Load collected images for current user
            const currentUser = JSON.parse(localStorage.getItem('user'));
            loadCollectedImages(currentUser.id);
        }
    }
    console.log(`Image ${imageId} added to collection tab`);
}

// Function to share an image
function shareImage(imageId, event) {
    // Prevent default behavior that might cause page reload
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Get the media element (image or video)
    const mediaElement = document.querySelector(`[data-image-id="${imageId}"] img`) ||
                         document.querySelector(`[data-image-id="${imageId}"] video`);
    
    if (!mediaElement) {
        console.error('Media element not found');
        return false;
    }
    
    // Get the media URL
    const mediaUrl = mediaElement.src;
    
    // Create share data
    const shareData = {
        title: 'Check out this media on Snapora',
        text: 'I found this amazing media on Snapora!',
        url: mediaUrl
    };
    
    // Try to use the Web Share API if available
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                console.log('Image shared successfully');
                // Update share count in UI and backend
                updateShareCount(imageId);
            })
            .catch((error) => {
                console.error('Error sharing image:', error);
                // Fallback to copying the URL to clipboard
                copyUrlToClipboard(mediaUrl);
                // Update share count even when using fallback
                updateShareCount(imageId);
            });
    } else {
       // Fallback to copying the URL to clipboard
       copyUrlToClipboard(mediaUrl);
       // Update share count
       updateShareCount(imageId);
   }
    
    // Prevent any default action
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    return false;
}

// Function to save share count to localStorage
function saveShareCountToLocalStorage(imageId, count) {
    // Get existing share counts from localStorage
    let shareCounts = JSON.parse(localStorage.getItem('shareCounts')) || {};
    
    // Update the count for this image
    shareCounts[imageId] = count;
    
    // Save back to localStorage
    localStorage.setItem('shareCounts', JSON.stringify(shareCounts));
}

// Function to get share count from localStorage
function getShareCountFromLocalStorage(imageId) {
    // Get existing share counts from localStorage
    let shareCounts = JSON.parse(localStorage.getItem('shareCounts')) || {};
    
    // Return the count for this image, or 0 if not found
    return shareCounts[imageId] || 0;
}

// Function to update share count in UI and backend
function updateShareCount(imageId) {
    // Get the share element
    const shareElement = document.querySelector(`[data-image-id="${imageId}"] .image-stats span:nth-child(3)`);
    
    if (!shareElement) {
        console.error('Share element not found');
        return;
    }
    
    // Get the current count from localStorage or UI
    let currentCount = getShareCountFromLocalStorage(imageId);
    const countElement = shareElement.querySelector('i').nextSibling;
    
    // If not in localStorage, get from UI
    if (currentCount === 0) {
        const uiCount = parseInt(countElement.textContent) || 0;
        // If UI count is greater than 0, use it (server value)
        // Otherwise, use localStorage value (0)
        if (uiCount > 0) {
            currentCount = uiCount;
        }
    }
    
    // Update the UI immediately
    countElement.textContent = currentCount + 1;
    
    // Save to localStorage
    saveShareCountToLocalStorage(imageId, currentCount + 1);
    
    // Make API call to increment share count
    fetch(`${API_BASE_URL}/images/${imageId}/share`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log('Share count updated successfully');
        } else {
            console.error('Error updating share count:', data.error);
            // Note: We don't revert localStorage changes as they should persist
        }
    })
    .catch(error => {
        console.error('Error updating share count:', error);
        // Note: We don't revert localStorage changes as they should persist
    });
}

// Function to initialize share counts from localStorage
function initializeShareCounts() {
    // Get existing share counts from localStorage
    let shareCounts = JSON.parse(localStorage.getItem('shareCounts')) || {};
    
    // Debug log to see what's happening
    console.log('Initializing share counts from localStorage:', shareCounts);
    
    // Update all share count displays on the page
    Object.keys(shareCounts).forEach(imageId => {
        const shareElement = document.querySelector(`[data-image-id="${imageId}"] .image-stats span:nth-child(3)`);
        if (shareElement) {
            const countElement = shareElement.querySelector('i').nextSibling;
            countElement.textContent = shareCounts[imageId];
            console.log(`Updated share count for image ${imageId} to ${shareCounts[imageId]}`);
        } else {
            console.log(`Share element not found for image ${imageId}`);
        }
    });
}

// Function to update share counts after HTML is generated
function updateShareCountsFromLocalStorage() {
    // Get existing share counts from localStorage
    let shareCounts = JSON.parse(localStorage.getItem('shareCounts')) || {};
    
    // Update all share count displays on the page
    Object.keys(shareCounts).forEach(imageId => {
        const shareElement = document.querySelector(`[data-image-id="${imageId}"] .image-stats span:nth-child(3)`);
        if (shareElement) {
            const countElement = shareElement.querySelector('i').nextSibling;
            countElement.textContent = shareCounts[imageId];
        }
    });
}

// Function to copy URL to clipboard
function copyUrlToClipboard(url) {
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    
    // Select and copy the URL
    tempInput.select();
    document.execCommand('copy');
    
    // Remove the temporary input element
    document.body.removeChild(tempInput);
    
    // Show a message to the user
    alert('Image URL copied to clipboard! You can now share it.');
}
// Function to load user videos
function loadUserVideos(userId) {
    const token = localStorage.getItem('token');
    
    // Fetch user's videos from server. View-only works without login.

    fetch(`${API_BASE_URL}/user/${userId}/videos?limit=all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.videos && data.videos.length > 0) {
            // Create HTML for videos using the same structure as explore page
            let videosHTML = '';
            data.videos.forEach(video => {
                // For videos, show a video preview
                const mediaElement = `<video controls>
                    <source src="backend/${video.path}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`;
                    
                videosHTML += `
                    <div class="image-card" data-image-id="${video.id}">
                        <div class="image-container">
                            ${mediaElement}
                        </div>
                        <div class="image-info">
                            <h3>${video.title}</h3>
                            <p>${video.description || 'No description'}</p>
                            <div class="image-stats">
                                <span onclick="likeImage(${video.id}, this, event)"><i class="fas fa-heart"></i> ${video.likes || 0}</span>
                                <span onclick="downloadImage('backend/${video.path}', ${video.id}, this, event)"><i class="fas fa-download"></i> ${video.downloads || 0}</span>
                                <span onclick="shareImage(${video.id}, event)"><i class="fas fa-share-alt"></i> ${video.shares || 0}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            document.getElementById('videos-grid').innerHTML = videosHTML;
            
            // Update share counts from localStorage
            updateShareCountsFromLocalStorage();
        } else {
            document.getElementById('videos-grid').innerHTML = '<p class="no-images-message">This user hasn\'t uploaded any videos yet.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading user videos:', error);
        document.getElementById('videos-grid').innerHTML = '<p class="no-images-message">Error loading videos. Please try again later.</p>';
    });
};