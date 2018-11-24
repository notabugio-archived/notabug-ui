import React from "react";
import { Markdown } from "./Markdown";

export class ErrorBoundary extends React.PureComponent {
  state = { error: null, info: null };
  componentDidCatch(error, info) {
    console.error(error, info);
    this.setState({ error, info });
  }
  onReload = () => location.reload(); // eslint-disable-line
  render() {
    const { error, info } = this.state;
    if (error) {
      const errorStr = `${error.stack || error}`
        .split("\n")
        .map(str => `    ${str}`)
        .join("\n");
      return (
        <div className="error-display">
          <h1>Error (this probably *is* a bug)</h1>
          <h3>{error}</h3>
          <Markdown body={errorStr} />
          <pre>{info}</pre>
          <button onClick={this.onReload}>reload notabug</button>
        </div>
      );
    }
    return this.props.children;
  }
}
