import { useState, useEffect } from "react";
import { loginUrl, getTokenFromUrl } from "./SpotifyAuth";
import SpotifyWebApi from "spotify-web-api-js";

const spotify = new SpotifyWebApi();

const Login = () => {
  const [username, setUsername] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState("");
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const _spotifyToken = getTokenFromUrl().access_token;
    window.location.hash = "";

    console.log("token: ", _spotifyToken);
    if (_spotifyToken) {
      setSpotifyToken(_spotifyToken);
      spotify.setAccessToken(_spotifyToken);
      spotify.getMe().then((user) => {
        setWelcomeMessage(`Welcome ${user.display_name}`);
        console.log("this is you: ", user);
      });
      spotify.getMyTopArtists().then((artists) => {
        console.log("artists: ", artists);
        setTopArtists(artists.items);
      });
      spotify.getMyTopTracks({ limit: 50 }).then((tracks) => {
        console.log("tracks: ", tracks);
        setTopTracks(tracks.items);
      });
    }
    if (isTyping) {
      return;
    }
    loadMessage(username);
    console.log(username);
  }, [username, isTyping]);

  function DisplayTopArtists(topArtists) {
    return topArtists.map((artist, i) => {
      return (
        <div key={artist.id}>
          <img src={artist.images[0].url} alt={artist.name} />
          <p>{i + 1 + ". " + artist.name}</p>
        </div>
      );
    });
  }

  function DisplayTopTrackDates(topTracks) {
    return topTracks.map((track, i) => {
      return (
        <div key={track.id}>
          <p>{i + 1 + ". " + track.name}</p>
          <p>{track.album.release_date}</p>
        </div>
      );
    });
  }

  const loadMessage = (username) => {
    setWelcomeMessage(`Welcome ${username}`);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setIsTyping(false);
  };

  const userNameForm = (
    handleFormSubmit,
    username,
    setIsTyping,
    setUsername
  ) => {
    return (
      <form className="" onSubmit={handleFormSubmit}>
        <label>
          Name:
          <input
            className="bg-blue-50"
            type="text"
            placeholder="username"
            value={username}
            name="name"
            onChange={(e) => {
              setIsTyping(true);
              setUsername(e.target.value);
            }}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-10 w-1/2 pt-10">
        <div>{welcomeMessage}</div>
        <a href={loginUrl}>Login with Spotify</a>
        {DisplayTopArtists(topArtists)}
        {DisplayTopTrackDates(topTracks)}
      </div>
    </div>
  );
};

export default Login;
