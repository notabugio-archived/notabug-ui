import { useState, useCallback, useMemo, useEffect } from 'react'
import * as R from 'ramda'
import { useNotabug } from '/NabContext'
import isNode from 'detect-node'
import debounce from 'lodash.debounce'

export const useMemoizedObject = obj => useMemo(() => obj, R.values(obj))

export const useToggle = (defaultState = false) => {
  const [isExpanded, setIsExpanded] = useState(defaultState)
  const onToggleExpanded = useCallback(evt => {
    evt && evt.preventDefault()
    setIsExpanded(ex => !ex)
  }, [])

  return [isExpanded, onToggleExpanded, setIsExpanded]
}

export const useScope = (deps = [], opts = {}) => {
  const { api } = useNotabug()
  const scope = useMemo(() => {
    if (isNode) return api.scope

    return api.newScope({
      ...opts,
      unsub: false,
      gun: api.gun.chaingun,
      graph: api.scope.getGraph()
    })
  }, deps)

  useEffect(() => () => scope.off(), [])

  return scope
}

export const useQuery = (query, args = [], name = 'unknown') => {
  const scope = useScope([query, ...args], { timeout: 90000 })
  const [hasResponseState, setHasResponse] = useState(false)
  const [{ result }, setResult] = useState(
    useMemo(
      () => ({ result: query && query.now && query.now(scope, ...args) }),
      []
    )
  )
  const hasResponse = typeof result !== 'undefined' || hasResponseState

  const doUpdate = useCallback(
    (soul, node) => {
      if (!query) return

      query(scope, ...args).then(res => {
        res && setResult({ result: res })
        setHasResponse(true)
      })
    },
    [scope, query, ...args]
  )

  useEffect(
    () => {
      const debounced = debounce(doUpdate, 300, {
        trailing: true,
        maxWait: 500
      })
      const update = (...args) => debounced()

      update()
      scope.on(update)

      return () => {
        scope.off(update)
      }
    },
    [doUpdate]
  )

  return [result, hasResponse]
}

export const useShowMore = (items, foldSize = 5) => {
  const [visibleCount, setVisibleCount] = useState(foldSize)
  const moreCount = ((items && items.length) || 0) - visibleCount

  const onShowMore = useCallback(
    evt => {
      evt && evt.preventDefault()
      setVisibleCount(items.length)
    },
    [items.length]
  )

  return { visibleCount, moreCount, onShowMore }
}
