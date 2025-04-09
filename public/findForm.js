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

    if (!isValid) {
        alert(errorMessage);
    } else {
        const formData = new FormData(this); 
        const params = new URLSearchParams();

        //Add values to paramatrs if they exist or not no pref
        if (formData.get('type')) {
            params.append('type', formData.get('type'));
        }
        if (formData.get('breed')?.trim()) { //only add breed if empty
            params.append('breed', formData.get('breed').trim());
        }
        if (formData.get('age') && formData.get('age') !== 'No Preference') {
            params.append('age', formData.get('age'));
        }
        if (formData.get('gender') && formData.get('gender') !== 'No Preference') {
            params.append('gender', formData.get('gender'));
        }

        const friendlyValues = formData.getAll('friendly[]');
        friendlyValues.forEach(value => {
            params.append('friendly', value);
        });

        //redirect to browse w/ params
        window.location.href = `/browse?${params.toString()}`;
    }
});

document.getElementById("reset-button")?.addEventListener("click", function() {
    document.getElementById("findForm").reset(); 
});