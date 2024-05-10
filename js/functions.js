//adds one to angle
document.querySelector('#add-button').addEventListener("click", function() {
    let currVal = Number(document.querySelector('#angle-value').innerText);
    document.querySelector('#angle-value').innerText = currVal + 1;
  });
//subtracts one from angle
document.querySelector('#sub-button').addEventListener("click", function() {
    let currVal = Number(document.querySelector('#angle-value').innerText);
    document.querySelector('#angle-value').innerText = currVal - 1;
  });
let count = 0;
export function addProgress(){
  count += 10;
  document.querySelector('#progress-percentage').innerText = count;
  document.querySelector('.progress-fill').style.width = `${count}%`;
}
document.querySelector('#reset').addEventListener("click", function(){
  location.reload();
})