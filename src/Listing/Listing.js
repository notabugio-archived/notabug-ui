import React from "react";
import { path } from "ramda";
import { withRouter } from "react-router-dom";
import { ListingLimitedIds } from "./LimitedIds";
import { Thing } from "./Thing";
import { injectState } from "freactal";

export class Listing extends React.PureComponent {
  componentDidMount() {
    if (this.props.realtime) this.props.state.notabugApi.scope.realtime();
  }

  render() {
    const {
      Empty,
      Container=React.Fragment,
      containerProps={},
      childrenPropName="children",
      ids,
      children,
      ...props
    } = this.props;
    const renderProps = ({ ids }) => {
      if (!ids.length && Empty) return <Empty />;
      const rendered = ids.map((id, idx) => this.renderThing(idx, id));
      children && rendered.push(children({ ids }));
      return <Container {...{...containerProps, [childrenPropName]: rendered }} />;
    };
    if (ids) return renderProps({ ids });
    return <ListingLimitedIds {...props}>{renderProps}</ListingLimitedIds>;
  }

  renderThing(idx, id) {
    const { myContent = {} } = this.props;
    const count = parseInt(path(["props", "listingParams", "count"], this) || 0);
    return (
      <Thing
        Loading={this.props.Loading}
        isVisible={this.props.autoVisible}
        realtime={this.props.realtime}
        topic={this.props.topic}
        listingParams={this.props.listingParams}
        replyTree={this.props.replyTree}
        fetchParent={this.props.fetchParent}
        hideReply={this.props.hideReply}
        disableChildren={this.props.disableChildren}
        id={id}
        key={id}
        isMine={!!myContent[id]}
        rank={this.props.noRank ? null : count + idx + 1}
        onDidUpdate={this.props.onDidUpdate}
        collapseThreshold={this.props.collapseThreshold}
      />
    );
  }
}

export default withRouter(injectState(Listing));
