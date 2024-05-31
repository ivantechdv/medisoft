import React, { useEffect, useState } from 'react';
import Select from 'react-select';

const CustomSelect = ({
  options,
  onChange,
  defaultValue,
  isDisabled = false,
  targetHeight = 30,
  isMulti = false, // Nueva prop para manejar múltiples selecciones
  onHandleLoadingSelect = null,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  useEffect(() => {
    try {
      // Buscar las opciones por su valor cuando el defaultValue cambie
      if (isMulti) {
        setSelectedOptions(defaultValue);
      } else {
        const defaultOption = options.find(
          (option) => option.value === defaultValue,
        );
        setSelectedOptions(defaultOption);
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      if (onHandleLoadingSelect != null) {
        onHandleLoadingSelect();
      }
    }
  }, [defaultValue, options, isMulti]);

  const styles = {
    control: (base, state) => ({
      ...base,
      minHeight: targetHeight,
      marginTop: '4px',
      borderWidth: '1px',
      borderColor: state.isFocused ? '#6366F1' : '#D1D5DB', // Cambia el color del borde cuando está enfocado o no
      boxShadow: state.isFocused
        ? '0 0 0 0.1rem rgba(99, 102, 241, 0.25)'
        : 'none',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px',
      alignItems: 'center',
      minHeight: `${targetHeight - 8}px`,
    }),
    multiValue: (base) => ({
      ...base,
      display: 'flex',
      alignItems: 'center',
    }),
    multiValueLabel: (base) => ({
      ...base,
      padding: '2px',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: `${(targetHeight - 20) / 2}px`,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: `${(targetHeight - 20) / 2}px`,
    }),
  };

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    onChange(selected);
  };

  return (
    <Select
      options={options}
      styles={styles}
      onChange={handleChange}
      isDisabled={isDisabled}
      isMulti={isMulti} // Propiedad para permitir múltiples selecciones
      defaultValue={selectedOptions}
      value={selectedOptions}
      key={
        isMulti ? selectedOptions.map((opt) => opt.value).join(',') : 'single'
      }
    />
  );
};

export default CustomSelect;
