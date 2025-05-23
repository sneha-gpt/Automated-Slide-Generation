document.addEventListener("DOMContentLoaded", () => {
  // Check if GSAP is loaded
  if (typeof gsap === "undefined") {
      console.error("GSAP is not loaded. Please ensure the GSAP script is included.");
      return;
  }

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