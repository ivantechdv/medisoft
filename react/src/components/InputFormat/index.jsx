export const formatRif = (value) => {
  let inputValue = value.toUpperCase(); // Convertir a mayúsculas
  inputValue = inputValue.replace(/[^VEJ\d]/g, ''); // Eliminar caracteres no permitidos

  if (!/^V|E|J/.test(inputValue)) {
    // Si no comienza con V, E o J, eliminar el primer carácter
    inputValue = inputValue.slice(1);
  }

  if (inputValue.length > 1) {
    // Si hay más de un carácter después del primero, aplicar el formato
    inputValue = `${inputValue.charAt(0)}-${inputValue
      .slice(1, 9)
      .replace(/\D/g, '')}-${inputValue.slice(9).replace(/\D/g, '')}`;
  } else {
    // Si solo hay un carácter (por ejemplo, solo 'V'), no hay necesidad de aplicar el formato
    inputValue =
      inputValue.charAt(0) === 'V' ||
      inputValue.charAt(0) === 'E' ||
      inputValue.charAt(0) === 'J'
        ? `${inputValue}-`
        : '';
  }

  return inputValue;
};
