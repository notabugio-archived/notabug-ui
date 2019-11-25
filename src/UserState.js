import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
  useEffect
} from "react"
import quoteText from "/utils/quote"
import localforage from "localforage"
import yaml from "js-yaml"

export const UiStateContext = createContext()

const LOCALFORAGE_CONFIG_KEY = "nabuiconfig"

export function openConfig() {
  const readConfig = () =>
    localforage
      .getItem(LOCALFORAGE_CONFIG_KEY)
      .then(data => yaml.safeLoad(data || "") || {})

  return {
    async get(key) {
      return readConfig().then(res => res[key])
    },

    async put(key, value) {
      return readConfig()
        .then(conf => ({ ...conf, [key]: value }))
        .then(conf =>
          localforage.setItem(LOCALFORAGE_CONFIG_KEY, yaml.safeDump(conf))
        )
        .then(() => value)
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
    useMemo(() => {
      try {
        // Attempt to use localStorage as synchronous cache
        const defaultDarkMode = localStorage.getItem("darkMode")
        if (typeof defaultDarkMode === "undefined") {
          return !!process.env.NAB_DARK_MODE
        }

        return !!JSON.parse(defaultDarkMode)
      } catch (e) {
        console.warn("Can't read localStorage", e.stack)
      }

      return !!process.env.NAB_DARK_MODE
    })
  )

  useEffect(() => {
    try {
      if (darkMode !== !!process.env.NAB_DARK_MODE) {
        localStorage.setItem("darkMode", darkMode)
      } else {
        localStorage.removeItem("darkMode")
      }
    } catch (e) {
      console.warn("Can't write localStorage", e.stack)
    }
  }, [darkMode])

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
