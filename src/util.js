export const onFetchCache = (props) => {
  const url = `${props.location.pathname}.json?${props.location.search}`;
  return fetch(url).then(response => {
    if (response.status !== 200) throw new Error("Bad response from server");
    return response.json();
  });
};
