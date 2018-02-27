const ColorPicker = require('simple-color-picker');
const queryString = require('query-string');

window.onload = () => {

  const parsedQuery = queryString.parse(location.search);

  const colorPicker = new ColorPicker({
    width: 200,
    height: 200
  });

  colorPicker.appendTo(document.querySelector('#colorpicker'));

  if (parsedQuery.color) {
    colorPicker.setColor(`#${parsedQuery.color}`);
  }

  const setButton = document.querySelector('#setColorButton');

  setButton.onclick = () => {
    window.location.href = `/?color=${colorPicker.getHexString().slice(1)}`
  }
}

