const canvas = new fabric.Canvas('myCanvas');
const internalWidth = 1000;
const internalHeight = 1250;
const scaleFactor = 2;  // For retina displays

canvas.setWidth(internalWidth);
canvas.setHeight(internalHeight);
canvas.setDimensions({
  width: internalWidth / scaleFactor,
  height: internalHeight / scaleFactor
});

const footerHeight = 100;
const logoURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/AfD_Logo_2021.svg/2560px-AfD_Logo_2021.svg.png';
let text, nameText, nameBackground; // Text references
let canvasSourceURL = '', qrCodeData = ''; // Other data variables

const inputs = {
  textInput: document.getElementById('textInput'),
  placeInput: document.getElementById('placeInput'),
  imageInput: document.getElementById('imageInput'),
  sourceURLInput: document.getElementById('sourceURLInput'),
  additionalTextInput: document.getElementById('additionalText'),
  nameInput: document.getElementById('nameInput'),
  dateInput: document.getElementById('dateInput')
};

const downloadBtn = document.getElementById('downloadBtn');
const refreshBtn = document.getElementById('refreshBtn');

downloadBtn.addEventListener('click', handleDownload);
refreshBtn.addEventListener('click', renderMain);

canvas.setBackgroundColor('#097cbb', canvas.renderAll.bind(canvas));
setGradientBackground();

function setGradientBackground() {
  canvas.backgroundImage = new fabric.Rect({
    left: 0,
    top: 0,
    width: canvas.width,
    height: canvas.height,
    fill: 'transparent',
    gradient: {
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
      colorStops: { 0: '#097cbb', 1: '#049dd2' }
    }
  });
}

function handleDownload() {
  const name = inputs.nameInput.value.trim();
  const date = inputs.dateInput.value.trim();
  const filename = `${name}_${date}.png`;

  if (canvas.getObjects().length === 0) {
    alert('The canvas is empty. Please add something before downloading.');
    return;
  }

  const highResCanvas = createHighResCanvas();
  const dataURL = highResCanvas.toDataURL({ format: 'png', quality: 1.0 });

  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  a.click();
}

function createHighResCanvas() {
  const originalWidth = canvas.getWidth();
  const originalHeight = canvas.getHeight();
  const highResCanvas = document.createElement('canvas');
  const highResContext = highResCanvas.getContext('2d');

  highResCanvas.width = originalWidth * scaleFactor;
  highResCanvas.height = originalHeight * scaleFactor;

  renderBackground(highResContext, originalWidth, originalHeight);
  renderObjects(highResContext);

  return highResCanvas;
}

function renderBackground(context, originalWidth, originalHeight) {
  if (canvas.backgroundColor) {
    context.fillStyle = canvas.backgroundColor;
    context.fillRect(0, 0, originalWidth * scaleFactor, originalHeight * scaleFactor);
  }

  if (canvas.backgroundImage) {
    const backgroundImg = canvas.backgroundImage._element || canvas.backgroundImage;
    if (backgroundImg instanceof HTMLImageElement) {
      context.drawImage(backgroundImg, 0, 0, originalWidth, originalHeight);
    }
  }
}

function renderObjects(context) {
  canvas.getObjects().forEach(obj => {
    const clonedObj = fabric.util.object.clone(obj);
    clonedObj.set({
      scaleX: clonedObj.scaleX * scaleFactor,
      scaleY: clonedObj.scaleY * scaleFactor,
      left: clonedObj.left * scaleFactor,
      top: clonedObj.top * scaleFactor
    });
    clonedObj.render(context);
  });
}

function renderMain() {
  renderFooterElements();
  loadImage();

  const name = inputs.nameInput.value.trim();
  updateOrCreateText();
  updateOrCreateNameText(name);

  const text = new fabric.Text('SpaghettiDev161.github.io', {
    left: 10,
    top: 10,
    fontFamily: 'Helvetica',
    fontSize: 8,
    fill: '#FFFFFF',
    fontWeight: 'bold'
  });
  canvas.add(text);

  canvas.renderAll();
}

function updateOrCreateText() {
  if (text) {
    text.set({ text: inputs.textInput.value });
  } else {
    text = new fabric.Text(inputs.textInput.value, {
      left: 50,
      top: 50,
      fontSize: 30,
      fill: '#FFFFFF',
      fontFamily: 'Helvetica',
      fontWeight: '1000',
      charSpacing: -2,
      lineHeight: 0.8
    });
    canvas.add(text);
  }
}

function updateOrCreateNameText(name) {
  const boxHeight = 40;
  const boxYPosition = canvas.height - footerHeight - 50;

  if (nameText) {
    nameText.set({ text: name });
    updateBackgroundPosition();
  } else {
    createNameText(name, boxHeight, boxYPosition);
  }

  nameText.on('moving', updateBackgroundPosition);
  nameText.on('changed', updateBackgroundPosition);

  canvas.renderAll();
}

