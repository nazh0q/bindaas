// Contact Form Handler
// This form now uses a secure serverless API endpoint to send emails
// EmailJS credentials are stored securely on the server (Vercel environment variables)

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Validate required fields
      if (!firstName || !lastName || !email || !message) {
        formMessage.textContent = 'Please fill in all fields.';
        formMessage.className = 'form-message form-message-error';
        formMessage.style.display = 'block';
        return;
      }
      
      // Show loading state
      formMessage.textContent = 'Sending...';
      formMessage.className = 'form-message form-message-loading';
      formMessage.style.display = 'block';
      
      // Send email via secure API endpoint
      fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          message: message
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Success
          formMessage.textContent = 'Thank you! Your message has been sent successfully.';
          formMessage.className = 'form-message form-message-success';
          contactForm.reset();
          
          // Hide message after 5 seconds
          setTimeout(function() {
            formMessage.style.display = 'none';
          }, 5000);
        } else {
          // Error from API
          throw new Error(data.error || 'Failed to send email');
        }
      })
      .catch(error => {
        // Error
        console.error('Email Error:', error);
        formMessage.textContent = 'Sorry, there was an error sending your message. Please try again or email us directly at aashna@bindaasbranding.com';
        formMessage.className = 'form-message form-message-error';
      });
    });
  }
});

