import { useEffect, useRef, useState } from "react";

type MultiSelectDropdownProps = {
  id?: string;
  value: string[];
  options: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

function MultiSelectDropdown({ id, value, options, onChange, placeholder }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const toggleOption = (option: string) => {
    const next = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(next);
  };

  const removeValue = (option: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter((item) => item !== option));
  };

  return (
    <div className="producer-multiselect" ref={containerRef}>
      <button
        id={id}
        type="button"
        className="producer-multiselect__control"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        {value.length === 0 ? (
          <span className="producer-multiselect__placeholder">{placeholder}</span>
        ) : (
          <span className="producer-multiselect__chips">
            {value.map((option) => (
              <span key={option} className="producer-tag">
                {option}
                <button type="button" onClick={(event) => removeValue(option, event)} aria-label={`Quitar ${option}`}>
                  ×
                </button>
              </span>
            ))}
          </span>
        )}
        <span className="producer-multiselect__chevron" aria-hidden="true">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen ? (
        <div className="producer-multiselect__panel" role="listbox">
          {options.map((option) => (
            <label key={option} className="producer-multiselect__option">
              <input
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default MultiSelectDropdown;
