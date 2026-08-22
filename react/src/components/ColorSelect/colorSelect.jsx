import Select from 'react-select';

const FORM_INPUT_FONT = 'var(--erp-form-input-size)';

const ColorSelect = ({ value, onChange, optionsConfig }) => {
  const options = Object.entries(optionsConfig).map(([val, option]) => ({
    value: val,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: option.color,
            marginRight: 8,
          }}
        />
        {option.label}
      </div>
    ),
  }));

  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value == value)}
      onChange={(selected) => onChange(selected.value)}
      className='react-select-container'
      classNamePrefix='react-select'
      styles={{
        control: (base) => ({
          ...base,
          borderColor: '#ccc',
          minHeight: '28px',
          height: '28px',
          fontSize: FORM_INPUT_FONT,
          marginTop: '4px',
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0 6px',
          fontSize: FORM_INPUT_FONT,
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: '28px',
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: '2px',
        }),
        singleValue: (base) => ({
          ...base,
          fontSize: FORM_INPUT_FONT,
        }),
        placeholder: (base) => ({
          ...base,
          fontSize: FORM_INPUT_FONT,
        }),
        option: (base) => ({
          ...base,
          fontSize: FORM_INPUT_FONT,
        }),
        menu: (base) => ({
          ...base,
          fontSize: FORM_INPUT_FONT,
        }),
      }}
    />
  );
};

export default ColorSelect;
