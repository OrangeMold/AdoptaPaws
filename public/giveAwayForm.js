document.getElementById("giveAwayForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let isValid = true;
    let errorMessage = "";
        
    const breedInput = document.getElementById("breed").value;
    if (breedInput.trim() === "") {
        errorMessage += "Breed is Empty \n";
        isValid = false;
    }

    const commentText = document.getElementById("comment").value;
    if (commentText.trim() === "") {
        errorMessage += "Comment field is empty \n";
        isValid = false;
    }

    const nameInput = document.getElementById("owner-name").value;
    if (nameInput.trim() === "") {
        errorMessage += "Owner name is empty \n";
        isValid = false;
    }

    const emailInput = document.getElementById("owner-email").value;
    let emailValid = validateEmail(emailInput);
    if (emailValid) {
        errorMessage += emailValid;
        isValid = false;
    } 

    if (!isValid) {
        alert(errorMessage); 
    } else {
        this.submit();
    }
});

function validateEmail(email) {
    email = email.trim();
    if(email === "") return "email is empty"

    // check for exactly one @
    const atIndex = email.indexOf("@");
    if (atIndex === -1 || email.indexOf("@", atIndex + 1) !== -1) {
        return "email must have exactly one '@'";
    }

    // check for local prt before @
    const localPart = email.slice(0, atIndex);
    if (localPart.length === 0 || localPart.startsWith(".") || localPart.endsWith(".")) {
        return "local part can not start or end with period";
    }
    if (localPart.includes("..")) {
        return "local part can not have consecutive periods";
    }
    if (localPart.includes(" ")) {
        return "local part can not have a space";
    }

    // check for domain part after @
    const domainPart = email.slice(atIndex + 1);
    if (domainPart.length === 0 || domainPart.startsWith(".") || domainPart.endsWith(".") || domainPart.lastIndexOf(".") === -1) {
        return "domain can not start or end with a period, but must contain a period";
    }

    // TLD is at least 2 chars
    const tld = domainPart.slice(domainPart.lastIndexOf(".") + 1);
    if (tld.length < 2) {
        return "TLD must be atleast 2 characters long";
    }

    return false; //valid
}

