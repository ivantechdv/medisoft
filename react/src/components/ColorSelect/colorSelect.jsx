import Select from 'react-select';

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
      styles={{
        control: (base) => ({
          ...base,
          borderColor: '#ccc',
          minHeight: '28px', // 🔽 reduce la altura
          height: '28px', // 🔽 fuerza altura
          fontSize: '13px',
          marginTop: '4px',
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0 6px', // 🔽 menos espacio interno
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: '28px', // 🔽 igualamos altura de los íconos
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: '2px', // 🔽 achicamos el botón flecha
        }),
      }}
    />
  );
};

export default ColorSelect;
