/*
  FILE PURPOSE:
  This script (js/password-toggle.js) enhances all password input fields across authentication pages. 
  It dynamically wraps password inputs and appends a "Show/Hide" toggle button to improve user experience 
  and accessibility on forms.

  FILES REFERENCED IN THIS FILE:
  - Associated Stylesheets (CSS): css/auth.css (defines styling for .password-input-wrapper and .password-toggle)
  - Associated Pages (HTML): login.html, signup.html (contains <input type="password"> elements)
*/

// Select all password input fields on the page
const passwordFields = document.querySelectorAll('input[type="password"]');

// Loop through each password field to attach the dynamic show/hide toggle button
passwordFields.forEach((input) => {
  
  // Create a wrapper container to position the input and toggle button together
  const wrapper = document.createElement("div");
  wrapper.className = "password-input-wrapper";
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  // Create the interactive toggle button element
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "password-toggle";
  toggle.textContent = "Show";
  toggle.setAttribute("aria-label", "Show password");

  // Add click event listener to switch field between text (visible) and password (hidden)
  toggle.addEventListener("click", () => {
    const showing = input.type === "text";
    
    // Toggle input type between "password" and "text"
    input.type = showing ? "password" : "text";
    
    // Update button text and accessibility labels
    toggle.textContent = showing ? "Show" : "Hide";
    toggle.setAttribute("aria-label", `${showing ? "Show" : "Hide"} password`);
  });

  // Append the newly created toggle button into the wrapper
  wrapper.appendChild(toggle);
});