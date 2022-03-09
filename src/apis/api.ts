const API_KEY = "92fa4390471a1de1f6bde50bb01ee5ba";
const BASE_PATH = "https://api.themoviedb.org/3"

export const getMovies = () => {
    return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`)
    .then(res=>res.json())
}

export const getMovie = (id:string|null) => {
    return fetch(`${BASE_PATH}/movie/${id}`)
    .then(res=>res.json())
}