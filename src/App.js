import './App.scss';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';

function App() {
  const [apidata, setApidata] = useState(null);
  const [apidataBool, setApidataBool] = useState(false);
  const [input, setInput] = useState(``);
  const [searchData, setSearchData] = useState(null);
  const [coinOffset, setCoinOffset] = useState(0);
  const [orderBy, setOrderBy] = useState('');
  const [direction, setDirection] = useState('');

  const inputChange = (event) => {
    const value = event.target.value;
    setInput(value);
  }

  //hide or show a div for searched coins
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const displaySearchDiv = (event) => {
    const div = document.getElementById("searchDiv");
    div.addEventListener('mouseenter', () => div.style.display = "block")
    div.addEventListener('mouseleave', () => div.style.display = "none")

    if(event.type === "mouseenter"){
      div.style.display = "block";
    }

    if(event.type === "mouseleave"){
      div.style.display = "none";
    }
    
  }

  //get first 50 coins from api
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~
  useEffect(() => {
    //https://api.coinranking.com/v2/coins?offset=50
    const url = `https://api.coinranking.com/v2/coins?offset=${coinOffset}${orderBy}${direction}`;
    const options = {
      headers: {
        'Content-Type': 'coinrankingc3dadf911e099b1e510741086f18a86dc52502409e0122e3',
        // 'x-access-token': 'your-access-token-here',
      }
    };
    fetch(url, options)
      .then(response => {
        if(response.ok){
          return response.json()
        }
        throw response;
      })
      .then(data => {
        setApidata(data);
      })
      .catch(error => {
        console.error("Error fetching data: ", error)
      })
  }, [coinOffset, orderBy, direction])

  useEffect(() => {
    const url = `https://api.coinranking.com/v2/search-suggestions?query=${input}`;
    const options = {
      headers: {
        'Content-Type': 'coinrankingc3dadf911e099b1e510741086f18a86dc52502409e0122e3',
        // 'x-access-token': 'your-access-token-here',
      }
    };
    fetch(url, options)
      .then(response => {
        if(response.ok){
          return response.json()
        }
        throw response;
      })
      .then(data => {
        setSearchData(data);
      })
      .catch(error => {
        console.error("Error fetching data: ", error)
      })
  }, [input])

  useEffect(() => {
    if(apidata != null){
      setApidataBool(true);
      console.log(apidata);
    }
  }, [apidata])
  
  return (
    <div className="container-fluid bg-light">
      <h1 className='text-center'>CryptoRanking</h1>
      {apidataBool ? <DisplayGlobalStats data={apidata}/> : "Loading..."}
      <div className='container-fluid'>
        <div className='row m-1'>
          <input className="form-control my-2 col" id="coinSearchInput" type="text" placeholder="Search" value={input} onChange={inputChange} onMouseEnter={displaySearchDiv} onMouseLeave={displaySearchDiv}/>
        </div>
        <div id="searchDiv" className='container'>
        {searchData ? <DisplaySearchedCoins data={searchData}/> : "Loading..."}
      </div>
      </div>
      <div className='container-fluid'>
        <div className='row m-1 bg-primary text-light align-items-center border border-primary rounded'>
          <div className='col'>Coins</div>
          <div className='col text-center'>Price
            <button className='btn btn-sm'  onClick={() => {setOrderBy('&orderBy=price'); setDirection('&orderDirection=asc')}}>🔼</button>
            <button className='btn btn-sm'  onClick={() => {setOrderBy('&orderBy=price'); setDirection('&orderDirection=desc')}}>🔽</button>
          </div>
          <div className='col text-center'>Marketcap
            <button className='btn btn-sm'  onClick={() => {setOrderBy('&orderBy=marketCap'); setDirection('&orderDirection=asc')}}>🔼</button>
            <button className='btn btn-sm'  onClick={() => {setOrderBy('&orderBy=marketCap'); setDirection('&orderDirection=desc')}}>🔽</button>
          </div>
          <div className='col text-center' id="hChange">24h
            <button className='btn btn-sm'  onClick={() => {setOrderBy('&orderBy=change'); setDirection('&orderDirection=asc')}}>🔼</button>
            <button className='btn btn-sm'  onClick={() => {setOrderBy('&orderBy=change'); setDirection('&orderDirection=desc')}}>🔽</button>
          </div>
        </div>
      </div>
      {apidataBool ? <DisplayCoins data={apidata}/> : "Loading..."}
      <div className='container-fluid'>
        <div className='row m-1'>
          <button className="btn col btn-outline-primary" onClick={() => setCoinOffset(coinOffset => coinOffset - 50)} disabled={coinOffset === 0 ? true : false}>◀</button>
          <button className="btn col btn-outline-primary" onClick={() => setCoinOffset(coinOffset => coinOffset + 50)}>▶</button>
        </div>
      </div>
      
    </div>
  );
}

