import React from "react";
import { injectState } from "freactal";
import { AuthorLink } from "./AuthorLink";

class UserIdLinkBase extends React.Component {
  state = { alias: null };

  constructor(props) {
    super(props);
    const nab = props.state.notabugApi;
    const { userId } = props;
    nab.gun && nab.gun.get(`~${userId}`).then(user => {
      if (!user) return;
      this.setState({ alias: user.alias });
    });
  }

  render() {
    const { userId } = this.props;
    const { alias } = this.state;
    if (!userId || !alias) return null;
    return (
      <AuthorLink author={alias} author_fullname={userId} />
    );
  }
}

export const UserIdLink = injectState(UserIdLinkBase);
