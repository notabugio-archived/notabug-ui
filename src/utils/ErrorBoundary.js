import React from "react";
import { Markdown } from "./Markdown";

export class ErrorBoundary extends React.PureComponent {
  state = { error: null, info: null };
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  onReload = () => location.reload(); // eslint-disable-line
  render() {
    const { error } = this.state;
    if (error) {
      const errorStr = `${error.stack || error}`
        .split("\n")
        .map(str => `    ${str}`)
        .join("\n");
      return (
        <div className="error-display">
          <h1>Error (this probably *is* a bug)</h1>
          <Markdown body={errorStr} />
          <button onClick={this.onReload}>reload notabug</button>
        </div>
      );
    }
    return this.props.children;
  }
}
