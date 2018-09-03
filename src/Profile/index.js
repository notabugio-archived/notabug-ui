import React, { PureComponent } from "react";
import { injectState } from "freactal";
import { withRouter } from "react-router-dom";
import ProfileRender from "./Profile";

export class ProfileComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.listing = props.listing || props.state.notabugApi.scopedListing();
    const userId = this.props.match.params.userid;
    this.state = {
      userId, userAlias: null, createdAt: null,
      ...(this.listing.userMeta.now(userId) || {})
    };
  }

  componentDidMount = () => {
    this.getMeta(this.props);
    this.listing.scope.on(this.onUpdate);
  }

  getMeta = ({ match: { params: { userid } } }) => this.listing.userMeta(userid)
    .then(meta => this.setState(meta || {}))
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
