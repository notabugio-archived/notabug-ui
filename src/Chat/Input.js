import React, {
  Fragment,
  useContext,
  useState,
  useCallback,
  createRef,
  useRef,
  useEffect,
} from "react"
import { propOr } from "ramda"
import isNode from "detect-node"
import { Constants } from "@notabug/peer"
import { useUi } from "/UI"
import { useNotabug } from "/NabContext"

const MAX_TEXTAREA_HEIGHT = 120

export const ChatInput = ({ ListingContext, scrollToBottom, scrollable }) => {
  const { me, api, onMarkMine } = useNotabug()
  const { submitTopic: topic, addSpeculativeId } = useContext(ListingContext)
  const { quote } = useUi()
  const [body, setBody] = useState("")
  const alias = propOr("anon", "alias", me)
  const chatName = `t/${topic} public`
  const textarea = createRef()

  const resizeInput = (target, reset) => {
    if(reset) {
      target.style.height = target.style.minHeight
    }
    else {
      target.style.height = 0 // to make the box shrink if required
      target.style.height = Math.min(MAX_TEXTAREA_HEIGHT, target.scrollHeight) + "px"
    }
    target.style.overflowY = target.scrollHeight > MAX_TEXTAREA_HEIGHT ? "scroll" : "hidden"
  }

  const onSend = useCallback(
    evt => {
      evt && evt.preventDefault()
      if (!body || !body.trim())
        return

      // ensure 2 newlines at the end of each line
      const multiline = body.replace(/\n\s*\n/g, "\n").replace(/\n/g, "\n\n")

      if(multiline.length > Constants.MAX_THING_BODY_SIZE)
        return

      api.chat({ topic, body: multiline }).then(res => {
        const id = res && res.id

        if (!id) return
        onMarkMine(id)
        addSpeculativeId && addSpeculativeId(id)
      })
      setBody("")
      scrollToBottom("force")
      resizeInput(evt.target, true)
    },
    [api, body, topic, scrollToBottom]
  )

  const onChangeBody = useCallback(evt => {
      setBody(evt.target.value)
      resizeInput(evt.target)
  }, [])

  const onKeyDown = useCallback(evt => {
    if(evt.key == "Enter" && !evt.shiftKey) {
      evt.preventDefault()
      return onSend(evt)
    }

    if(!scrollable || !scrollable.current)
      return

    if(evt.key == "PageDown" || evt.key == "PageUp") {
      evt.preventDefault()
      const dir = evt.key == "PageDown" ? 1 : -1
      const amount = dir * (evt.shiftKey ? scrollable.current.clientHeight * .9 : 20)
      scrollable.current.scrollTop = Math.max(1, scrollable.current.scrollTop + amount)
    }
  }, [api, body, topic])

  useEffect(() => textarea.current ? textarea.current.focus() : null, [])

  useEffect(() => {
    if(quote.length == 0)
      return

    const newBody = body + (body.length > 0 && body.slice(-1) != "\n" ? "\n" : "") + quote + "\n"
    setBody(newBody)

    const c = textarea.current
    c.value = newBody
    c.setSelectionRange(newBody.length, newBody.length)
    resizeInput(c)
    c.focus()
  }, [quote, body])

  return (
    <form className="chat-input" onSubmit={onSend}>
      {isNode ? (
        <noscript>
          <texarea
            rows="1"
            placeholder="chatting requires javascript"
            disabled
            readOnly
          />
          <button disabled className="send-btn" type="submit">
            send
          </button>
        </noscript>
      ) : (
        <Fragment>
          <textarea
            placeholder={`speaking as ${alias ? alias : "anon"} in ${chatName}`}
            rows="1"
            value={body}
            onChange={onChangeBody}
            onKeyDown={onKeyDown}
            ref={textarea}
          />
          <button className="send-btn" type="submit">
            send
          </button>
        </Fragment>
      )}
    </form>
  )
}
