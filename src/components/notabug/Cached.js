import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { injectState } from "freactal";
import isNode from "detect-node";

let renderedLocation = null;
let hasBooted = false;

if (!isNode) {
  renderedLocation = window.initNabState && window.location;
}

class Cached extends PureComponent {
  componentDidMount = () => {
    if (!hasBooted && renderedLocation) {
      if (
        this.props.location.pathname === renderedLocation.pathname &&
        this.props.location.search === renderedLocation.search
      ) {
        hasBooted = true;
        return;
      }
    }
    this.doFetch(this.props);
    hasBooted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.pathname !== this.props.location.pathname ||
      nextProps.location.search !== this.props.location.search
    ) {
      this.doFetch(nextProps);
    }
  }

  doFetch(props) {
    const { location: { pathname, search } } = props || this.props;
    return this.props.effects.onFetchCache(pathname, search)
      .catch(error => {
        console.error(error.stack || error);
        this.props.state.notabugApi.scope.realtime();
      });
  }

  render() {
    const { Wrapped, ...props } = this.props;
    return <Wrapped {...props} />;
  }
}

export const cached = Wrapped => withRouter(injectState(props => (
  <Cached Wrapped={Wrapped} {...props} />
)));
