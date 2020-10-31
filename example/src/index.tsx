import 'react-app-polyfill/ie11'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './styles.css'

if ('hot' in module) {
  // @ts-ignore
  module.hot.accept()
}

ReactDOM.render(<App />, document.getElementById('root'))
