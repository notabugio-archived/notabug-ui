const quote = (text) => {
  if(text.length == 0)
    return text

  text = text
    .replace(/\n\s*\n/g, "\n")  // condense newlines
    .replace(/\n(?!$)/g, "\n>") // quote all lines, no quote after last newline
  return ">" + text
}

export default quote