function createNameText(name, boxHeight, boxYPosition) {
  nameText = new fabric.Text(name, {
    left: canvas.width / 2,
    top: boxYPosition - boxHeight / 2,
    fontSize: 33,
    fill: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontWeight: '900',
    textAlign: 'center',
    originX: 'center',
    originY: 'center'
  });
  canvas.add(nameText);

  nameBackground = new fabric.Rect({
    left: nameText.left - nameText.width / 2 - 10,
    top: nameText.top - nameText.height / 2,
    width: nameText.width + 20,
    height: boxHeight,
    fill: '#00335e',
    selectable: false,
    evented: false
  });
  canvas.add(nameBackground);
}

function updateBackgroundPosition() {
  if (nameBackground) {
    nameBackground.set({
      left: nameText.left - nameText.width / 2 - 10,
      top: nameText.top - nameText.height / 2 - 5,
      width: nameText.width + 20
    });
    nameBackground.setCoords();
  }
  canvas.bringToFront(nameText);
  canvas.renderAll();
}

function loadImage() {
  const file = inputs.imageInput.files[0];
  if (!file) {
    alert("Please select an image file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function(img) {
      const maxWidth = canvas.width * 0.8;
      const maxHeight = canvas.height * 0.6;

      img.scaleToWidth(Math.min(maxWidth, img.width));
      img.scaleToHeight(Math.min(maxHeight, img.height));

      img.set({
        left: (canvas.width - img.getScaledWidth()) / 2,
        top: (canvas.height - img.getScaledHeight()) / 2,
        hasControls: true,
        lockUniScaling: false,
        selectable: true,
        opacity: 1
      });

      canvas.add(img);
      img.sendToBack();

      img.on('moving', function() {
        img.sendToBack();
      });

      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };
  reader.readAsDataURL(file);
}

function renderFooterElements() {
  const { sourceURLInput, dateInput, placeInput } = inputs;
  const sourceURL = sourceURLInput.value.trim();
  let date = dateInput.value.trim();
  const place = placeInput.value.trim();

  if (!sourceURL || !date) {
    alert("Please enter a date and source URL.");
    return;
  }

  const domain = getDomain(sourceURL);

  createFooterRect();
  createQRCode(sourceURL);
  createTextElements(date, place, domain);
  createLogo();
}

function createFooterRect() {
  const footer = new fabric.Rect({
    left: 0,
    top: canvas.height - footerHeight,
    width: canvas.width,
    height: footerHeight,
    fill: '#FFFFFF'
  });
  canvas.add(footer);
  footer.selectable = false;
  footer.evented = false;
}

function createQRCode(sourceURL) {
  const qrCodeImg = new Image();
  qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(sourceURL)}&size=180x180`;
  qrCodeImg.crossOrigin = 'anonymous';

  qrCodeImg.onload = function () {
    const qrCodeFabricImg = new fabric.Image(qrCodeImg, {
      left: 5,
      top: canvas.height - footerHeight + 5,
      width: 180,
      height: 180
    });
    qrCodeFabricImg.scale(0.5);
    canvas.add(qrCodeFabricImg);
    qrCodeFabricImg.bringToFront();
    qrCodeFabricImg.selectable = false;
    qrCodeFabricImg.evented = false;
  };
}

function createTextElements(date, place, domain) {
  const textElements = [
    { text: `Quelle: ${domain}`, top: canvas.height - 20 },
    { text: `Ort: ${place}`, top: canvas.height - 35 },
    { text: `Datum: ${date.replace(/-/g, '.')}`, top: canvas.height - 50 },
    { text: inputs.additionalTextInput.value, top: canvas.height - 95 }
  ];

  textElements.forEach(({ text, top }) => {
    const textElement = new fabric.Text(text, {
      left: 105,
      top,
      fontSize: 12,
      fill: '#000000',
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
      textAlign: 'left'
    });
    canvas.add(textElement);
    textElement.bringToFront();
    textElement.selectable = false;
    textElement.evented = false;
  });
}

function createLogo() {
  fabric.Image.fromURL(logoURL, function(logo) {
    const scaleFactor = 0.05;
    logo.set({
      left: canvas.width * 2.2 / 3,
      top: canvas.height - footerHeight + 15,
      scaleX: scaleFactor,
      scaleY: scaleFactor
    });
    canvas.add(logo);
    logo.selectable = false;
    logo.evented = false;
  }, { crossOrigin: 'anonymous' });
}

function getDomain(url) {
  try {
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
    }
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}
