import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import { injectState } from "freactal";
import isNode from "detect-node";
import { locationKey } from "./locationKey";

let hasBooted = false;
let renderedLocation = null;
if (!isNode) renderedLocation = window.initNabState && window.location;

class Cached extends PureComponent {
  componentDidMount() {
    if (!hasBooted && renderedLocation) {
      if (
        this.props.location.pathname === renderedLocation.pathname &&
        this.props.location.search === renderedLocation.search
      ) return hasBooted = true;
    }
    this.doFetch(this.props);
    hasBooted = true;
  }

  doFetch = (props) => {
    const { location: { pathname, search } } = props || this.props;
    if (this.props.state.notabugApi.scope.getIsRealtime()) return;
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

export const cached = Wrapped =>
  locationKey(withRouter(injectState(p =>  <Cached {...{ Wrapped }} {...p} />)));
