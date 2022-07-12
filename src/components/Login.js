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
  const [topTracksMedium, setTopTracksMedium] = useState([]);
  const [topTracksShort, setTopTracksShort] = useState([]);
  const [topTracksLong, setTopTracksLong] = useState([]);
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const playlistIDs = new Set();
  const extendedTracks = new Set();
  const years_extended = {};

  const years_short = {};
  const years_medium = {};
  const years_long = {};

  useEffect(() => {
    const _spotifyToken = getTokenFromUrl().access_token;
    window.location.hash = "";

    if (_spotifyToken) {
      console.log("token: ", _spotifyToken);
      setSpotifyToken(_spotifyToken);
      spotify.setAccessToken(_spotifyToken);
      spotify.getMe().then((user) => {
        setWelcomeMessage(`Welcome ${user.display_name}`);
        console.log("this is you: ", user);
        setUser(user);
        setUsername(user.display_name);
        console.log("this is your username: ", username);
        console.log("this is your id: ", user.id);
      });
      spotify.getMyTopArtists().then((artists) => {
        console.log("artists: ", artists);
        setTopArtists(artists.items);
      });
      spotify.getMyTopTracks({ limit: 50 }).then((tracks) => {
        console.log("tracks: ", tracks);
        setTopTracksMedium(tracks.items);
      });
      spotify
        .getMyTopTracks({ limit: 50, time_range: "short_term" })
        .then((tracks) => {
          console.log("tracks: ", tracks);
          setTopTracksShort(tracks.items);
        });
      spotify
        .getMyTopTracks({ limit: 50, time_range: "long_term" })
        .then((tracks) => {
          console.log("tracks: ", tracks);
          setTopTracksLong(tracks.items);
        });
    }
    if (user) {
      spotify
        .getUserPlaylists({ limit: 50, user: user.id })
        .then((playlists) => {
          console.log("playlists: ", playlists);
          setPlaylists(playlists.items);
        })
        .catch((err) => {
          console.log("error: ", err);
        });
      // spotify.getPlaylistTracks()
    }
    if (isTyping) {
      return;
    }
    loadMessage(username);
    console.log(username);
  }, [username, isTyping, user]);

  function DisplayTopArtists(topArtists) {
    return topArtists.map((artist, i) => {
      return (
        <div key={artist.id}>
          <img src={artist.images[2].url} alt={artist.name} />
          <p>{i + 1 + ". " + artist.name}</p>
        </div>
      );
    });
  }

  function ProcessTrackDates(topTracks, years) {
    for (let i = 0; i < topTracks.length; i++) {
      if (
        years[topTracks[i].album.release_date.substring(0, 4)] === undefined
      ) {
        years[topTracks[i].album.release_date.substring(0, 4)] = 1;
      } else {
        years[topTracks[i].album.release_date.substring(0, 4)]++;
      }
    }
  }

  function ProcessAllTrackDates(
    topTracksMedium,
    topTracksShort,
    topTracksLong
  ) {
    ProcessTrackDates(topTracksMedium, years_medium);
    ProcessTrackDates(topTracksShort, years_short);
    ProcessTrackDates(topTracksLong, years_long);
    // console.log("short: ", years_short);
    // console.log("medium: ", years_medium);
    // console.log("long: ", years_long);
  }

  function DisplayTopTrackDates(topTracks) {
    return topTracks.map((track, i) => {
      return (
        <div key={track.id}>
          <img src={track.album.images[2].url} alt={track.album.name} />
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

  const ProcessExtendedTracks = (playlists) => {
    if (playlists.length == 0) return;
    var sum = 0;
    for (let i = 0; i < playlists.length; i++) {
      sum += playlists[i].tracks.total;
      var new_id = playlists[i].id;
      // console.log(new_id);
      playlistIDs.add(new_id);
    }
    console.log(playlistIDs);

    for (const item of playlistIDs) {
      spotify.getPlaylistTracks(item).then((tracks) => {
        // console.log("extended get tracks: ", tracks);
        for (let i = 0; i < tracks.items.length; i++) {
          extendedTracks.add(tracks.items[i].track.name);

          if (
            years_extended[
              tracks.items[i].track.album.release_date.substring(0, 4)
            ] === undefined
          ) {
            years_extended[
              tracks.items[i].track.album.release_date.substring(0, 4)
            ] = 1;
          } else {
            years_extended[
              tracks.items[i].track.album.release_date.substring(0, 4)
            ]++;
          }
        }
        // extendedTracks.add(tracks)
      });
    }
    console.log(" extended tracks: ", extendedTracks);
    console.log("extended years: ", years_extended);

    return `${sum} tracks extended but really not `;
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-10 w-1/2 pt-10">
        <div>{welcomeMessage}</div>
        <a href={loginUrl}>Login with Spotify</a>
        {ProcessExtendedTracks(playlists)}
        {DisplayTopArtists(topArtists)}
        {DisplayTopTrackDates(topTracksMedium)}
        {ProcessAllTrackDates(topTracksMedium, topTracksShort, topTracksLong)}
      </div>
    </div>
  );
};

export default Login;
