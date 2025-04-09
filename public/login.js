const form = document.getElementById('register-form');
    const responseMsg = document.getElementById('response-message');

    function isValidUsername(username) {
      return /^[a-zA-Z0-9]+$/.test(username);
    }

    function isValidPassword(password) {
      return (
        /^[a-zA-Z0-9]{4,}$/.test(password) &&
        /[a-zA-Z]/.test(password) &&
        /\d/.test(password)
      );
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = form.username.value;
      const password = form.password.value;

      if (!isValidUsername(username)) {
        responseMsg.textContent = "Username must contain only letters and digits";
        return;
      }

      if (!isValidPassword(password)) {
        responseMsg.textContent = "Password must be at least 4 characters long, and include at least one letter and one digit";
        return;
      }

      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const text = await res.text();
      responseMsg.textContent = text;
    });