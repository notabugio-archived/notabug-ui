import React from "react";

const MarkdownHelp = () => (
  <div className="markhelp" style={{ display: "none" }} >
    <p>
      reddit uses a slightly-customized version of{" "}
      <a href="http://daringfireball.net/projects/markdown/syntax">
        Markdown
      </a>{" "}
      for formatting. See below for some basics, or check{" "}
      <a href="/wiki/commenting">
        the commenting wiki page
      </a>{" "}
      for more detailed help and solutions to common issues.
    </p>
    <table className="md">
      <tbody>
        <tr
          style={{
            backgroundColor: "#ffff99",
            textAlign: "center"
          }}
        >
          <td>
            <em>you type:</em>
          </td>
          <td>
            <em>you see:</em>
          </td>
        </tr>
        <tr>
          <td>*italics*</td>
          <td>
            <em>italics</em>
          </td>
        </tr>
        <tr>
          <td>**bold**</td>
          <td>
            <b>bold</b>
          </td>
        </tr>
        <tr>
          <td>[reddit!](https://reddit.com)</td>
          <td>
            <a href="https://reddit.com">reddit!</a>
          </td>
        </tr>
        <tr>
          <td>
            * item 1<br />
            * item 2<br />
            * item 3
          </td>
          <td>
            <ul>
              <li>item 1</li>
              <li>item 2</li>
              <li>item 3</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>> quoted text</td>
          <td>
            <blockquote>quoted text</blockquote>
          </td>
        </tr>
        <tr>
          <td>
            Lines starting with four spaces<br />
            are treated like code:<br />
            <br />
            <span className="spaces">    </span>if 1 * 2 != 3:<br />
            <span className="spaces">        </span>print
            "hello, world!"<br />
          </td>
          <td>
            Lines starting with four spaces<br />
            are treated like code:<br />
            <pre>
              if 1 * 2 != 3:<br />    print "hello, world!"{"\n"}
            </pre>
          </td>
        </tr>
        <tr>
          <td>~~strikethrough~~</td>
          <td>
            <strike>strikethrough</strike>
          </td>
        </tr>
        <tr>
          <td>super^script</td>
          <td>
            super<sup>script</sup>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default MarkdownHelp;
