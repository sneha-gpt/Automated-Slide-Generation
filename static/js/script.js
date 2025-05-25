document.addEventListener("DOMContentLoaded", () => {
  // Check if GSAP is loaded
  if (typeof gsap === "undefined") {
      console.error("GSAP is not loaded. Please ensure the GSAP script is included.");
      return;
  }

    // Check if Firebase is loaded
  if (typeof firebase === "undefined") {
    console.error("Firebase is not loaded. Please ensure the Firebase scripts are included.");
    return;
  }

  // Firebase configuration
  const firebaseConfig = {
  
          'apiKey': os.getenv('FIREBASE_API_KEY'),
          'authDomain': os.getenv('FIREBASE_AUTH_DOMAIN'),
          'projectId': os.getenv('FIREBASE_PROJECT_ID'),
          'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET'),
          'messagingSenderId': os.getenv('FIREBASE_MESSAGING_SENDER_ID'),
          'appId': os.getenv('FIREBASE_APP_ID'),
          'measurementId': os.getenv('FIREBASE_MEASUREMENT_ID')

  };

  // Initialize Firebase
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    alert("Failed to initialize Firebase. Please try again later.");
    return;
  }
  const auth = firebase.auth();

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust animation distances based on viewport size
  const scaleFactor = Math.min(viewportWidth / 1200, viewportHeight / 800); // Base on a 1200x800 reference
  const inwardY = 50 * scaleFactor;
  const inwardX = 150 * scaleFactor;
  const outwardY = 400 * scaleFactor;
  const outwardX = 600 * scaleFactor;

  // Select elements
  const heading = document.querySelector("#Heading");
  const working = document.querySelector("#working");
  const mainCards = document.querySelectorAll("main #cards .card");
  const working2 = document.querySelector("#working2");
  const startButton = document.querySelector("#start-button");
  const working3 = document.querySelector("#working3");
  const footerCards = document.querySelectorAll("footer #cards .card");

  // Log if elements are not found
  if (!heading) console.warn("Element #Heading not found.");
  if (!working) console.warn("Element #working not found.");
  if (mainCards.length === 0) console.warn("No elements found for main #cards .card");
  if (!working2) console.warn("Element #working2 not found.");
  if (!startButton) console.warn("Element #start-button not found.");
  if (!working3) console.warn("Element #working3 not found.");
  if (footerCards.length === 0) console.warn("No elements found for footer #cards .card");

  // Log initial positions for debugging
  if (heading) console.log("Heading initial position:", heading.getBoundingClientRect());
  if (mainCards.length > 0) console.log("First main card initial position:", mainCards[0].getBoundingClientRect());

