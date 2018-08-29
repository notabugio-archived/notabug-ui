import { Component } from "react";
import { withRouter } from "react-router-dom";

class ScrollToTop extends Component {
  componentDidUpdate = (prevProps) =>
    (this.props.location !== prevProps.location) && window.scrollTo(0, 0);
  render = () => this.props.children;
}

export default withRouter(ScrollToTop);
