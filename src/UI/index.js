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

export const UiStateProvider = ({ children }) => (
  <UiStateContext.Provider value={useUiState()}>
    {children}
  </UiStateContext.Provider>
)

export const useUi = () => {
  return useContext(UiStateContext)
}
