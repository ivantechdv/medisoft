// Stepper.js
import React from 'react';
import './stepper.css';

const Stepper = ({ currentStep, totalSteps, stepTexts, onStepClick }) => {
  // ejemplo:
  //  <Stepper currentStep={stage} totalSteps={2}  onStepClick={handleStepClick} stepTexts={['Usuario', 'Permisologia']}/>  
  // si el handle function sTepClick es null, entonces el componente no admitira click en las opciones 
  const breadcrumbs = Array.from({ length: totalSteps }, (_, index) => index + 1);

  const handleStepClick = (step) => {
    
    if (onStepClick) {
      onStepClick(step);
      
    }
  };

  return (
    <nav>
      <div className="nav-wrapper bg-gray-800">
        <div className="flex w-full">
          {breadcrumbs.map((step, index) => (
            <div className="flex items-center" key={index}>
              {index !== 0 && (
                <span className="mx-2 text-gray-400">{`>`}</span>
              )}
              <a
               onClick={() => handleStepClick(step)}
                className={`mr-2 ml-2 breadcrumb ${index === currentStep ? 'active' : 'text-white'}`}
              >
                {stepTexts && stepTexts[index] ? stepTexts[index] : `Step ${step}`}
              </a>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Stepper;
