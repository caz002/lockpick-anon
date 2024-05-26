/**
 * Changes the angle value by a specified amount.
 * @param {number} change - The amount to change the angle value by.
 */
export function changeAngleValue(change) {
    let angleElement = document.querySelector('#angle-value');
    let currVal = Number(angleElement.innerText);
    angleElement.innerText = currVal + change;
}

// Event listeners for the buttons
document.querySelector('#add-button').addEventListener("click", function(event) {
    changeAngleValue(1);
});

document.querySelector('#sub-button').addEventListener("click", function(event) {
    changeAngleValue(-1);
});
