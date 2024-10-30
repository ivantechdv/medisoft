<div className='bg-white border rounded shadow'>
        <Stepper
          currentStep={1}
          totalSteps={2}
          stepTexts={['Categorías de activo', 'prueba']}
        />
        <div className='mb-4 overflow-x-auto  bg-gray-50 p-2'>
          <div className='flex'>
            <input
              type='text'
              placeholder='Busqueda'
              value={searchTerm}
              onChange={handleSearchTermChange}
              className='mt-1 p-1 md:w-1/2 w-full border rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            />
            <button
              className='bg-gray-700 hover:bg-gray-900 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm '
              onClick={() => openModal('add')}
            >
              Nuevo
            </button>
          </div>
          <div class="relative flex flex-col text-gray-700 bg-white shadow-md w-full rounded-xl bg-clip-border mt-2">
  <nav class="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
    <div class="flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 md:flex-row">
      <div class="grid mr-4 place-items-center">
        <img alt="candice" src="https://docs.material-tailwind.com/img/face-1.jpg" class="relative inline-block h-12 w-12 !rounded-full object-cover object-center" />
      </div>
      <div class="flex-1 md:flex md:items-center">
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            Tania Andrew
          </h6>
          <p class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700">
          ing.ivanrojas@gmail.com
        </p>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            18229563
          </h6>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            04121809294
          </h6>
        </div>
      </div>
    </div>
  </nav>
</div>
<div class="relative flex flex-col text-gray-700 bg-white shadow-md w-full rounded-xl bg-clip-border mt-2">
  <nav class="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
    <div class="flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 md:flex-row">
      <div class="grid mr-4 place-items-center">
        <img alt="candice" src="https://docs.material-tailwind.com/img/face-1.jpg" class="relative inline-block h-12 w-12 !rounded-full object-cover object-center" />
      </div>
      <div class="flex-1 md:flex md:items-center">
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
           Ivan de Jesus Rojas Veliz
          </h6>
          <p class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700">
          ing.ivanrojas@gmail.com
        </p>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            18229563
          </h6>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            04121809294
          </h6>
        </div>
      </div>
      
    </div>
  </nav>
</div>



          {renderPagination()}
        </div>
      </div>