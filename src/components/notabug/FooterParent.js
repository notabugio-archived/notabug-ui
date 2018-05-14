import React from "react";

export const FooterParent = () => (
  <div className="footer-parent">
    {/*<!-- SEE http://code.reddit.com/LICENSE see Exhibit B -->*/}
    <a
      href="https://www.reddit.com/code/"
      title="snew-classic-ui design forked from reddit"
      style={{
        textAlign: "center",
        display: "inline-block",
        background: "white",
        marginTop: "1em",
      }}
    >
      <h3 style={{ color: "black" }}>Interface Design</h3>
      <img
        alt="Interface Design Powered by reddit."
        src="https://s3.amazonaws.com/sp.reddit.com/powered_by_reddit.png"
        style={{
          width: 140,
          height: 47
        }}
      />
    </a>
  </div>
);
