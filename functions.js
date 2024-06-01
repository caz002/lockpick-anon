
// Current Angle Button
// adds one to angle
console.log("functions.js")
document.querySelector('#add-button').addEventListener("click", function() {
  let currVal = Number(document.querySelector('#angle-value').innerText);
  document.querySelector('#angle-value').innerText = currVal + 1;
});

// subtracts one from angle
document.querySelector('#sub-button').addEventListener("click", function() {
  let currVal = Number(document.querySelector('#angle-value').innerText);
  document.querySelector('#angle-value').innerText = currVal - 1;
});

document.querySelector('#connect-port').addEventListener("click", async function() {
  let port;

  async function requestSerialPort() {
      try {
          const filters = [{ usbVendorId: 0x1a86 }];
          port = await navigator.serial.requestPort({ filters });
          console.log("Port selected:", port);

          await port.open({ baudRate: 115200 });
          console.log("Port opened:", port);

          readSerialData(port);
      } catch (error) {
          console.error("There was an error selecting a port:", error);
      }
  }

  async function readSerialData(port) {
      const outputElement = document.getElementById('serialOutput');
      if (port.readable) {
          const reader = port.readable.getReader();
          try {
              while (true) {
                  const { value, done } = await reader.read();
                  if (done) {
                      console.log("Reader has been canceled");
                      break;
                  }
                  const text = new TextDecoder().decode(value);
                  console.log(text);
                  outputElement.textContent = text;
              }
          } catch (error) {
              console.error("Error reading from serial port:", error);
              outputElement.textContent = `Error: ${error.message}`;
          } finally {
              reader.releaseLock();
          }
      } else {
          outputElement.textContent = "Port is not readable";
      }
  }

  await requestSerialPort();
});


// Progress Bar
let count = 0;
export function addProgress(){
  document.documentElement.style
    .setProperty('--my-start-width', `${count}%`);
  count += 100.0/7.0;
  document.querySelector('#progress-percentage').innerText = Math.floor(count);
  document.querySelector('.progress-fill').style.width = `${Math.floor(count)}%`;
  document.documentElement.style
    .setProperty('--my-end-width', `${Math.floor(count)}%`);
  console.log(getComputedStyle(document.body).getPropertyValue('--my-start-width'));
  console.log(getComputedStyle(document.body).getPropertyValue('--my-end-width'));
  triggerAnimation();
}
document.querySelector('#reset').addEventListener("click", function(){
  location.reload();
});
// animates progress bar when a new pin reaches the correct height
export function triggerAnimation() {
  var element = document.querySelector('.progress-fill');
  element.classList.remove('animate');
  void element.offsetWidth; // Trigger reflow
  element.classList.add('animate');
}