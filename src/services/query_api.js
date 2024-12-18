import axios from "axios";

export const buscarNoticias = async (query) => {
  const apiUrl = "http://hn.algolia.com/api/v1/search_by_date?";

  try {
    const response = await axios.get(apiUrl, {
      params: {
        query: `"${query}"`,
        restrictSearchableAttributes: "title",
        tags: "story",
        hitsPerPage: 100,
        // Filtra para que no salgan cosas que tenga la etiqueta story además de otras como ask_hn
        filters: "NOT _tags:ask_hn AND NOT _tags:show_hn AND NOT _tags:poll AND NOT _tags:comment",
      },
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error en la búsqueda de noticias", error);
    return null;
  }
};
