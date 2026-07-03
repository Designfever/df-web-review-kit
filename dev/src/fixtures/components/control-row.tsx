export function ControlRow() {
  return (
    <div className="dev-component-row" data-qa-id="control-row">
      <button data-qa-id="primary-button" type="button">
        Primary button
      </button>
      <button data-qa-id="secondary-button" type="button">
        Secondary button
      </button>
      <label data-qa-id="input-label">
        Input label
        <input placeholder="Focusable field" />
      </label>
    </div>
  );
}
