import { useState, type KeyboardEvent } from "react";

type TagsInputProps = {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

function TagsInput({ id, value, onChange, placeholder }: TagsInputProps) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const next = draft.trim();
    if (next && !value.includes(next)) {
      onChange([...value, next]);
    }
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
  };

  return (
    <div className="producer-tags-input">
      {value.map((tag) => (
        <span key={tag} className="producer-tag">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} aria-label={`Quitar ${tag}`}>
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : ""}
      />
    </div>
  );
}

export default TagsInput;
