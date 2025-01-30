window.addEventListener('load', function() {
  fetch('component.html')
  .then(response => response.text())
  //.then(data => {console.log(data);return data})
  .then(data => document.getElementById("component-wrapper").innerHTML = data)
  .catch(error => console.error('Error:', error));
});
