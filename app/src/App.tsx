import React, { MouseEventHandler, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

interface BlockedDynamicRules {
  id: number;
  url: string;
  active: boolean;
  chromeRule: ChromeDynamicRule;
}

interface ExceptionDynamicRules {
  id: number;
  url: string;
  chromeRule: ChromeDynamicRule;
}

interface ChromeDynamicRule {
  id?: number;
  priority?: number;
  url?: string;
  condition?: {
    type: string;
    urlFilter?: string;
    redirect?: {
      url: string;
    };
  };
}

interface DynamicRules {
  blockRules: BlockedDynamicRules[];
  exceptionRules: ExceptionDynamicRules[];
}

function App() {
  const [data, actions] = useState<DynamicRules>({
    blockRules: [],
    exceptionRules: [],
  });

  const [url, setUrl] = useState<string>("");

  const createChromeRule: () => ChromeDynamicRule = () => {
    return {};
  };

  const addToExceptions: MouseEventHandler<HTMLButtonElement> = (ev) => {};

  const addToBlocked: MouseEventHandler<HTMLButtonElement> = (ev) => {};

  return (
    <div className="App">
      <h1>Focus 101</h1>
      <p>Note: Clear cookies for sites if extension does not work!</p>
      <br />
      <form id="options_form">
        <label>
          Enabled
          <input
            type="radio"
            id="enabled_radio_btn"
            name="filtering_mode"
            value="ENABLED"
          />
        </label>
        <br />

        <label>
          Disabled
          <input
            type="radio"
            id="disabled_radio_btn"
            name="filtering_mode"
            value="DISABLED"
          />
        </label>
        <br />
        <br />
      </form>

      <div id="content">
        <form id="input_form">
          <input
            type="text"
            id="blocked_url_text"
            name="blocked_url"
            placeholder="Enter url: e.g. abc.com"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />
          <br />
          <br />
          <button onClick={addToBlocked}>Block URL</button>
          <button onClick={addToExceptions}>Add to exceptions</button>
          <br />
        </form>

        <div id="info_window">
          <h3>Blocked Urls</h3>
          <ul id="blocked_urls_ul"></ul>
        </div>
      </div>
    </div>
  );
}

export default App;
