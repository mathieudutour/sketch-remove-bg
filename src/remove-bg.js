import sketch from 'sketch'
import setApiKey from './set-api-key'

function getApiKey() {
  const apiKey = sketch.Settings.settingForKey('api-key')

  if (!apiKey) {
    return setApiKey().catch(() => {})
  } else {
    return Promise.resolve(apiKey)
  }
}

function removeBackground(objectWithImage, apiKey) {
  sketch.UI.message('Removing background...')

  const data = objectWithImage.image.nsdata

  const formData = new FormData();
  formData.append('image_file', {
    fileName: 'image.png',
    mimeType: 'image/png', // or whichever mime type is your file
    data: data
  });
  formData.append('size', 'auto');

  return fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey
    },
    body: formData
  }).then(res => {
    if (!res.ok) {
      return res.text().then(text => {
        let message = text
        try {
          const json = JSON.parse(message)
          if (json && json.errors && json.errors[0]) {
            message = json.errors[0].title
          }
        } catch (err) {}
        throw new Error(message)
      })
    }
    return res.blob()
  })
  .then(nsdata => {
    objectWithImage.image = nsdata
  })
  .catch(err => {
    console.error(err)
    sketch.UI.message(`Error: ${err.message}`)
  })
}

export default function() {
  const document = sketch.getSelectedDocument()
  if (!document) {
    return
  }
  const selection = document.selectedLayers
  if (!selection.length) {
    sketch.UI.message('Please select an image first')
    return
  }

  getApiKey().then(apiKey => {
    if (!apiKey) {
      sketch.UI.message('Please enter your Remove.bg API key first')
      return
    }
    selection.forEach(layer => {
      if (layer.type === 'Image') {
        return removeBackground(layer, apiKey)
      }
      if (layer.style && layer.style.fills.length) {
        layer.style.fills.forEach(fill => {
          if (fill.fill === 'Pattern' && fill.pattern && fill.pattern.patternType === 'Fill') {
            return removeBackground(fill.pattern, apiKey)
          }
        })
      }
    })
  })
}
