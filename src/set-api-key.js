import sketch from 'sketch'

export default function() {
  return new Promise((resolve, reject) => {
    sketch.UI.getInputFromUser('Remove.bg API Key', {
      description: 'You can find your API key on https://www.remove.bg/profile#api-key.',
      okButton: 'Save API Key'
    }, (err, value) => {
      if (err) {
        return reject(err)
      }
      sketch.Settings.setSettingForKey('api-key', value)
      return resolve(value)
    })
  })
}
