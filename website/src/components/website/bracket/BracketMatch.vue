<template>
    <router-link :to="url('match', this.match)" class="bracket-match no-link-style" v-if="!!match"
                 v-bind:class="{'hover': hover, 'forfeit': match && match.forfeit }"
                 @mouseover.native="matchHover" @mouseleave.native="matchEmpty">
        <div class="match-name d-none">{{ match && match.name }}</div>
        <div class="match-number" v-bind:class="{'lowlight': lowlight}" v-if="matchNumber">{{ matchNumber }}</div>
        <div class="match-time" v-bind:class="{'lowlight': lowlight}" v-if="showTimes && friendlyStartTime">{{ friendlyStartTime }}</div>
        <div class="match-teams">
            <BracketTeam v-for="(team, i) in teams"
                         :team="team.id && team"
                         :text="team.dummy && team.text"
                         :short="team.dummy && team.short"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="displayScores[i]" :win="scores[i] === match.first_to"
            />
        </div>
        <transition name="fade">
            <div class="match-highlight-text" v-if="matchHighlight"
                 :data-side="matchHighlight.side" v-bind:class="{ 'feeder': matchHighlight.feeder }">
                {{ matchHighlight.text }}
                <i class="fas fa-chevron-down" v-if="matchHighlight.feeder && matchHighlight.text === 'Loser'"></i>
                <i class="fas fa-chevron-right" v-if="matchHighlight.feeder && matchHighlight.text !== 'Loser'"></i>
            </div>
        </transition>
    </router-link>
    <div v-else class="bracket-match bracket-match-spacer"
         @mouseover="matchHover" @mouseleave="matchEmpty">
        <div class="match-name d-none"></div>
        <div class="match-teams">
            <BracketTeam v-for="(team, i) in teams"
                         :team="team.id && team"
                         :text="team.dummy && team.text"
                         :short="team.dummy && team.short"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="displayScores[i]"
            />
        </div>
    </div>
</template>

<script>
import BracketTeam from "@/components/website/bracket/BracketTeam";
import { url } from "@/utils/content-utils";
import store from "@/thing-store";
import spacetime from "spacetime";

