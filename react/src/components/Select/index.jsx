import React, { useEffect, useState } from 'react';
import Select from 'react-select';

const CustomSelect = ({
  options,
  onChange,
  defaultValue,
  isDisabled = false,
  targetHeight = 30,
  isMulti = false,
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
      borderColor: state.isFocused ? '#6366F1' : '#D1D5DB',
      boxShadow: state.isFocused
        ? '0 0 0 0.1rem rgba(99, 102, 241, 0.25)'
        : 'none',
      color: state.isDisabled ? '#000' : '#000',
      backgroundColor: state.isDisabled ? '#f5f5f5' : base.backgroundColor,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px',
      alignItems: 'center',
      minHeight: `${targetHeight - 8}px`,
      color: '#000',
    }),
    multiValue: (base) => ({
      ...base,
      display: 'flex',
      alignItems: 'center',
    }),
    multiValueLabel: (base) => ({
      ...base,
      padding: '2px',
      color: '#000',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: `${(targetHeight - 20) / 2}px`,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: `${(targetHeight - 20) / 2}px`,
    }),
    placeholder: (base, state) => ({
      ...base,
      color: state.isDisabled ? '#000' : base.color,
    }),
    input: (base, state) => ({
      ...base,
      color: state.isDisabled ? '#000' : base.color,
    }),
    singleValue: (base, state) => ({
      ...base,
      color: state.isDisabled ? '#000' : base.color,
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
      isMulti={isMulti}
      defaultValue={selectedOptions}
      value={selectedOptions}
      key={
        isMulti ? selectedOptions.map((opt) => opt.value).join(',') : 'single'
      }
    />
  );
};

export default CustomSelect;
