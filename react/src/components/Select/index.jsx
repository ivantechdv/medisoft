import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';

const CustomSelect = ({
  options,
  onChange,
  defaultValue,
  isDisabled = false,
  targetHeight = 31,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  useEffect(() => {
    // Buscar la opción por su valor cuando el defaultValue cambie
    const defaultOption = options.find(
      (option) => option.value === defaultValue,
    );

    console.log(defaultOption);
    setSelectedOption(defaultOption);
  }, [defaultValue, options]);
  const styles = {
    control: (base, state) => ({
      ...base,
      minHeight: 'initial',
      marginTop: '4px',
      borderWidth: '1px',
      borderColor: state.isFocused
        ? '0 0 0 0.1rem rgba(99, 102, 241, 0.25)'
        : '#D1D5DB', // Cambia el color del borde cuando está enfocado o no
    }),
    valueContainer: (base) => ({
      ...base,
      height: `${targetHeight - 1 - 1}px`,
      padding: '0 8px',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
    }),
  };
  return (
    <Select
      options={options}
      styles={styles}
      onChange={onChange}
      isDisabled={isDisabled}
      defaultValue={selectedOption}
      key={selectedOption}
    />
  );
};

export default CustomSelect;