export default {
    name: "BracketMatch",
    components: { BracketTeam },
    props: ["match", "showTimes"],
    data: () => ({
        hover: false
    }),
    methods: {
        url,
        matchHover() {
            this.hover = true;
            // console.log(this.match);
            const connections = this?.match?._bracket_data?.connections;
            if (!connections) return;

            // const cons = [
            //     { id: connections.winner.id, text: "Winner advances here", side: connections.winner.side, number: connections.winner?.match_number },
            //     { id: connections.loser.id, text: "Loser drops to here", side: connections.loser.side, number: connections.loser?.match_number }
            // ];

            // connections.feederMatches.map(f => {
            //     cons.push({
            //         id: f.id,
            //         text: f._m,
            //         feeder: true
            //     });
            // });

            // store.commit("setHighlights", cons); // disable this for now
            store.commit("setHighlightedMatch", this.match.id);
        },
        matchEmpty() {
            this.hover = false;
            // console.log(this.match, "empty");
            store.commit("setHighlights", []);
            store.commit("setHighlightedMatch", null);
        },
        generateDummies(dummy, match) {
            // "1" and "2" come from the dot notation (eg "winner": "7.2")
            // so 1 is top/left, 2 is bottom/right

            const feederMatches = match?._bracket_data?.connections?.feederMatches;
            // console.log("cons", match?._bracket_data?.num, match?._bracket_data?.connections);
            if (!feederMatches || (!feederMatches["1"] && !feederMatches["2"])) return [dummy, dummy];
            const dummies = [dummy, dummy];
            if (feederMatches["1"]) {
                // console.log("f1", feederMatches["1"]);
                dummies[0] = {
                    ...dummy,
                    text: this.generateDummyText(feederMatches["1"])
                };
            }

            if (feederMatches["2"]) {
                // console.log("f2", feederMatches["2"]);
                dummies[1] = {
                    ...dummy,
                    text: this.generateDummyText(feederMatches["2"])
                };
            }

            // console.log("dummies", match._bracket_data.num, dummies);

            return dummies;
        },
        generateDummyText(match) {
            // console.log("dummy text", match);
            if (match?.teams?.length === 2 && match.teams.every(team => team.code)) {
                return `${match._m} of ${match.teams.map(team => team.code).join(" vs ")}`;
            }
            return `${match._m} M${match.side}`;
        }
    },
    computed: {
        matchNumber() {
            const localNumber = this.match?._bracket_data?.num;

            if (!this.match) return localNumber;
            return this.match.match_number || localNumber;
        },
        scores() {
            if (!this.match) return [null, null];
            if (!this.match.teams || this.match.teams.length !== 2) return [null, null];
            return [this.match.score_1, this.match.score_2];
        },
        displayScores() {
            if (this.match && this.match.first_to === 1 && this.match.maps?.length === 1) {
                const map = this.match.maps[0];
                if (map.id && (map.score_1 !== undefined && map.score_2 !== undefined)) {
                    if (this.shouldSwapTeams) return [map.score_2, map.score_1];
                    return [map.score_1, map.score_2];
                }
            }
            return this.scores;
        },
        teams() {
            const dummy = { text: "TBD", dummy: true, id: null };
            const dummies = this.generateDummies(dummy, this.match);
            if (!this.match) return [{ ...dummies[0], _empty: true }, { ...dummies[1], _empty: true }];
            // console.log("dummies", this.match._bracket_data.num, dummies);

            let text = (this.match.placeholder_teams || "").trim().split("|").filter(t => t !== "");
            let extraText = [null, null];

            if (text.length === 4) {
                extraText = [text[2], text[3]];
                text = [text[0], text[1]];
            }

            if (!this.match.teams || this.match.teams.length === 0) {
                if (text.length === 2) {
                    return text.map((t, i) => ({ ...dummies[i], text: t, short: extraText[i] }));
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [dummies[0], { ...dummies[1], text: text[0] }];
                    return [{ ...dummies[0], text: text[0], short: extraText[0] }, dummies[1]];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    return dummies;
                }
            }
            if (this.match.teams.length === 1) {
                if (text.length === 2) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummies[1], text: text[1], short: extraText[1] }];
                    return [{ ...dummies[0], text: text[0], short: extraText[0] }, this.match.teams[0]];
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummies[1], text: text[0], short: extraText[0] }];
                    return [{ ...dummies[0], text: text[0], short: extraText[0] }, this.match.teams[0]];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    if (this.match.placeholder_right) return [this.match.teams[0], dummies[1]];
                    return [dummies[0], this.match.teams[0]];
                }
            }

            if (this.match.teams.length === 2) return this.match.teams;
            return [];
        },
        matchHighlight() {
            return store.getters.getHighlight(this.match.id);
        },
        lowlight() {
            return !!store.state.highlighted_team;
        },
        friendlyStartTime() {
            if (!this.match.start) return null;
            const utc = spacetime(this.match.start);
            const time = utc.goto(this.activeTimezone);
            const diffFromNow = new Date(this.match.start) - new Date();

            if (diffFromNow <= 0) return null; // don't show on past matches (could be disabled)

            const clarifyDate = diffFromNow <= 0 || diffFromNow >= 1000 * 60 * 60 * 24 * 7;

            // eslint-disable-next-line no-unreachable
            const format = "{day-short}[D] {hour}[M]{ampm}"
                .replace("[M]", time.minute() === 0 ? "" : ":{minute-pad}")
                .replace("[D]", clarifyDate ? " {date-ordinal} {month-short}" : "");

            return time.format(format);
        },
        activeTimezone() {
            const stz = store.state.timezone;
            if (!stz || stz === "local") return spacetime.now().timezone().name;
            return stz;
        }
    }
};
</script>

<style scoped>
    .bracket-match {
        margin: 0.6em 0;
        position: relative;
        border: .125em solid transparent;
    }
    .bracket-match {
        transition: border-color .15s ease;
    }

    .match-highlight-text {
        position: absolute;
        background: white;
        color: black;
        bottom: 100%;
        z-index: 1;
        padding: 2px 8px;
    }

    .match-highlight-text[data-side="1"], .match-highlight-text[data-side="2"] {
        width: 100%;
        height: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .match-highlight-text[data-side="1"] {
        top: 0;
    }
    .match-highlight-text[data-side="2"] {
        bottom: 0;
    }
    .match-highlight-text.feeder {
        right: 0;
        left: auto;
        height: 100%;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .match-highlight-text.feeder  i {
        font-size: 2em;
        margin-top: .15em;
    }

    .match-number, .match-time {
        position: absolute;
        background: #333;
        text-align: center;
        bottom: 100%;
        font-size: 0.75em;
        line-height: 1;
        padding: 0 .3em;
        padding-bottom: .3em;
        color: white;
        border: 2px solid transparent;
        border-bottom: none;
        transition: opacity 150ms, border-color 150ms;
    }

    .match-number {
        left: 0;
    }
    .match-time {
        right: 0;
    }

    .bracket-match.hover,
    .bracket-match.hover .match-number,
    .bracket-match.hover .match-time {
        border-color:  rgba(255, 255, 255, 0.5);
    }
    .bracket-match:not(:hover) .match-number.lowlight,
    .bracket-match:not(:hover) .match-time.lowlight {
        opacity: 0.2;
    }
</style>
