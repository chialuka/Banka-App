const request = async (url, options) => {
  const response = (await fetch(url, options)).json();
  return response;
}