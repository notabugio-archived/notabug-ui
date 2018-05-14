import React from "react";

// https://github.com/facebook/react/issues/5677#issuecomment-280295107
export default function pure(func) {
  class PureComponentWrap extends React.PureComponent {
    render() {
      return func(this.props, this.context);
    }
  }
  return PureComponentWrap;
}
