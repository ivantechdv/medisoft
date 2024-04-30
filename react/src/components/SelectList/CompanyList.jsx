import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import { useEffect, useState } from 'react';
import { show } from '../../api';

const animatedComponents = makeAnimated();

const URI = 'companies/getCompanies';
const companyURI = 'companies/getCompaniesById/';

const styles = {
   control: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: 'transparent',
      border: 0,
      boxShadow: 'none', 
   }),
   placeholder: (styles) => {
      return {
         ... styles,
         color: "#ffffff",
      }
   },
   option: (styles, {data, isDisabled, isFocused, isSelected}) => {
      return {
         ... styles,
         backgroundColor: 'transparent',
         color: data.color,
      }
   },
   multiValueLabel: (styles) => {
      return {
         ... styles,
         backgroundColor: 'transparent',
         color: "black",
         border: '1px solid orange'
      }
   },
   multiValueRemove: (styles) => {
      return {
         ... styles,
         backgroundColor: 'orange',
         color: "white",
      }
   }
};

const CompanySelect = ({ onChange, defaultValue, statusInp, multiSelect }) => {
   
   const [selectedOptions, setSelectedOptions] = useState([])
   const [statusInput, setStatusInput] = useState(false)

   const options_ids = async () => {
      if(defaultValue){
         const res = await show(companyURI+defaultValue)
         if(res){
            const data = res.map(company => ({ value: company.id, label: company.company }))
            setSelectedOptions(data)
            setStatusInput(statusInp)   
         }
      }
      
   } 

   useEffect(() => { options_ids() }, [defaultValue]) 
   
   const handleSelectChange = (selectedOptions) => {
      setSelectedOptions(selectedOptions);
      if (onChange) { onChange(selectedOptions); }
   };

   const loadOptions = async (searchValue, callback) => {
      const res = await show(URI)
      const options = res.map(company => ({ value: company.id, label: company.company, color: 'black' }))
     
      setTimeout(() => {
         const filteredOptions = options.filter((option) => 
            option.label.toLowerCase().includes(searchValue.toLowerCase())
         ); 
         callback(filteredOptions)
      }, 1000);
   }
    
   return (
      <>
         <AsyncSelect 
            cacheOptions
            defaultOptions
            closeMenuOnSelect={!multiSelect}
            loadOptions={loadOptions}
            components={animatedComponents}
            isMulti={multiSelect}
            isDisabled={statusInput}
            styles={styles}
            value={selectedOptions}
            onChange={ handleSelectChange }
            className="block py-0.5 px-0 w-full text-md text-gray-500 bg-transparent border-0 border-b-2 border-black appearance-none focus:outline-none focus:ring-0"
         />
      </>
   )
}

export default CompanySelect