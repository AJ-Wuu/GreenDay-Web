import React from "react";
import { useState } from "react";
import AutoSuggest from "react-autosuggest";

const organizations = require("../places.json").Places;
const organizationsName = organizations.map(organization => organization.name);

const SearchBar: React.FC = () => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  function getSuggestions(value: string): string[] {
    return organizationsName.filter(organizationName =>
      organizationName.toLowerCase().includes(value.trim())
    );
  }
  return (
    <div>
      <style jsx>{`
          #auto-suggest {
            text-align: center;
            display: flex;
          }
        `}</style>
      <AutoSuggest id="auto-suggest"
        suggestions={suggestions}
        onSuggestionsClearRequested={() => setSuggestions([])}
        onSuggestionsFetchRequested={({ value }) => {
          setValue(value);
          setSuggestions(getSuggestions(value));
        }}
        onSuggestionSelected={(_, { suggestionValue }) =>
          console.log("Selected: " + suggestionValue)
        }
        getSuggestionValue={suggestion => suggestion}
        renderSuggestion={suggestion => <span>{suggestion}</span>}
        inputProps={{
          placeholder: "Search...",
          value: value,
          onChange: (_, { newValue }) => {
            setValue(newValue);
          }
        }}
        highlightFirstSuggestion={true}
      />
    </div>
  );
};

export default SearchBar;