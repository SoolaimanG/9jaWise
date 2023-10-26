export const fetchData = async function (url: string) {
  try {
    const res: Response = await fetch(url);

    return res;
  } catch (error) {
    return Promise.reject(error);
  }
};
