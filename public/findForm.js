document.getElementById("findForm").addEventListener("submit", function (event) {
    event.preventDefault();
        
    let isValid = true;
    let errorMessage = "";
        
    const petTypeRadios = document.getElementsByName("type");
    let petType = "";

    for (let radio of petTypeRadios) {
        if (radio.checked) {
            petType = radio.value;
            break;
        }
    }

    if (!petType) {
        errorMessage += "Select  pet type\n";
        isValid = false;
    }

    const friendlyOpts = document.getElementsByName("friendly[]");
    let isFriendlySelected = false;

    for (let checkbox of friendlyOpts) {
        if (checkbox.checked) {
            isFriendlySelected = true;
            break; 
        }
    }

    if (!isFriendlySelected) {
        errorMessage += "Select at least one option for what your pet is friendly with\n";
        isValid = false;
    
    }

    if (!isValid) {
        alert(errorMessage); 
    } else {
        this.submit();
    }
});
