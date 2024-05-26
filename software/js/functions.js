// Progress Bar
let count = 0;
export function addProgress(){
    document.documentElement.style.setProperty('--my-start-width', `${count}%`);
    count += 14;
    document.querySelector('#progress-percentage').innerText = count;
    document.querySelector('.progress-fill').style.width = `${count}%`;
    document.documentElement.style
      .setProperty('--my-end-width', `${count}%`);
    console.log(getComputedStyle(document.body).getPropertyValue('--my-start-width'));
    console.log(getComputedStyle(document.body).getPropertyValue('--my-end-width'));
    triggerAnimation();
}
document.querySelector('#reset').addEventListener("click", function() {
    location.reload();
});
// animates progress bar when a new pin reaches the correct height
export function triggerAnimation() {
    var element = document.querySelector('.progress-fill');
    element.classList.remove('animate');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('animate');
}