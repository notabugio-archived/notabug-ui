import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
  useEffect
} from "react"
import quoteText from "/utils/quote"

export const UiStateContext = createContext()

export function openConfig() {
  return {
    async get(key) {
      return JSON.parse(localStorage.getItem(key))
    },

    async put(key, value) {
      localStorage.setItem(key, JSON.stringify(value))
      return value
    }
  }
}

export function useConfig(config, key, defaultVal = "") {
  const [isLoaded, setIsLoaded] = useState(false)
  const [value, setValueState] = useState(defaultVal)

  const setValue = useCallback(newVal => {
    setValueState(newVal)
    return config.put(key, newVal)
  })

  useEffect(() => {
    config &&
      config
        .get(key)
        .then(val => {
          if (typeof val === "undefined") {
            return
          }

          setValueState(val)
        })
        .finally(() => {
          setIsLoaded(true)
        })
  }, [config])

  return [value, setValue, isLoaded]
}

export const useUiState = () => {
  const [quote, setQuote] = useState("")
  const [config] = useState(useMemo(() => openConfig(), []))

  const [darkMode, setDarkMode, isDarkModeLoaded] = useConfig(
    config,
    "darkmode",
    !!process.env.NAB_DARK_MODE
  )

  const quoteSelected = () => quoteText(window.getSelection().toString())
  const setQuotedText = text => setQuote(quoteText(text))

  useEffect(() => setQuote(""), [quote])

  const isConfigLoaded = !!isDarkModeLoaded

  const ui = {
    quote,
    setQuote: setQuotedText,
    quoteSelected,

    darkMode,
    setDarkMode,
    isConfigLoaded
  }

  return useMemo(() => ui, Object.values(ui))
}

export const useUi = () => {
  return useContext(UiStateContext)
}

export const UiStateProvider = ({ children }) => (
  <UiStateContext.Provider value={useUiState()}>
    {children}
  </UiStateContext.Provider>
)
