import React, {useState, useEffect, useCallback} from 'react';
import './App.css';
import axios from 'axios';
import * as api from './api';
import {BrowserRouter, Switch, Route, NavLink, useParams, useHistory} from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';
import Loading from './components/Loading';
import Error from './components/Error';

const ResturantDetails = React.memo(({resturants}) => {
    const [resturant, setResturant] = useState(null);

    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        const id = params.id;
        if(id < resturants.length)
        {
            setResturant(resturants[id]);
        }
        else 
        {
            history.push('/');
        }
    }, [params, resturants]);

    if(!resturant)
    {
        return (<Loading />);
    }

    return (
        <div className="resturant-details-container">
            <div className="resturant-details">
                <div className="resturant-details__brand-with-back">
                    <NavLink to="/" className="resturant-details__back">
                        <ArrowBackIcon />
                    </NavLink>
                    <div className="resturant-details__brand">
                        {resturant.Brand}
                    </div>
                </div>
                {resturant.image && <img src={resturant.image} alt="Image" title="Image" className="resturant-details__img" />}
                <div className="resturant-details__variety">
                    Variety: {resturant.Variety}
                </div>
                <div className="resturant-details__style">
                    Style: {resturant.Style}
                </div>
                <div className="resturant-deatils__country">
                    Country: {resturant.Country}
                </div>
                <div className="resturant-details__stars">
                    Stars: { ["NaN", "Nan"].includes(resturant.Stars)  ? 'N/A' : resturant.Stars}
                </div>
                <div className="resturant-details__top-ten">
                    Top Ten: { ["NaN", "Nan"].includes(resturant["Top Ten"]) ? 'N/A':  resturant["Top Ten"] }
                </div>
            </div>
        </div>
    );

});


const ResturantCard = React.memo(({resturant}) => {

    return (
        <div className="resturant">
            <div className="resturant__brand">
                {resturant.Brand}
            </div>
            {resturant.image && <img src={resturant.image} alt="Image" title="Image" className="resturant__img" />}
            <div className="resturant__variety">
                Variety: {resturant.Variety}
            </div>
            <div className="resturant__style">
                Style: {resturant.Style}
            </div>
            <div className="resturant__country">
                Country: {resturant.Country}
            </div>
            <div className="resturant__stars">
                Stars: { ["NaN", "Nan"].includes(resturant.Stars) ? 'N/A' : resturant.Stars}
            </div>
            <div className="resturant__top-ten">
                Top Ten: { ["NaN", "Nan"].includes(resturant["Top Ten"])  ? 'N/A':  resturant["Top Ten"] }
            </div>
        </div>
    );
});

const ResturantList = ({resturants}) => {
    const [searchedResturants, setSearchedResturants] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchInputElem, setSearchInputElem] = useState(null);

    useEffect(() => {
        setSearchedResturants(resturants);
    }, [resturants]);

    const getSearchInputElem = useCallback(elem => {
        setSearchInputElem(elem);
    }, []);

    useEffect(() => {
        if(searchInputElem)
        {
            searchInputElem.focus();
        }
    }, [searchInputElem]);

    const handleChange = e => {
        const value = e.target.value;
        if(value === ' ')
        {
            return;
        }
        setSearchInput(value);

        if(value === '')
        {
            setSearchedResturants(resturants);
            return;
        }

        const _searchedResturants = [];
        const valueSet = new Set(value.toString().toLowerCase().split(''));
        resturants.forEach(resturant => {
            const brandSet = new Set(resturant.Brand.toString().toLowerCase().split(''));
            const intersection = [...valueSet].filter(ch => {
                    if(brandSet.has(ch))
                    {
                        return true;
                    }
                    return false;
                });
                if(intersection.length === [...valueSet].length)
                {
                    _searchedResturants.push(resturant);
                }    
            });
            setSearchedResturants([..._searchedResturants]);
    }

    const handleSort = e => {
        
        const sortedResturants = [...resturants].sort((resturant1, resturant2) => {
            
            if(typeof resturant1.Stars !== 'number')
            {
                return -1;
            }
            if(typeof resturant2.Stars !== 'number')
            {
                return -1;
            }

            return (resturant2.Stars - resturant1.Stars);
        });
        const naResturants = [];
        let _sortedResturants = [];
        sortedResturants.forEach(sortedResturant => {
            if(["NaN", "Nan"].includes(sortedResturant.Stars))
            {
                naResturants.push(sortedResturant);
            }
            else 
            {
                _sortedResturants.push(sortedResturant);
            }
        });
        _sortedResturants = [..._sortedResturants, ...naResturants];
        setSearchedResturants(_sortedResturants);
    }


    return (
        <div className="resturant-list">
            <div className="search-sort">
                <div className="search">
                    <div className="search__icon">
                        <SearchIcon />
                    </div>
                    <input type="text" ref={getSearchInputElem} className="search__text" placeholder="Search by brand" value={searchInput} onChange={handleChange} />
                </div>
                <button className="sort-btn" onClick={handleSort}>Sort by star</button>
            </div>
            <div className="resturants">
                {searchedResturants.map((resturant, index) => (
                    <NavLink to={`/resturant/${resturant.id}`} key={index}>
                        <ResturantCard  resturant={resturant} />
                    </NavLink>
                ))}
            </div>
        </div>);
}


const Resturant = props => {
    const [resturants, setResturants] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        
        const fetchResturants = async () => {
            try 
            {
                setLoading(true);
                const headers = {
                    responseType: 'json'
                };
                const {data} = await axios.get( api.PROXY + api.RESTURANT_API, {headers});
                setResturants(data.map((resturant, index) => ({
                    id: index,
                    ...resturant
                })));
                const {data: _images} = await axios.get(api.PROXY + api.IMAGES_API, {headers});
                setImages(_images);
            }
            catch(err)
            {
                setError(err.message);
            }
            finally 
            {
                setLoading(false);
            }
        }

        fetchResturants();
    }, []);

    const getRandom = useCallback(() => {
        const min = 0;
        const max = images.length - 1;
        const rand = Math.floor(min + Math.random()*(max - min + 1));
        return rand;
    }, [images]);

    useEffect(() => {
        if(images.length > 0)
        {
            setResturants(prevResturants => prevResturants.map(prevResturant => ({image: images[getRandom()].Image, ...prevResturant })))
        }
      
    }, [images]);

    if(loading)
    {
        return (<Loading />);
    }

    if(error)
    {
        return (<Error error={error} />);
    }

    return (
        <Switch>
            <Route path="/resturant/:id">
                <ResturantDetails resturants={resturants} />
            </Route>
            <Route path="/">
                <ResturantList resturants={resturants} />
            </Route>
        </Switch>
    );
}


function App() {
    return (
            <BrowserRouter>
                <Resturant />
            </BrowserRouter>
            );
}

export default App;
