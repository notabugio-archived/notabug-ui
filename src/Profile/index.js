import React, { PureComponent } from "react";
import { injectState } from "freactal";
import { withRouter } from "react-router-dom";
import ProfileRender from "./Profile";

export class ProfileComponent extends PureComponent {
  constructor(props) {
    super(props);
    const nab = props.state.notabugApi;
    const userId = this.props.match.params.userid;
    this.scope = nab.scope;
    this.state = {
      userId, userAlias: null, createdAt: null,
      ...(nab.queries.userMeta.now(this.scope, userId) || {})
    };
  }

  componentDidMount = () => {
    this.getMeta(this.props);
    this.scope.on(this.onUpdate);
  }

  componentWillUnmount = () => this.scope.off(this.onUpdate);

  getMeta = ({ state: { notabugApi: nab }, match: { params: { userid } } }) =>
    nab.queries.userMeta(this.scope, userid).then(meta => this.setState(meta || {}));

  onUpdate = () => this.getMeta(this.props);

  render = () => (
    <ProfileRender
      key={this.state.userAlias+this.state.userId}
      {...this.props}
      {...this.state}
    />
  )
}

export const Profile = withRouter(injectState(ProfileComponent));
