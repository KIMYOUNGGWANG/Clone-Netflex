import { motion,AnimatePresence ,useViewportScroll, MotionValue } from "framer-motion";
import { url } from "inspector";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { IGetMoviesResults } from "../@types/api";
import { getMovie, getMovies } from "../apis/api";
import { makeImagePath } from "./utils";

const rowVariants = {
  hidden:{
    x: window.outerWidth + 5,
  },
  visible:{
    x:0,
  },
  exit:{
    x:-window.outerWidth - 5
  },
}

const BoxVariants = {
  nomal : {
    scale:1,
  },
  hover:{
    scale:1.3,
    y:-50,
    transition:{
      delay:0.5,
      type:"tween"
    },
  }
}

const InfoVariants = {
  hover:{
    opacity:1,
    transition:{
      delay:0.5,
      type:"tween"
    }
  }
}

const offset = 6;


const Home = () => {
  const bigMovieMatch = useRouteMatch<{movieId:string}>("/movies/:movieId");
  const {data,isLoading} = useQuery<IGetMoviesResults>(["movies","nowPlaying"],getMovies);
  const history = useHistory();
  const [idx, setIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const {scrollY} = useViewportScroll();
  const incraseIdx = () => {
    if(data){
    if(leaving) return;
    toggleLeaving();
    const totalMovis = data.results.length - 1;
    const maxIndex = Math.ceil(totalMovis / offset) - 1;
    setIdx(prev => prev===maxIndex ? 0 : prev+1)
  }
  }

  const toggleLeaving = () => setLeaving(prev=>!prev)
  const onBoxClicked = (movieId:number) => {
    history.push(`/movies/${movieId}`)
  }
  const clickedMovie = bigMovieMatch?.params.movieId && data?.results.find(movie=>movie.id === +bigMovieMatch.params.movieId);

return <Container  >
    {isLoading 
    ? 
      <Loader>Loading...</Loader>
      :
      <>
        <Banner onClick={incraseIdx} bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}>
          <Title>{data?.results[0].title}</Title>
          <OverView>{data?.results[0].overview}</OverView>
        </Banner>
        <Slider>
          <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
            <Row 
            variants={rowVariants} 
            initial="hidden" 
            animate="visible" 
            exit="exit"
            transition={{type:"tween", duration:0.5}} 
            key={idx}>
              {
                data?.results.slice(1).slice(offset*idx, offset*idx+offset).map(movie=>{
                  return <Box 
                  key={movie.id}
                  variants={BoxVariants}
                  initial="normal"
                  whileHover="hover"
                  transition={{type:"tween"}}
                  bgPhoto={makeImagePath(movie.backdrop_path || "")}
                  onClick={()=>onBoxClicked(movie.id)}
                  layoutId={movie.id+""}
                  >
                    <Info 
                    variants={InfoVariants}
                    >
                      <h4>{movie.title}</h4></Info>                
                  </Box>
                })
              }
            </Row>
          </AnimatePresence>
        </Slider>
        <AnimatePresence>
        {bigMovieMatch 
        ? 
          <>
            <Overlay onClick={()=>history.push('/')} animate={{opacity:1}} exit={{opacity:0}}/>
              <BigMovie layoutId={bigMovieMatch.params.movieId+""} top={scrollY}>
               {clickedMovie && 
                <>
                  <BigCover style={{backgroundImage:`linear-gradient(to top, black, transparent), url(${makeImagePath(clickedMovie.poster_path,"w500")})` }}  />
                  <BigTitle>{clickedMovie.title}</BigTitle>
                  <BigOverview>{clickedMovie.overview}</BigOverview>
                </>}
              </BigMovie>
          </>
        :
        null}
        </AnimatePresence>
      </>}
  </Container>;
};

export default Home;

const Container = styled.div`
  background-color: black;
  height: 200vh;
`;

const Banner = styled.div<{bgPhoto:string}>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding:60px;
  background-image:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,1)) , url(${props=>props.bgPhoto});
  background-size: cover;
`;
const Title = styled.h2`
font-size: 68px;
margin-bottom: 20px;
`;

const OverView = styled.p`
  font-size: 36px;
  width: 50%;
`;

const Loader = styled.div`
height: 20vh;
display: flex;
justify-content: center;
align-items: center;
`;

const Slider = styled.div`
  position: relative;
  top:-220px;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6,1fr);
  margin-bottom: 5px;
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{bgPhoto:string}>`
  height: 200px;
  background-image: url(${props=>props.bgPhoto});
  background-size: cover;
  background-position: center center;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
  `;

const Info = styled(motion.div)`
  position: absolute;
  width: 100%;
  bottom: 0;
  padding:10px;
  background-color: ${props=>props.theme.black.lighter};
  opacity: 0;
  h4{
    text-align: center;
    font-size: 18px;
  }
 `;

 const Overlay = styled(motion.div)`
  position: fixed;
  top:0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  opacity: 0;
 `;


const BigMovie = styled(motion.div)<{top:MotionValue<number>}>`
position: absolute;
width: 40vw;
height: 80vh;
top:${props=>props.top.get()+150}px;
left: 0;
right: 0;
margin:0 auto;
background-color :${props=>props.theme.black.lighter};
border-radius: 15px;
overflow: hidden;
`;

const BigCover = styled.div`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center center;
`;

const BigTitle = styled.h3`
  color: ${props=>props.theme.white.lighter};
  padding:10px;
  font-size: 46px;
  position: relative;
  top:-60px;
`;

const BigOverview = styled.p`
  position: relative;
  padding:20px;
  top:-60px;
  color: ${props=>props.theme.white.lighter};

`