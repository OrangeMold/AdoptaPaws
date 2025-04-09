 const loginForm = document.getElementById('loginForm');
 const usernameInput = document.getElementById('username');
 const passwordInput = document.getElementById('password');
 const clientErrorMessageDiv = document.getElementById('clientErrorMessage');

 loginForm.addEventListener('submit', function(event) {
     event.preventDefault();

     clientErrorMessageDiv.textContent = '';
     usernameInput.style.borderColor = ''; 
     passwordInput.style.borderColor = ''; 

     const serverError = document.querySelector('.server-error');
     if (serverError) serverError.style.display = 'none';

     const username = usernameInput.value;
     const password = passwordInput.value;

     let errors = []; //hold errors

     //Validation checks

     const usernameRegex = /^[a-zA-Z0-9]+$/;
     if (!usernameRegex.test(username)) {
         errors.push('Username format is invalid (only letters/digits allowed)');
         usernameInput.style.borderColor = 'red';
     }

     if (password.length < 4) {
         errors.push('Password format is invalid (must be at least 4 characters)');
         passwordInput.style.borderColor = 'red';
     }

     const passwordCharsRegex = /^[a-zA-Z0-9]+$/;
     if (password.length >= 4 && !passwordCharsRegex.test(password)) {
         errors.push('Password format is invalid (only letters/digits allowed)');
         passwordInput.style.borderColor = 'red';
     }

     const hasLetterRegex = /[a-zA-Z]/;
     if (!hasLetterRegex.test(password)) {
         errors.push('Password format is invalid (must contain a letter)');
         if (!passwordInput.style.borderColor) passwordInput.style.borderColor = 'red';
     }

     const hasDigitRegex = /[0-9]/;
     if (!hasDigitRegex.test(password)) {
         errors.push('Password format is invalid (must contain a digit)');
         if (!passwordInput.style.borderColor) passwordInput.style.borderColor = 'red';
     }

     if (errors.length > 0) {
         const uniqueErrors = [...new Set(errors)];
         clientErrorMessageDiv.innerHTML = uniqueErrors.join('<br>'); //display erros
     } else {
         loginForm.submit();
     }
 });