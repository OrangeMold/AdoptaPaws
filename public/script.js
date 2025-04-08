/**Handle time update */
function updateDateTime() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleString();
}

updateDateTime(); 
setInterval(updateDateTime, 1000)



