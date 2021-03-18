import { remote } from "electron";
import uuid from "uuid/v1";
import db from "./../../datastore";
import { getSearchSuggest } from "./../../api/search";
import { normalSong } from "../../utils/song";
const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");
const avatarIcon = "images/default_album.jpg";

function isSongInArray(song, arr) {
    return arr.findIndex((item) => item.id == song.id) >= 0;
}
export default {
    namespaced: true,
    state: {
        localSongs: [],
        exportFolders: [`${remote.app.getPath("music")}`],
    },
    mutations: {
        clear(state) {
            state.localSongs = [];
        },
        set(state, songs) {
            state.localSongs = songs;
        },
        add(state, song) {
            state.localSongs.push(song);
        },
        setExportFolders(state, arr) {
            state.exportFolders = arr;
        },
        mutateState(state, payload) {
            for (let k in payload) {
                state[k] = payload[k];
            }
        },
    },
    actions: {
        async match({ state, commit }) {
            try {
                let localSongs = state.localSongs.slice();
                for (let i = 0; i < localSongs.length; i++) {
                    let song = localSongs[i];
                    let res = await getSearchSuggest(song.name);
                    let songs = res.result.songs;

                    if (songs && songs.length) {
                        let suggest =
                            songs.find((item) => {
                                let artistArr = song.artist.map((artist) =>
                                    artist.name.trim()
                                );
                                return item.artists.every((artist) =>
                                    artistArr.includes(artist.name)
                                );
                            }) || songs[0];

                        suggest = normalSong(suggest);
                        localSongs[i] = {
                            ...song,
                            ...suggest,
                            url: song.url,
                            matched: true,
                        };
                    }
                }
                commit("set", localSongs);
            } catch (error) {
                console.log("match error:", error);
            }
        },
        async refresh({ state, commit, dispatch, rootState }, selectedFolders) {
            let folders =
                selectedFolders && selectedFolders.length
                    ? selectedFolders
                    : state.exportFolders;
            let songs = [];
            for (let folder of folders) {
                try {
                    const dirs = fs.readdirSync(folder);
                    for (let item of dirs) {
                        const pathname = path.join(folder, item);
                        const stat = fs.statSync(pathname);
                        if (stat.isFile()) {
                            if (item.endsWith(".mp3")) {
                                const metadata = await mm.parseFile(pathname, {
                                    duration: true,
                                });

                                let songname = item
                                    .substring(0, item.lastIndexOf("."))
                                    .trim();
                                let artist = [],
                                    name = songname,
                                    matched = false;
                                if (
                                    songname.split("-")[0] &&
                                    songname.split("-")[1]
                                ) {
                                    artist = songname
                                        .split("-")[0]
                                        .split(",")
                                        .map((item) => {
                                            return { name: item };
                                        });
                                    name = songname.split("-")[1].trim();
                                    matched = false;
                                }
                                let extraItem = {
                                    artist,
                                    name,
                                    matched,
                                };

                                // console.log(name, artist, metadata)
                                const songItem = {
                                    id: uuid(),
                                    avatar: avatarIcon,
                                    album: metadata.common.album || "",
                                    artist: metadata.common.artists
                                        ? metadata.common.artists.map(
                                              (item) => {
                                                  return { name: item };
                                              }
                                          )
                                        : artist,
                                    duration:
                                        parseInt(metadata.format.duration) || 0,
                                    url: pathname,
                                    folder,
                                    size: stat.size,
                                };
                                songs.push(Object.assign(songItem, extraItem));
                            }
                        }
                    }
                } catch (err) {
                    alert("下载失败" + err);
                }
            }
            console.log("localSongs:", songs);
            commit("mutateState", { localSongs: songs });
            // dispatch('match')
        },
    },
};