//display the first 50 coins from state data
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function DisplayCoins({data}){
  return (
    <div className='container-fluid'>
      {data.data.coins.map(coin => (<div key={'div' + coin.name + coin.uuid} className='row bg-primary m-1 align-items-center text-light border border-primary rounded'>
                                      <div className='col' key={'name' + coin.name + coin.uuid}>
                                        <div className='row align-items-center'>
                                          <div className='col'>{coin.rank}</div>
                                          <div className='col'><img key={coin.iconUrl + coin.uuid} width="25px" src={coin.iconUrl}></img></div>
                                          <div className='col'>{coin.name}<br></br><span className='fw-light'>{coin.symbol}</span></div>
                                        </div>
                                      </div>
                                     
                                      <div className='col text-center' key={coin.price + coin.uuid}>${coin.price < 1 ? parseFloat(coin.price).toFixed(6) : parseFloat(coin.price).toFixed(2)}</div>
                                      <div className='col text-center' key={coin.marketCap + coin.uuid}>${ParseBigNum(coin.marketCap)}</div>
                                      <div className='col text-center' key={coin.change + coin.uuid} id={coin.change > 0 ? "positive" : "negative"}>{coin.change > 0 ? '+' + coin.change + '%' : coin.change + '%'}</div>
                                    </div>))}
    </div>
  );
}

//display the searched coins from state searched data
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function DisplaySearchedCoins({data}){
  return(
    <div className='container'>
      {data.data.coins.map(coin => (
        <div key={'searchedDiv' + coin.name + coin.uuid} className='row bg-secondary m-1'>
          <div className='col'><img key={'searchedIcon' + coin.iconUrl + coin.uuid} width="25px" src={coin.iconUrl}></img></div>
          <div className='col-4' key={'searchedName' + coin.name + coin.uuid}>{coin.name}</div>
          <div className='col-4' key={'searchedSymbol' + coin.symbol + coin.uuid}>{coin.symbol}</div>
          <div className='col-3' key={'searchedPrice' + coin.price + coin.uuid}>${parseFloat(coin.price).toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

//display global crypto stats
//~~~~~~~~~~~~~~~~~~~~~~~~~~~
function DisplayGlobalStats({data}){
  const stats = data.data.stats
  return(
    <div className="row text-center bg-primary-subtle">
      <span className="col">total coins: {stats.totalCoins}</span>
      <span className="col">24h trading volume: ${ParseBigNum(stats.total24hVolume)}</span>
      <span className="col">marketcap: ${ParseBigNum(stats.totalMarketCap)}</span>
    </div>
  );
}

//parse large numbers
//~~~~~~~~~~~~~~~~~~~~~~~~~~~
function ParseBigNum(num){
  const value = parseFloat(num);
  if(value >= 1000000000000){
    return parseFloat(value / 1000000000000).toFixed(2) + " trillion";
  }
  else if(value >= 1000000000){
    return parseFloat(value / 1000000000).toFixed(2) + " billion";
  }
  else if(value >= 1000000){
    return parseFloat(value / 1000000).toFixed(2) + " million";
  }
  else{
    return parseFloat(value).toFixed(2);
  }
}

export default App;