gsap.from("#head_btn button", {
    duration: 1,
    y: -50,             // animate from 50px above
    opacity: 0,         // start from transparent
    stagger: 0.2,       // delay between each button
    ease: "bounce.out"  // bounce effect
  });

  // Inward animations on page load
  if (heading) {
      gsap.fromTo("#Heading, #Heading h1, #Heading h4", 
          { y: inwardY, opacity: 0 },
          {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 0.3,
              ease: "power3.out",
              onComplete: () => console.log("Heading animation completed")
          }
      );
  }

  if (working) {
      gsap.fromTo("#working",
          { y: inwardY, opacity: 0 },
          {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 0.8,
              ease: "power3.out",
              onComplete: () => console.log("Working section animation completed")
          }
      );
  }

  if (mainCards.length > 0) {
      gsap.fromTo("main #cards .card",
          { x: inwardX, opacity: 0 },
          {
              x: 0,
              opacity: 1,
              duration: 1,
              delay: 1.2,
              stagger: 0.2,
              ease: "power3.out",
              onComplete: () => console.log("Main cards animation completed")
          }
      );
  }

  if (working2) {
      gsap.fromTo("#working2",
          { y: inwardY, opacity: 0 },
          {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 2,
              ease: "power3.out",
              onComplete: () => console.log("Working2 section animation completed")
          }
      );
  }

  if (working3) {
      gsap.fromTo("#working3",
          { y: inwardY, opacity: 0 },
          {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 2.5,
              ease: "power3.out",
              onComplete: () => console.log("Working3 section animation completed")
          }
      );
  }

  if (footerCards.length > 0) {
      gsap.fromTo("footer #cards .card",
          { x: inwardX, opacity: 0 },
          {
              x: 0,
              opacity: 1,
              duration: 1,
              delay: 3,
              stagger: 0.2,
              ease: "power3.out",
              onComplete: () => console.log("Footer cards animation completed")
          }
      );
  }
  if (googleLoginBtn) {
    gsap.fromTo("#googleLoginBtn",
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
        onComplete: () => console.log("Google login button animation completed")
      }
    );
  }

  // Google Sign-In logic
  if (googleLoginBtn && userDropdown && logoutBtn) {
    googleLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (googleLoginBtn.classList.contains("profile-pic")) {
        // Toggle dropdown visibility
        userDropdown.classList.toggle("active");
      } else {
        // Sign in with Google
        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          auth.signInWithPopup(provider)
            .then((result) => {
              const user = result.user;
              console.log("User signed in:", user.displayName, user.email);
              // Stay on the same page
            })
            .catch((error) => {
              console.error("Google Sign-In Error:", error.code, error.message);
              if (error.code === "auth/unauthorized-domain") {
                alert("This domain is not authorized for OAuth operations. Please ensure 'localhost' or '127.0.0.1' is added to Authorized domains in the Firebase Console (Authentication > Settings > Authorized domains).");
              } else {
                alert("Error signing in: " + error.message);
              }
            });
        } catch (error) {
          console.error("Error initializing Google Auth Provider:", error.message);
          alert("Authentication setup failed. Please try again later.");
        }
      }
    });

    // Logout button logic
    logoutBtn.addEventListener("click", () => {
      auth.signOut()
        .then(() => {
          console.log("User signed out");
          userDropdown.classList.remove("active");
        })
        .catch((error) => {
          console.error("Sign-out error:", error.message);
          alert("Error signing out: " + error.message);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!googleLoginBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove("active");
      }
    });
  }

  // Authentication state listener
  auth.onAuthStateChanged((user) => {
    if (user && googleLoginBtn && userName && userEmail) {
      console.log("User is signed in:", user.displayName);
      // Show profile picture
      googleLoginBtn.classList.add("profile-pic");
      googleLoginBtn.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="Profile Picture" title="View account">`;
      googleLoginBtn.style.display = "inline-block";
      // Update dropdown info
      userName.textContent = user.displayName || "User";
      userEmail.textContent = user.email || "No email";
    } else if (googleLoginBtn && userDropdown) {
      console.log("No user is signed in.");
      // Show sign-in button
      googleLoginBtn.classList.remove("profile-pic");
      googleLoginBtn.innerHTML = "Sign in with Google";
      googleLoginBtn.style.display = "inline-block";
      userDropdown.classList.remove("active");
      // Clear dropdown info
      if (userName) userName.textContent = "";
      if (userEmail) userEmail.textContent = "";
    }
  });
  // Outward animation on button click
  if (startButton) {
      startButton.addEventListener("click", () => {
          // Animate header elements upward with rotation
          if (heading) {
              gsap.to("#Heading, #Heading h1, #Heading h4", {
                  y: -outwardY,
                  opacity: 0,
                  rotation: 10,
                  duration: 1,
                  ease: "power3.in"
              });
          }

          // Animate main section
          if (working) {
              gsap.to("#working", {
                  y: -outwardY,
                  opacity: 0,
                  rotation: -5,
                  duration: 1,
                  ease: "power3.in"
              });
          }

          if (mainCards.length > 0) {
              gsap.to("main #cards .card", {
                  x: (index) => (index % 2 === 0 ? -outwardX : outwardX),
                  y: (index) => (index % 2 === 0 ? -outwardY / 2 : outwardY / 2),
                  rotation: (index) => (index % 2 === 0 ? -15 : 15),
                  opacity: 0,
                  duration: 1,
                  stagger: 0.15,
                  ease: "power3.in"
              });
          }

          // Animate section #main2
          if (working2) {
              gsap.to("#working2", {
                  y: outwardY,
                  opacity: 0,
                  rotation: 5,
                  duration: 1,
                  ease: "power3.in"
              });
          }

          // Animate footer
          if (working3) {
              gsap.to("#working3", {
                  y: outwardY,
                  opacity: 0,
                  rotation: -5,
                  duration: 1,
                  ease: "power3.in"
              });
          }

          if (footerCards.length > 0) {
              gsap.to("footer #cards .card", {
                  x: (index) => (index % 2 === 0 ? outwardX : -outwardX),
                  y: (index) => (index % 2 === 0 ? outwardY / 2 : -outwardY / 2),
                  rotation: (index) => (index % 2 === 0 ? 15 : -15),
                  opacity: 0,
                  duration: 1,
                  stagger: 0.15,
                  ease: "power3.in"
              });
          }

          // Fade out background and clear the page
          gsap.to("body", {
              duration: 0.8,
              backgroundColor: "rgba(26, 26, 26, 0)",
              delay: 1.2,
              onComplete: () => {
                window.location.href = "../templates/upload.html"; 
            }
          });
      });
  }
});