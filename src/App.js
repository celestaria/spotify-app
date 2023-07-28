import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + client_id + '&client_secret=' + client_secret
    };

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => {
        console.log(data);
        setAccessToken(data.access_token);
      })
      .catch(error => console.error(error));
  }, []);

  async function search() {
    setIsLoading(true);
    console.log("Search for " + searchInput);
  
    var searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken 
      }
    };
    
    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
      .then(response => response.json())
      .then(data => {
        return data.artists.items[0]?.id || null;
      })
      .catch(error => {
        console.error("Error fetching artist:", error);
        setIsLoading(false);
        return null;
      });
      
    console.log("Artist ID is " + artistID);
  
    if (artistID) {
      fetch("https://api.spotify.com/v1/artists/" + artistID + "/albums", {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data.items)) {
          console.log("Albums data:", data);
          setAlbums(data.items);
        } else {
          console.error("Invalid data format - items is not an array");
          setAlbums([]); // Reset the albums state to an empty array
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching albums:", error);
        setAlbums([]);
        setIsLoading(false);
      });
    } else {
      setAlbums([]);
      setIsLoading(false);
    }
  }
  
  return (  
  <div className="App">
  <Container>
    <InputGroup className="mb-3" size="lg">
    <FormControl
            placeholder="Search for Artist"
            type="input"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>Search</Button>
    </InputGroup>
  </Container>
  <Container>
    <Row className="mx-2 row row-cols4">
      {albums && albums.length > 0 ? (
          albums.map((album, i) => {
            console.log("Album:", album);
          return (
            <Card key={i}>
              <Card.Body>
                <Card.Title>{album.name}</Card.Title>
              </Card.Body>
              <Card.Img src={album.images.length > 0 ? album.images[0].url : ''} />
            </Card>
          );
        })
          ) : (
            <p>No albums found.</p>
          )}
    </Row>
  </Container>
</div>
);
}

export default App;