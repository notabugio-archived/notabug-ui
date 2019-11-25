import "core-js/stable"
import "regenerator-runtime/runtime"
import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import "/vendor/snew-classic-ui/static/css/minimal.css"
import "/vendor/snew-classic-ui/static/css/wiki.css"
import "/styles/index.css"
import "/styles/night.css"
import { App } from "/App"
import { ErrorBoundary } from "/utils"
// import { unregister } from "/utils/registerServiceWorker";

try {
  localStorage.removeItem("gun/")
  localStorage.removeItem("gap/gun/")
} catch (e) {
  console.error("error clearing localStorage", e.stack || e)
}

try {
  if(localStorage.getItem("darkMode") === "true") {
    document.documentElement.classList.add("darkmode")
  }
} catch(e) {
  console.warn("Can't access localStorage", e.stack)
}

const jsx = (
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
)

try {
  ReactDOM.render(jsx, document.body)
} catch (e) {
  console.error(e.stack || e)
  try {
    localStorage.removeItem("gun/")
    localStorage.removeItem("gap/gun/")
  } catch (e) {
    console.error(e.stack || e)
  }

  ReactDOM.render(jsx, document.body)
}

// unregister();
