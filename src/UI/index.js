import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
  useEffect,
} from "react"
import quoteText from "/utils/quote"

export const UiStateContext = createContext()

export const useUiState = () => {
  const [quote, setQuote] = useState("")
  const quoteSelected = () => quoteText(window.getSelection().toString())
  const setQuotedText = (text) => setQuote(quoteText(text))

  useEffect(() => setQuote(""), [quote])

  const ui = {
    quote,
    setQuote: setQuotedText,
    quoteSelected,
  }

  return useMemo(() => ui, Object.values(ui))
}

export const setDarkMode = (mode = "restore", defaultOn = false) => {
  // valid modes: on, off, toggle, restore
  const classes = document.querySelector("html").classList
  if(mode == "restore") {
    try {
      const stored = localStorage.getItem("darkmode")
      const dark = stored === null ? defaultOn : stored == "on"
      classes[dark ? "add" : "remove"].call(classes, "darkmode")
    }
    catch(e) {
      console.error("Could not restore dark mode preference", e.stack || e)
    }

    return
  }

  try {
    const action = mode == "on" ? "add" : mode == "off" ? "remove" : "toggle"
    classes[action].call(classes, "darkmode")
    localStorage.setItem("darkmode", classes.contains("darkmode") ? "on" : "off")
  }
  catch(e) {
    console.error("Could not store dark mode preference", e.stack || e)
  }
}


export const UiStateProvider = ({ children }) => (
  <UiStateContext.Provider value={useUiState()}>
    {children}
  </UiStateContext.Provider>
)

export const useUi = () => {
  return useContext(UiStateContext)
}
