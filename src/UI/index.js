import React, {
	createContext,
	useState,
	useCallback,
	useMemo,
	useContext,
	useEffect,
} from "react"

export const UiStateContext = createContext()

export const useUiState = () => {
	const [quote, setQuote] = useState("")

	const quoteSelected = () => {
		setQuote(window.getSelection().toString())
	}

	useEffect(() => setQuote(""), [quote])

	const ui = {
		quote,
		setQuote,
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
